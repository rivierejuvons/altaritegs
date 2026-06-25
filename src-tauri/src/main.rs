// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod db;
mod ws_server;

use std::sync::Arc;
use tokio::sync::Mutex;

fn main() {
    tauri::Builder::default()
        .plugin(db::init_db())
        .manage(Arc::new(ws_server::WsServerState {
            is_running: Mutex::new(false),
            port: Mutex::new(0),
            tx: Mutex::new(None),
        }))
        .invoke_handler(tauri::generate_handler![
            db::get_service_items,
            db::create_service_item,
            db::update_service_item,
            db::delete_service_item,
            db::get_live_service_state,
            db::update_live_service_state,
            ws_server::start_ws_server,
            ws_server::get_ws_server_status,
            ws_server::broadcast_ws_message
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
