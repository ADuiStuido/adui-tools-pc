use rusqlite::Connection;

/// 运行所有 migrations
pub fn run_migrations(conn: &Connection) -> rusqlite::Result<()> {
  // 把 SQL 文件在编译期 embed 进二进制
  let sql = include_str!("../../migrations/0001_init.sql");
  conn.execute_batch(sql)?;
  Ok(())
}
