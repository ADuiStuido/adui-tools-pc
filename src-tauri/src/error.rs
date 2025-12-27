use serde::Serialize;
use thiserror::Error;

/// 应用统一错误类型：
/// - 后端内部用 Result<T, AppError>
/// - Tauri command 返回错误时会被序列化成 { message: "..." }，方便前端展示
#[derive(Debug, Error)]
pub enum AppError {
  /// 数据库相关错误（你自己封装的字符串）
  #[error("{0}")]
  Db(String),

  /// IO 相关错误（文件读写等）
  #[error("{0}")]
  Io(String),

  /// 序列化/反序列化相关错误（你自己封装的字符串）
  #[error("{0}")]
  Serde(String),

  /// 通用字符串错误：
  /// - 任何“业务错误提示”都建议用这个（或用 AppError::msg 快速创建）
  #[error("{0}")]
  Message(String),

  /// HTTP 请求错误：reqwest 内部会携带详细信息
  /// 使用 #[from] 以后，你就可以写：
  /// - reqwest 调用后直接用 `?` 自动转成 AppError
  #[error(transparent)]
  Reqwest(#[from] reqwest::Error),

  /// JSON 序列化/反序列化错误：serde_json
  /// 同样支持 `?` 自动转换
  #[error(transparent)]
  SerdeJson(#[from] serde_json::Error),
}

/// 给前端的错误载荷结构：
/// 统一成 { message: string }，前端用 e.message 就能显示
#[derive(Debug, Serialize)]
pub struct ErrorPayload {
  pub message: String,
}

impl AppError {
  /// 快速创建“业务错误/提示信息”
  ///
  /// 用法示例：
  /// - `return Err(AppError::msg("xxx"))`
  /// - `return Err(AppError::msg(format!("xxx: {}", detail)))`
  pub fn msg<T: Into<String>>(msg: T) -> Self {
    Self::Message(msg.into())
  }
}

/// 关键：把 AppError 序列化为 { message: "..." }
/// 这样前端才能稳定读取 e.message
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
