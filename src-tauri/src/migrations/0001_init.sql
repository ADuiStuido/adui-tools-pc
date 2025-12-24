-- app_settings：用于存 API Keys / 配置（加密后）
CREATE TABLE IF NOT EXISTS app_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at INTEGER NOT NULL
);

-- 预留：将来可以继续加表
-- CREATE TABLE IF NOT EXISTS conversations (...)
