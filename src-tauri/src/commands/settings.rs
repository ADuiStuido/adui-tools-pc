use tauri::State;

use crate::{db::DbPool, error::AppError, settings::{ApiKeysForm, NetworkProxyForm}};

#[tauri::command]
pub fn settings_get_api_keys(pool: State<DbPool>) -> Result<Option<ApiKeysForm>, AppError> {
  crate::settings::get_api_keys(&pool)
}

#[tauri::command]
pub fn settings_save_api_keys(pool: State<DbPool>, payload: ApiKeysForm) -> Result<(), AppError> {
  crate::settings::save_api_keys(&pool, &payload)
}

#[tauri::command]
pub fn settings_get_network(pool: State<DbPool>) -> Result<Option<NetworkProxyForm>, AppError> {
  crate::settings::get_network(&pool)
}

#[tauri::command]
pub fn settings_save_network(
  pool: State<DbPool>,
  payload: NetworkProxyForm,
) -> Result<(), AppError> {
  crate::settings::save_network(&pool, &payload)
}
