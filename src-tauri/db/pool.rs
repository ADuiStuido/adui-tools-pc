use r2d2::{Pool};
use r2d2_sqlite::SqliteConnectionManager;
use std::path::PathBuf;
use tauri::{AppHandle, Manager};

use super::migrate::run_migrations;

pub type DbPool = Pool<SqliteConnectionManager>;

pub fn init_db(app: &AppHandle) -> anyhow::Result<DbPool> {
  // 数据库文件位置（推荐放 app data dir）
  let app_dir = app.path().app_data_dir()?;
  std::fs::create_dir_all(&app_dir)?;

  let db_path: PathBuf = app_dir.join("app.db");

  let manager = SqliteConnectionManager::file(db_path);
  let pool = Pool::new(manager)?;

  // 👉 初始化 / 迁移
  {
    let conn = pool.get()?;
    run_migrations(&conn)?;
  }

  Ok(pool)
}
