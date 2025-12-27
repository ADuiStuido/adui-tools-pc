use std::time::{Duration, SystemTime, UNIX_EPOCH};

use base64::{engine::general_purpose, Engine as _};
use reqwest::{multipart, Client};
use serde::{Deserialize, Serialize};
use serde_json::json;
use tauri::State;
use tokio::sync::Mutex;

use crate::{
  db::DbPool,
  error::AppError,
  settings::{ApiKeysForm, NetworkProxyForm, ProxyMode, ProxyProtocol},
};

/// ======= 百度 API endpoints（来自你给的 PDF）=======
/// 文本翻译（通用版）
/// POST https://aip.baidubce.com/rpc/2.0/mt/texttrans/v1?access_token=xxx :contentReference[oaicite:6]{index=6}
///
/// 文档翻译创建
/// POST https://aip.baidubce.com/rpc/2.0/mt/v2/doc-translation/create?access_token=xxx :contentReference[oaicite:7]{index=7}
///
/// 文档翻译查询
/// POST https://aip.baidubce.com/rpc/2.0/mt/v2/doc-translation/query?access_token=xxx :contentReference[oaicite:8]{index=8}
///
/// 图片翻译（multipart）
/// POST https://aip.baidubce.com/file/2.0/mt/pictrans/v1?access_token=xxx :contentReference[oaicite:9]{index=9}

const BAIDU_OAUTH_URL: &str = "https://aip.baidubce.com/oauth/2.0/token";
const BAIDU_TEXTTRANS_URL: &str = "https://aip.baidubce.com/rpc/2.0/mt/texttrans/v1";
const BAIDU_DOC_CREATE_URL: &str = "https://aip.baidubce.com/rpc/2.0/mt/v2/doc-translation/create";
const BAIDU_DOC_QUERY_URL: &str = "https://aip.baidubce.com/rpc/2.0/mt/v2/doc-translation/query";
const BAIDU_PICTRANS_URL: &str = "https://aip.baidubce.com/file/2.0/mt/pictrans/v1";

/// token 有效期 30 天，建议提前一点刷新:contentReference[oaicite:10]{index=10}
const TOKEN_REFRESH_SAFETY_WINDOW: Duration = Duration::from_secs(60 * 60 * 24); // 提前 1 天刷新

#[derive(Debug)]
pub struct BaiduTokenState {
  pub inner: Mutex<Option<CachedToken>>,
}

#[derive(Debug, Clone)]
struct CachedToken {
  access_token: String,
  expires_at_unix: u64,
}

/// ======= 前端调用参数 / 返回 =======

