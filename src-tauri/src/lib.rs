use tauri::{Emitter, Manager, PhysicalPosition, PhysicalSize};
use tauri::menu::{MenuBuilder, MenuItem, SubmenuBuilder};

mod commands;
mod db;
mod error;
mod settings;

use db::init_db;
use crate::commands::baidu_translate::BaiduTokenState;

const ABOUT_WINDOW_LABEL: &str = "about_window";
const MAIN_WINDOW_LABEL: &str = "main";

fn center_on_window(
  base: &tauri::WebviewWindow,
  target: &tauri::WebviewWindow,
  target_size: PhysicalSize<u32>,
) {
  let Ok(base_pos) = base.outer_position() else { return };
  let Ok(base_size) = base.outer_size() else { return };

  let mut x = base_pos.x + (base_size.width as i32 - target_size.width as i32) / 2;
  let mut y = base_pos.y + (base_size.height as i32 - target_size.height as i32) / 2;

  // 防止跑到屏幕负坐标（多屏/任务栏/窗口贴边时常见）
  if x < 0 { x = 0; }
  if y < 0 { y = 0; }

  let _ = target.set_position(PhysicalPosition::new(x, y));
}

fn center_on_primary_monitor(
  app_handle: &tauri::AppHandle,
  target: &tauri::WebviewWindow,
  target_size: PhysicalSize<u32>,
) {
  // 退化：居中到主屏（找不到 main 窗口时用）
  let Ok(Some(monitor)) = app_handle.primary_monitor() else { return };
  let pos = monitor.position();
  let size = monitor.size();

  let mut x = pos.x + (size.width as i32 - target_size.width as i32) / 2;
  let mut y = pos.y + (size.height as i32 - target_size.height as i32) / 2;

  if x < 0 { x = 0; }
  if y < 0 { y = 0; }

  let _ = target.set_position(PhysicalPosition::new(x, y));
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .setup(|app| {
      // --- items ---
      let about = MenuItem::with_id(app, "about", "关于", true, None::<&str>)?;
      let settings = MenuItem::with_id(app, "settings", "设置", true, Some("CmdOrCtrl+,"))?;
      let quit = MenuItem::with_id(app, "quit", "退出", true, Some("CmdOrCtrl+Q"))?;

      // --- submenus (macOS 必须要有这个层级) ---
      let app_menu = SubmenuBuilder::new(app, "ADui Tools")
        .item(&about)
        .item(&settings)
        .separator()
        .item(&quit)
        .build()?;

      let menu = MenuBuilder::new(app)
        .item(&app_menu)
        .build()?;

      #[cfg(target_os = "macos")]
      {
        app.set_menu(menu)?;
      }

      #[cfg(not(target_os = "macos"))]
      {
        if let Some(main) = app.get_webview_window(MAIN_WINDOW_LABEL) {
          main.set_menu(menu)?;
        } else {
          app.set_menu(menu)?;
        }
      }


      // --- menu events ---
      app.on_menu_event(|app_handle, event| {
        match event.id().0.as_str() {
          "about" => {
            let about_size: PhysicalSize<u32> = PhysicalSize::new(520, 380);

            // 已存在：居中 + 聚焦
            if let Some(win) = app_handle.get_webview_window(ABOUT_WINDOW_LABEL) {
              if let Some(main) = app_handle.get_webview_window(MAIN_WINDOW_LABEL) {
                center_on_window(&main, &win, about_size);
              } else {
                center_on_primary_monitor(app_handle, &win, about_size);
              }

              let _ = win.show();
              let _ = win.set_focus();
              return;
            }

            // 创建新窗口（不需要 set_menu，默认不显示菜单就是你要的）
            let url = tauri::WebviewUrl::App("index.html#/about".into());
            let win = tauri::WebviewWindowBuilder::new(app_handle, ABOUT_WINDOW_LABEL, url)
              .title("关于 ADui Tools")
              .inner_size(about_size.width as f64, about_size.height as f64)
              .resizable(false)
              .maximizable(false)
              .minimizable(false)
              .build()
              .expect("create about window failed");

            if let Some(main) = app_handle.get_webview_window(MAIN_WINDOW_LABEL) {
              center_on_window(&main, &win, about_size);
            } else {
              center_on_primary_monitor(app_handle, &win, about_size);
            }

            let _ = win.show();
            let _ = win.set_focus();
          }

          "settings" => { let _ = app_handle.emit("menu:settings", ()); }
          "quit" => { app_handle.exit(0); }
          _ => {}
        }
      });

      let pool = init_db(app.handle())?;
      app.manage(pool);
      app.manage(BaiduTokenState::default());

      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }

      Ok(())
    })
    .invoke_handler(tauri::generate_handler![
      commands::settings::settings_get_api_keys,
      commands::settings::settings_save_api_keys,
      commands::settings::settings_get_network,
      commands::settings::settings_save_network,
      commands::baidu_translate::baidu_text_translate,
      commands::baidu_translate::baidu_pic_translate,
      commands::baidu_translate::baidu_doc_translate_create,
      commands::baidu_translate::baidu_doc_translate_query,
      commands::github::github_repo_commit_activity,
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
