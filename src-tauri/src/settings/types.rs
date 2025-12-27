use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct ApiKeysForm {
  pub translation: TranslationKeys,
  pub ai: AiKeys,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct TranslationKeys {
  /// 百度翻译：需要 AppID / API Key / Secret Key
  pub baidu: BaiduKeys,

  /// 有道：只需要 appId / appSecret（按你现在的设计）
  pub youdao: AppPair,

  /// DeepL：apiKey + endpoint
  pub deepl: DeeplKey,
}

/// 百度翻译密钥结构
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct BaiduKeys {
  /// 百度控制台里的 AppID
  #[serde(rename = "appId")]
  pub app_id: String,

  /// 百度控制台里的 API Key（文档里叫 app_key / API Key）
  #[serde(rename = "apiKey")]
  pub api_key: String,

  /// 百度控制台里的 Secret Key
  #[serde(rename = "appSecret")]
  pub app_secret: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct AppPair {
  /// 通用 appId
  #[serde(rename = "appId")]
  pub app_id: String,
  /// 通用 appSecret
  #[serde(rename = "appSecret")]
  pub app_secret: String,
}


#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct DeeplKey {
  #[serde(rename = "apiKey")]
  pub api_key: String,
  pub endpoint: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct AiKeys {
  pub openai: ApiKeyOnly,
  pub deepseek: ApiKeyOnly,
  pub qwen: ApiKeyOnly,
  pub doubao: ApiKeyOnly,
  pub wenxin: ApiKeyOnly,
  pub yuanbao: ApiKeyOnly,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct ApiKeyOnly {
  #[serde(rename = "apiKey")]
  pub api_key: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum ProxyMode {
  Disable,
  System,
  Manual,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum ProxyProtocol {
  Http,
  Https,
  Socks5,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NetworkProxyForm {
  pub mode: ProxyMode,
  pub protocol: Option<ProxyProtocol>,
  pub host: Option<String>,
  pub port: Option<u16>,
  pub username: Option<String>,
  pub password: Option<String>,
  pub no_proxy: Option<Vec<String>>,
}
