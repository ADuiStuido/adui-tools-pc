use rusqlite::Connection;

use crate::error::AppError;

pub fn migrate(conn: &Connection) -> Result<(), AppError> {
  conn
    .execute_batch(
      r#"
      PRAGMA journal_mode = WAL;
      PRAGMA foreign_keys = ON;

      CREATE TABLE IF NOT EXISTS app_settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at INTEGER NOT NULL
      );
      "#,
    )
    .map_err(|e| AppError::Db(format!("migration failed: {e}")))?;

  Ok(())
}
