use tauri::State;

use crate::{db::DbPool, error::AppError, settings::ApiKeysForm};

#[tauri::command]
pub fn settings_get_api_keys(pool: State<DbPool>) -> Result<Option<ApiKeysForm>, AppError> {
  crate::settings::get_api_keys(&pool)
}

#[tauri::command]
pub fn settings_save_api_keys(pool: State<DbPool>, payload: ApiKeysForm) -> Result<(), AppError> {
  crate::settings::save_api_keys(&pool, &payload)
}
