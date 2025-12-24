use serde::Serialize;
use thiserror::Error;

#[derive(Debug, Error)]
pub enum AppError {
  #[error("{0}")]
  Db(String),
  #[error("{0}")]
  Io(String),
  #[error("{0}")]
  Serde(String),
}

#[derive(Debug, Serialize)]
pub struct ErrorPayload {
  pub message: String,
}

// 关键：把 AppError 序列化为 { message: "..." }，前端才能 e.message
impl Serialize for AppError {
  fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
  where
    S: serde::Serializer,
  {
    ErrorPayload {
      message: self.to_string(),
    }
      .serialize(serializer)
  }
}
