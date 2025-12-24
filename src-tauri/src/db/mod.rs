use r2d2::Pool;
use r2d2_sqlite::SqliteConnectionManager;
use tauri::{AppHandle, Manager};

use crate::error::AppError;

pub type DbPool = Pool<SqliteConnectionManager>;

pub fn init_db(app: &AppHandle) -> Result<DbPool, AppError> {
  let app_dir = app
    .path()
    .app_data_dir()
    .map_err(|e| AppError::Io(format!("get app_data_dir failed: {e}")))?;

  std::fs::create_dir_all(&app_dir)
    .map_err(|e| AppError::Io(format!("create app_data_dir failed: {e}")))?;

  let db_path = app_dir.join("adui_tools.db");
  let manager = SqliteConnectionManager::file(db_path);

  let pool = Pool::builder()
    .max_size(8)
    .build(manager)
    .map_err(|e| AppError::Db(format!("create sqlite pool failed: {e}")))?;

  // migration
  {
    let conn = pool.get().map_err(|e| AppError::Db(format!("db get conn failed: {e}")))?;
    crate::db::migrate::migrate(&conn)?;
  }

  Ok(pool)
}

pub mod migrate;
