use serde::{Deserialize, Serialize};
use tauri::State;
use tauri_plugin_sql::{Builder, DbInstances, Migration, MigrationKind};

#[derive(Debug, Serialize, Deserialize)]
pub struct ServiceItem {
    pub id: String,
    pub service_id: String,
    pub title: String,
    pub planned_duration_seconds: i32,
    pub order_index: i32,
    pub status: String,
    pub owner: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ChecklistItem {
    pub id: String,
    pub service_id: String,
    pub title: String,
    pub role: String,
    pub is_completed: bool,
    pub completed_by: Option<String>,
    pub completed_at: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct LiveServiceState {
    pub service_id: String,
    pub current_item_id: Option<String>,
    pub is_running: bool,
    pub running_time_seconds: i32,
    pub overrides: Option<String>,
}

// Database Initialization
pub fn init_db() -> tauri::plugin::TauriPlugin<tauri::Wry> {
    let migrations = vec![
        Migration {
            version: 1,
            description: "create_initial_tables",
            sql: "
                CREATE TABLE IF NOT EXISTS service_items (
                    id TEXT PRIMARY KEY,
                    service_id TEXT NOT NULL,
                    title TEXT NOT NULL,
                    planned_duration_seconds INTEGER NOT NULL,
                    order_index INTEGER NOT NULL,
                    status TEXT NOT NULL,
                    owner TEXT
                );
                
                CREATE TABLE IF NOT EXISTS checklist_items (
                    id TEXT PRIMARY KEY,
                    service_id TEXT NOT NULL,
                    title TEXT NOT NULL,
                    role TEXT NOT NULL,
                    is_completed BOOLEAN NOT NULL DEFAULT 0,
                    completed_by TEXT,
                    completed_at TEXT
                );
                
                CREATE TABLE IF NOT EXISTS live_service_state (
                    service_id TEXT PRIMARY KEY,
                    current_item_id TEXT,
                    is_running BOOLEAN NOT NULL DEFAULT 0,
                    running_time_seconds INTEGER NOT NULL DEFAULT 0,
                    overrides TEXT
                );
            ",
            kind: MigrationKind::Up,
        }
    ];

    Builder::default()
        .add_migrations("sqlite:altarite.db", migrations)
        .build()
}

// --- CRUD Commands for ServiceItems ---

#[tauri::command]
pub async fn get_service_items(
    service_id: String,
    db: State<'_, DbInstances>,
) -> Result<Vec<ServiceItem>, String> {
    let db_conn = db.get("sqlite:altarite.db")
        .ok_or("Database instance not found")?;
    
    let result = db_conn.select(
        "SELECT * FROM service_items WHERE service_id = $1 ORDER BY order_index ASC",
        vec![service_id.into()],
    ).await.map_err(|e| e.to_string())?;
    
    Ok(result)
}

#[tauri::command]
pub async fn create_service_item(
    item: ServiceItem,
    db: State<'_, DbInstances>,
) -> Result<(), String> {
    let db_conn = db.get("sqlite:altarite.db")
        .ok_or("Database instance not found")?;
    
    db_conn.execute(
        "INSERT INTO service_items (id, service_id, title, planned_duration_seconds, order_index, status, owner) 
         VALUES ($1, $2, $3, $4, $5, $6, $7)",
        vec![
            item.id.into(),
            item.service_id.into(),
            item.title.into(),
            item.planned_duration_seconds.into(),
            item.order_index.into(),
            item.status.into(),
            item.owner.into(),
        ],
    ).await.map_err(|e| e.to_string())?;
    
    Ok(())
}

#[tauri::command]
pub async fn update_service_item(
    item: ServiceItem,
    db: State<'_, DbInstances>,
) -> Result<(), String> {
    let db_conn = db.get("sqlite:altarite.db")
        .ok_or("Database instance not found")?;
    
    db_conn.execute(
        "UPDATE service_items SET title = $1, planned_duration_seconds = $2, order_index = $3, status = $4, owner = $5 
         WHERE id = $6",
        vec![
            item.title.into(),
            item.planned_duration_seconds.into(),
            item.order_index.into(),
            item.status.into(),
            item.owner.into(),
            item.id.into(),
        ],
    ).await.map_err(|e| e.to_string())?;
    
    Ok(())
}

#[tauri::command]
pub async fn delete_service_item(
    id: String,
    db: State<'_, DbInstances>,
) -> Result<(), String> {
    let db_conn = db.get("sqlite:altarite.db")
        .ok_or("Database instance not found")?;
    
    db_conn.execute(
        "DELETE FROM service_items WHERE id = $1",
        vec![id.into()],
    ).await.map_err(|e| e.to_string())?;
    
    Ok(())
}

// --- CRUD Commands for LiveServiceState ---

#[tauri::command]
pub async fn get_live_service_state(
    service_id: String,
    db: State<'_, DbInstances>,
) -> Result<Option<LiveServiceState>, String> {
    let db_conn = db.get("sqlite:altarite.db")
        .ok_or("Database instance not found")?;
    
    let mut result: Vec<LiveServiceState> = db_conn.select(
        "SELECT * FROM live_service_state WHERE service_id = $1",
        vec![service_id.into()],
    ).await.map_err(|e| e.to_string())?;
    
    Ok(result.pop())
}

#[tauri::command]
pub async fn update_live_service_state(
    state: LiveServiceState,
    db: State<'_, DbInstances>,
) -> Result<(), String> {
    let db_conn = db.get("sqlite:altarite.db")
        .ok_or("Database instance not found")?;
    
    // Upsert equivalent for sqlite
    db_conn.execute(
        "INSERT INTO live_service_state (service_id, current_item_id, is_running, running_time_seconds, overrides)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT(service_id) DO UPDATE SET 
            current_item_id = excluded.current_item_id,
            is_running = excluded.is_running,
            running_time_seconds = excluded.running_time_seconds,
            overrides = excluded.overrides",
        vec![
            state.service_id.into(),
            state.current_item_id.into(),
            state.is_running.into(),
            state.running_time_seconds.into(),
            state.overrides.into(),
        ],
    ).await.map_err(|e| e.to_string())?;
    
    Ok(())
}
