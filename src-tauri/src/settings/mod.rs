mod types;

pub use types::*;

use chrono::Utc;
use rusqlite::params;

use crate::{db::DbPool, error::AppError};

const KEY_API_KEYS: &str = "api_keys";
const KEY_NETWORK_PROXY: &str = "network_proxy";

/* ==================== API KEYS ==================== */

pub fn save_api_keys(pool: &DbPool, payload: &ApiKeysForm) -> Result<(), AppError> {
  let json =
    serde_json::to_string(payload).map_err(|e| AppError::Serde(format!("to json failed: {e}")))?;

  let now = Utc::now().timestamp();

  let conn = pool
    .get()
    .map_err(|e| AppError::Db(format!("db get conn failed: {e}")))?;

  conn
    .execute(
      r#"
      INSERT INTO app_settings(key, value, updated_at)
      VALUES (?1, ?2, ?3)
      ON CONFLICT(key) DO UPDATE SET
        value = excluded.value,
        updated_at = excluded.updated_at
      "#,
      params![KEY_API_KEYS, json, now],
    )
    .map_err(|e| AppError::Db(format!("save api_keys failed: {e}")))?;

  Ok(())
}

pub fn get_api_keys(pool: &DbPool) -> Result<Option<ApiKeysForm>, AppError> {
  let conn = pool
    .get()
    .map_err(|e| AppError::Db(format!("db get conn failed: {e}")))?;

  let mut stmt = conn
    .prepare("SELECT value FROM app_settings WHERE key = ?1")
    .map_err(|e| AppError::Db(format!("prepare failed: {e}")))?;

  let row = stmt.query_row(params![KEY_API_KEYS], |r| r.get::<_, String>(0));

  match row {
    Ok(json) => {
      let data: ApiKeysForm =
        serde_json::from_str(&json).map_err(|e| AppError::Serde(format!("from json failed: {e}")))?;
      Ok(Some(data))
    }
    Err(rusqlite::Error::QueryReturnedNoRows) => Ok(None),
    Err(e) => Err(AppError::Db(format!("query api_keys failed: {e}"))),
  }
}

/* ==================== NETWORK PROXY ==================== */

pub fn save_network(pool: &DbPool, payload: &NetworkProxyForm) -> Result<(), AppError> {
  let json =
    serde_json::to_string(payload).map_err(|e| AppError::Serde(format!("to json failed: {e}")))?;

  let now = Utc::now().timestamp();

  let conn = pool
    .get()
    .map_err(|e| AppError::Db(format!("db get conn failed: {e}")))?;

  conn
    .execute(
      r#"
      INSERT INTO app_settings(key, value, updated_at)
      VALUES (?1, ?2, ?3)
      ON CONFLICT(key) DO UPDATE SET
        value = excluded.value,
        updated_at = excluded.updated_at
      "#,
      params![KEY_NETWORK_PROXY, json, now],
    )
    .map_err(|e| AppError::Db(format!("save network_proxy failed: {e}")))?;

  Ok(())
}

pub fn get_network(pool: &DbPool) -> Result<Option<NetworkProxyForm>, AppError> {
  let conn = pool
    .get()
    .map_err(|e| AppError::Db(format!("db get conn failed: {e}")))?;

  let mut stmt = conn
    .prepare("SELECT value FROM app_settings WHERE key = ?1")
    .map_err(|e| AppError::Db(format!("prepare failed: {e}")))?;

  let row = stmt.query_row(params![KEY_NETWORK_PROXY], |r| r.get::<_, String>(0));

  match row {
    Ok(json) => {
      let data: NetworkProxyForm = serde_json::from_str(&json)
        .map_err(|e| AppError::Serde(format!("from json failed: {e}")))?;
      Ok(Some(data))
    }
    Err(rusqlite::Error::QueryReturnedNoRows) => Ok(None),
    Err(e) => Err(AppError::Db(format!("query network_proxy failed: {e}"))),
  }
}
