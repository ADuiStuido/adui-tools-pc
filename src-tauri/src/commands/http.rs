use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Deserialize)]
pub struct HttpRequest {
    pub url: String,
    pub method: String, // "GET" | "POST" | ...
    pub headers: Option<HashMap<String, String>>,
    pub body: Option<serde_json::Value>,
    pub timeout_ms: Option<u64>,
}

#[derive(Debug, Serialize)]
pub struct HttpResponse {
    pub status: u16,
    pub headers: HashMap<String, String>,
    pub body: serde_json::Value,
}

#[tauri::command]
pub async fn http_request(req: HttpRequest) -> Result<HttpResponse, String> {
    let timeout = std::time::Duration::from_millis(req.timeout_ms.unwrap_or(30_000));

    // ⚠️ 代理：建议从 settings 读取后在这里设置 client（下面先给结构，settings 部分你接入后即可）
    let client = reqwest::Client::builder()
        .timeout(timeout)
        .build()
        .map_err(|e| e.to_string())?;

    let method = reqwest::Method::from_bytes(req.method.as_bytes()).map_err(|e| e.to_string())?;
    let mut r = client.request(method, &req.url);

    if let Some(h) = req.headers {
        for (k, v) in h {
            r = r.header(k, v);
        }
    }

    if let Some(b) = req.body {
        r = r.json(&b);
    }

    let resp = r.send().await.map_err(|e| e.to_string())?;
    let status = resp.status().as_u16();

    let mut headers = HashMap::new();
    for (k, v) in resp.headers().iter() {
        headers.insert(k.to_string(), v.to_str().unwrap_or("").to_string());
    }

    // 这里假设返回 JSON（AI/翻译基本都是 JSON）
    let body = resp.json::<serde_json::Value>().await.map_err(|e| e.to_string())?;

    Ok(HttpResponse { status, headers, body })
}