#[derive(Debug, Deserialize)]
pub struct TextTranslatePayload {
  pub q: String,
  pub from: String, // 可传 "auto"
  pub to: String,
  pub term_ids: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct TextTranslateResult {
  pub from: String,
  pub to: String,
  pub dst: String, // 拼接后的译文（按段落用 \n 拼）
  pub raw: serde_json::Value, // 保留原始响应，方便你调试
}

#[derive(Debug, Deserialize)]
pub struct PicTranslatePayload {
  /// 图片二进制（前端用 Uint8Array 传 Vec<u8>）
  pub image: Vec<u8>,
  /// "image/png" | "image/jpeg" | "image/webp"（doc 要求小写）:contentReference[oaicite:11]{index=11}
  pub mime: String,
  pub from: String,
  pub to: String,
  /// 图片贴合类型：0/1/2:contentReference[oaicite:12]{index=12}
  pub paste: Option<i32>,
}

#[derive(Debug, Serialize)]
pub struct PicTranslateResult {
  pub raw: serde_json::Value,
}

#[derive(Debug, Deserialize)]
pub struct DocCreatePayload {
  pub from: String,
  pub to: String,
  /// 文件二进制（<=50M，PDF 扫描件要翻图片建议 trans_image=1）:contentReference[oaicite:13]{index=13}
  pub file: Vec<u8>,
  /// 输入文件类型：pdf/doc/docx/xls/xlsx/ppt/pptx/txt/wps 等（你前端提示里也写了）
  pub format: String,
  pub filename: Option<String>,
  /// 是否翻译文档中的图片：0/1:contentReference[oaicite:14]{index=14}
  pub trans_image: Option<i32>,
  /// 输出类型（目前只支持传一个）:contentReference[oaicite:15]{index=15}
  pub output_format: Option<String>, // e.g. "docx"
  pub filename_prefix: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct DocCreateResult {
  pub id: String,
  pub raw: serde_json::Value,
}

#[derive(Debug, Deserialize)]
pub struct DocQueryPayload {
  pub id: String,
}

#[derive(Debug, Serialize)]
pub struct DocQueryResult {
  pub raw: serde_json::Value,
}

/// ======= commands =======

#[tauri::command]
pub async fn baidu_text_translate(
  pool: State<'_, DbPool>,
  token_state: State<'_, BaiduTokenState>,
  payload: TextTranslatePayload,
) -> Result<TextTranslateResult, AppError> {
  let client = build_client(get_network_opt(&pool)?)?;
  let token = get_access_token(&pool, &client, &token_state).await?;

  let url = format!("{BAIDU_TEXTTRANS_URL}?access_token={}", token);

  let mut body = json!({
    "q": payload.q,
    "from": payload.from,
    "to": payload.to,
  });
  if let Some(term_ids) = payload.term_ids {
    body["termIds"] = json!(term_ids);
  }

  let resp_json: serde_json::Value = client
    .post(url)
    .header("Content-Type", "application/json;charset=utf-8")
    .json(&body)
    .send()
    .await
    .map_err(AppError::from)?
    .json()
    .await
    .map_err(AppError::from)?;

  // 通用版返回结构：result.trans_result[{dst,src}]:contentReference[oaicite:16]{index=16}
  let from = resp_json
    .pointer("/result/from")
    .and_then(|v| v.as_str())
    .unwrap_or("")
    .to_string();
  let to = resp_json
    .pointer("/result/to")
    .and_then(|v| v.as_str())
    .unwrap_or("")
    .to_string();

  let dst_joined = resp_json
    .pointer("/result/trans_result")
    .and_then(|v| v.as_array())
    .map(|arr| {
      arr.iter()
        .filter_map(|x| x.get("dst").and_then(|v| v.as_str()).map(|s| s.to_string()))
        .collect::<Vec<_>>()
        .join("\n")
    })
    .unwrap_or_default();

  Ok(TextTranslateResult {
    from,
    to,
    dst: dst_joined,
    raw: resp_json,
  })
}

#[tauri::command]
pub async fn baidu_pic_translate(
  pool: State<'_, DbPool>,
  token_state: State<'_, BaiduTokenState>,
  payload: PicTranslatePayload,
) -> Result<PicTranslateResult, AppError> {
  let client = build_client(get_network_opt(&pool)?)?;
  let token = get_access_token(&pool, &client, &token_state).await?;

  let url = format!("{BAIDU_PICTRANS_URL}?access_token={}", token);

  // multipart 字段：image/from/to/v(固定3)/paste:contentReference[oaicite:17]{index=17}
  let file_part = multipart::Part::bytes(payload.image)
    .file_name("image")
    .mime_str(&payload.mime)
    .map_err(AppError::from)?;

  let mut form = multipart::Form::new()
    .part("image", file_part)
    .text("from", payload.from)
    .text("to", payload.to)
    .text("v", "3"); // 固定值 3:contentReference[oaicite:18]{index=18}

  if let Some(paste) = payload.paste {
    form = form.text("paste", paste.to_string());
  }

  let resp_json: serde_json::Value = client
    .post(url)
    .multipart(form)
    .send()
    .await
    .map_err(AppError::from)?
    .json()
    .await
    .map_err(AppError::from)?;

  Ok(PicTranslateResult { raw: resp_json })
}

#[tauri::command]
pub async fn baidu_doc_translate_create(
  pool: State<'_, DbPool>,
  token_state: State<'_, BaiduTokenState>,
  payload: DocCreatePayload,
) -> Result<DocCreateResult, AppError> {
  let client = build_client(get_network_opt(&pool)?)?;
  let token = get_access_token(&pool, &client, &token_state).await?;

  let url = format!("{BAIDU_DOC_CREATE_URL}?access_token={}", token);

  // create 接口 input.content 是 base64:contentReference[oaicite:19]{index=19}
  let content_b64 = general_purpose::STANDARD.encode(payload.file);

  let mut req_body = json!({
    "from": payload.from,
    "to": payload.to,
    "input": {
      "content": content_b64,
      "format": payload.format,
    }
  });

  if let Some(name) = payload.filename {
    req_body["input"]["filename"] = json!(name);
  }
  if let Some(trans_image) = payload.trans_image {
    req_body["input"]["trans_image"] = json!(trans_image);
  }

  // output.formats / filename_prefix:contentReference[oaicite:20]{index=20}
  if payload.output_format.is_some() || payload.filename_prefix.is_some() {
    req_body["output"] = json!({});
    if let Some(fmt) = payload.output_format {
      req_body["output"]["formats"] = json!([fmt]);
    }
    if let Some(prefix) = payload.filename_prefix {
      req_body["output"]["filename_prefix"] = json!(prefix);
    }
  }

  let resp_json: serde_json::Value = client
    .post(url)
    .header("Content-Type", "application/json;charset=utf-8")
    .json(&req_body)
    .send()
    .await
    .map_err(AppError::from)?
    .json()
    .await
    .map_err(AppError::from)?;

  // 返回 result.id（任务ID）:contentReference[oaicite:21]{index=21}
  let id = resp_json
    .pointer("/result/id")
    .and_then(|v| v.as_str())
    .unwrap_or("")
    .to_string();

  if id.is_empty() {
    // 让前端能看到原始错误（例如 error_code/error_msg）
    return Err(AppError::msg(format!("Baidu doc create failed: {}", resp_json)));
  }

  Ok(DocCreateResult { id, raw: resp_json })
}

#[tauri::command]
pub async fn baidu_doc_translate_query(
  pool: State<'_, DbPool>,
  token_state: State<'_, BaiduTokenState>,
  payload: DocQueryPayload,
) -> Result<DocQueryResult, AppError> {
  let client = build_client(get_network_opt(&pool)?)?;
  let token = get_access_token(&pool, &client, &token_state).await?;

  let url = format!("{BAIDU_DOC_QUERY_URL}?access_token={}", token);

  // query body: { id }:contentReference[oaicite:22]{index=22}
  let req_body = json!({ "id": payload.id });

  let resp_json: serde_json::Value = client
    .post(url)
    .header("Content-Type", "application/json;charset=utf-8")
    .json(&req_body)
    .send()
    .await
    .map_err(AppError::from)?
    .json()
    .await
    .map_err(AppError::from)?;

  Ok(DocQueryResult { raw: resp_json })
}

/// ======= token + client helpers =======

async fn get_access_token(
  pool: &DbPool,
  client: &Client,
  token_state: &BaiduTokenState,
) -> Result<String, AppError> {
  // 1) 先读缓存
  if let Some(tok) = try_get_cached_token(token_state).await {
    return Ok(tok);
  }

  // 2) 缓存失效 -> 拉新 token
  let keys = get_api_keys_required(pool)?;
  let client_id = keys.translation.baidu.app_id;
  let client_secret = keys.translation.baidu.app_secret;

  if client_id.is_empty() || client_secret.is_empty() {
    return Err(AppError::msg("Baidu API Key/Secret 为空，请先在设置里填写"));
  }

  let url = format!(
    "{BAIDU_OAUTH_URL}?grant_type=client_credentials&client_id={}&client_secret={}",
    urlencoding::encode(&client_id),
    urlencoding::encode(&client_secret)
  );

  let resp_json: serde_json::Value = client
    .get(url)
    .send()
    .await
    .map_err(AppError::from)?
    .json()
    .await
    .map_err(AppError::from)?;

  let access_token = resp_json
    .get("access_token")
    .and_then(|v| v.as_str())
    .unwrap_or("")
    .to_string();

  let expires_in = resp_json
    .get("expires_in")
    .and_then(|v| v.as_u64())
    // 文档说明有效期 30 天（秒）:contentReference[oaicite:23]{index=23}
    .unwrap_or(60 * 60 * 24 * 30);

  if access_token.is_empty() {
    return Err(AppError::msg(format!("Baidu oauth failed: {}", resp_json)));
  }

  let now = unix_now();
  let expires_at = now + expires_in;

  {
    let mut guard = token_state.inner.lock().await;
    *guard = Some(CachedToken {
      access_token: access_token.clone(),
      expires_at_unix: expires_at,
    });
  }

  Ok(access_token)
}

async fn try_get_cached_token(token_state: &BaiduTokenState) -> Option<String> {
  let guard = token_state.inner.lock().await;
  let tok = guard.as_ref()?;

  let now = unix_now();
  // 提前 TOKEN_REFRESH_SAFETY_WINDOW 刷新，避免临界点失败
  let safe_expire = tok
    .expires_at_unix
    .saturating_sub(TOKEN_REFRESH_SAFETY_WINDOW.as_secs());

  if now < safe_expire {
    Some(tok.access_token.clone())
  } else {
    None
  }
}

fn unix_now() -> u64 {
  SystemTime::now()
    .duration_since(UNIX_EPOCH)
    .unwrap_or(Duration::from_secs(0))
    .as_secs()
}

fn get_api_keys_required(pool: &DbPool) -> Result<ApiKeysForm, AppError> {
  let keys_opt = crate::settings::get_api_keys(pool)?;
  Ok(keys_opt.unwrap_or_default())
}

fn get_network_opt(pool: &DbPool) -> Result<Option<NetworkProxyForm>, AppError> {
  crate::settings::get_network(pool)
}

fn build_client(proxy: Option<NetworkProxyForm>) -> Result<Client, AppError> {
  let mut builder = reqwest::ClientBuilder::new();

  if let Some(p) = proxy {
    match p.mode {
      ProxyMode::Disable => {}
      ProxyMode::System => {
        // reqwest 默认会读系统代理（按平台）
      }
      ProxyMode::Manual => {
        let host = p.host.unwrap_or_default();
        let port = p.port.unwrap_or(0);
        let proto = p.protocol.unwrap_or(ProxyProtocol::Http);
        if !host.is_empty() && port != 0 {
          let scheme = match proto {
            ProxyProtocol::Http => "http",
            ProxyProtocol::Https => "https",
            ProxyProtocol::Socks5 => "socks5",
          };
          let proxy_url = format!("{scheme}://{host}:{port}");
          let mut px = reqwest::Proxy::all(&proxy_url).map_err(AppError::from)?;
          if let (Some(u), Some(pw)) = (p.username, p.password) {
            if !u.is_empty() {
              px = px.basic_auth(&u, &pw);
            }
          }
          builder = builder.proxy(px);
        }
      }
    }
  }

  builder.build().map_err(AppError::from)
}

/// 供 lib.rs 初始化 state 用
impl Default for BaiduTokenState {
  fn default() -> Self {
    Self {
      inner: Mutex::new(None),
    }
  }
}
