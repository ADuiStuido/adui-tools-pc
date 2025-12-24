use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct ApiKeysForm {
  pub translation: TranslationKeys,
  pub ai: AiKeys,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct TranslationKeys {
  pub baidu: AppPair,
  pub youdao: AppPair,
  pub deepl: DeeplKey,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct AppPair {
  #[serde(rename = "appId")]
  pub app_id: String,
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
