use serde::{Deserialize, Serialize};
use rusqlite::params;
use uuid::Uuid;
use chrono::Utc;

use crate::db::DbPool;

#[derive(Debug, Serialize)]
pub struct ConversationRow {
    pub id: String,
    pub title: String,
    pub provider: Option<String>,
    pub model: Option<String>,
    pub system_prompt: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Deserialize)]
pub struct ConversationCreatePayload {
    pub title: String,
    pub provider: Option<String>,
    pub model: Option<String>,
    pub system_prompt: Option<String>,
}

#[tauri::command]
pub fn conversations_list(pool: tauri::State<DbPool>) -> Result<Vec<ConversationRow>, String> {
    let conn = pool.get().map_err(|e| e.to_string())?;

    let mut stmt = conn
        .prepare(
            r#"
          SELECT id, title, provider, model, system_prompt, created_at, updated_at
          FROM conversations
          ORDER BY updated_at DESC
        "#,
        )
        .map_err(|e| e.to_string())?;

    let rows = stmt
        .query_map([], |row| {
            Ok(ConversationRow {
                id: row.get(0)?,
                title: row.get(1)?,
                provider: row.get(2)?,
                model: row.get(3)?,
                system_prompt: row.get(4)?,
                created_at: row.get(5)?,
                updated_at: row.get(6)?,
            })
        })
        .map_err(|e| e.to_string())?;

    let mut result = Vec::new();
    for r in rows {
        result.push(r.map_err(|e| e.to_string())?);
    }
    Ok(result)
}

#[tauri::command]
pub fn conversations_create(
    pool: tauri::State<DbPool>,
    payload: ConversationCreatePayload,
) -> Result<String, String> {
    let conn = pool.get().map_err(|e| e.to_string())?;

    let id = Uuid::new_v4().to_string();
    let now = Utc::now().to_rfc3339();

    conn.execute(
        r#"
        INSERT INTO conversations (id, title, provider, model, system_prompt, created_at, updated_at)
        VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)
        "#,
        params![
            id,
            payload.title,
            payload.provider,
            payload.model,
            payload.system_prompt,
            now,
            now
        ],
    )
        .map_err(|e| e.to_string())?;

    Ok(id)
}
