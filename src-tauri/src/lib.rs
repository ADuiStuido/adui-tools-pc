use tauri::{Emitter, Manager};
use tauri::menu::{MenuBuilder, MenuItem, SubmenuBuilder};

mod commands;
mod db;
mod error;
mod settings;

use db::init_db;

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

      app.set_menu(menu)?;

      // --- menu events ---
      app.on_menu_event(|app_handle, event| {
        match event.id().0.as_str() {
          "about" => { let _ = app_handle.emit("menu:about", ()); }
          "settings" => { let _ = app_handle.emit("menu:settings", ()); }
          "quit" => { app_handle.exit(0); }
          _ => {}
        }
      });

      let pool = init_db(app.handle())?;
      app.manage(pool);

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
      // 设置相关
      commands::settings::settings_get_api_keys,
      commands::settings::settings_save_api_keys,
      commands::settings::settings_get_network,
      commands::settings::settings_save_network,
      // 翻译相关
      commands::baidu_translate::baidu_text_translate,
      commands::baidu_translate::baidu_pic_translate,
      commands::baidu_translate::baidu_doc_translate_create,
      commands::baidu_translate::baidu_doc_translate_query,
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
