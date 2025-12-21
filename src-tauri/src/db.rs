use r2d2_sqlite::SqliteConnectionManager;
use r2d2::Pool;
use rusqlite::params;

pub type DbPool = Pool<SqliteConnectionManager>;

pub fn init_db(app_handle: &tauri::AppHandle) -> anyhow::Result<DbPool> {
    let app_dir = app_handle
        .path_resolver()
        .app_data_dir()
        .ok_or_else(|| anyhow::anyhow!("无法获取 app_data_dir"))?;

    std::fs::create_dir_all(&app_dir)?;

    let db_path = app_dir.join("adui_tools.sqlite");
    let manager = SqliteConnectionManager::file(db_path);
    let pool = Pool::new(manager)?;

    // migration（最小版：先建 conversations）
    {
        let conn = pool.get()?;
        conn.execute_batch(
            r#"
            PRAGMA journal_mode=WAL;

            CREATE TABLE IF NOT EXISTS conversations (
              id TEXT PRIMARY KEY,
              title TEXT NOT NULL,
              provider TEXT,
              model TEXT,
              system_prompt TEXT,
              created_at TEXT NOT NULL,
              updated_at TEXT NOT NULL
            );
            "#,
        )?;

        // 可选：如果你需要测试数据
        // conn.execute("INSERT ...", params![]).ok();
    }

    Ok(pool)
}
