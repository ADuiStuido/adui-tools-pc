use tauri::Emitter;
use tauri::menu::{MenuBuilder, MenuItem};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .setup(|app| {
      let about = MenuItem::with_id(app, "about", "关于", true, None::<&str>)?;
      let settings = MenuItem::with_id(app, "settings", "设置", true, None::<&str>)?;

      let menu = MenuBuilder::new(app).items(&[&settings, &about]).build()?;

      app.set_menu(menu)?;

      app.on_menu_event(|app_handle, event| {
        match event.id.0.as_str() {
          "about" => {
            let _ = app_handle.emit("menu:about", ());
          }
          "settings" => {
            let _ = app_handle.emit("menu:settings", ());
          }
          _ => {}
        }
      });

      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }
      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
