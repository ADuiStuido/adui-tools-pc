use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize)]
pub struct RepoCommitHeatmap {
  /// 每一列是一周（从最早到最新），每周 7 天（周日->周六）
  pub weeks: Vec<Week>,
  /// 数据来源仓库
  pub owner: String,
  pub repo: String,
  /// 提示信息：比如 202 需要重试
  pub hint: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Week {
  pub total: i64,
  pub week: i64,      // unix timestamp
  pub days: [i64; 7], // Sun..Sat
}

#[tauri::command]
pub async fn github_repo_commit_activity(owner: String, repo: String) -> Result<RepoCommitHeatmap, String> {
  let url = format!(
    "https://api.github.com/repos/{}/{}/stats/commit_activity",
    owner, repo
  );

  let client = reqwest::Client::new();
  let resp = client
    .get(url)
    .header(reqwest::header::USER_AGENT, "ADuiTools")
    .header(reqwest::header::ACCEPT, "application/vnd.github+json")
    .send()
    .await
    .map_err(|e| e.to_string())?;

  // GitHub 统计端点可能返回 202：表示正在生成统计缓存，需要稍后再试 :contentReference[oaicite:2]{index=2}
  if resp.status() == reqwest::StatusCode::ACCEPTED {
    return Ok(RepoCommitHeatmap {
      weeks: Vec::new(),
      owner,
      repo,
      hint: Some("GitHub 正在生成统计缓存（202 Accepted），请稍后再打开/刷新此页面。".to_string()),
    });
  }

  if !resp.status().is_success() {
    let status = resp.status();
    let text = resp.text().await.unwrap_or_default();
    return Err(format!("GitHub API error: {} {}", status, text));
  }

  let weeks = resp.json::<Vec<Week>>().await.map_err(|e| e.to_string())?;

  Ok(RepoCommitHeatmap {
    weeks,
    owner,
    repo,
    hint: None,
  })
}
