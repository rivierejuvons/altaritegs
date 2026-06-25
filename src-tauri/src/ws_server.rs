use std::collections::HashMap;
use std::sync::Arc;
use futures_util::{SinkExt, StreamExt};
use tokio::net::{TcpListener, TcpStream};
use tokio::sync::{mpsc, Mutex};
use tokio_tungstenite::tungstenite::protocol::Message;

type Tx = mpsc::UnboundedSender<Message>;
type PeerMap = Arc<Mutex<HashMap<std::net::SocketAddr, Tx>>>;

pub struct WsServerState {
    pub is_running: Mutex<bool>,
    pub port: Mutex<u16>,
    pub tx: Mutex<Option<tokio::sync::mpsc::Sender<String>>>, // Channel to send messages to connected clients
}

// Global Peer Map to broadcast
lazy_static::lazy_static! {
    static ref PEERS: PeerMap = Arc::new(Mutex::new(HashMap::new()));
}

async fn handle_connection(peer_map: PeerMap, raw_stream: TcpStream, addr: std::net::SocketAddr) {
    println!("Incoming TCP connection from: {}", addr);

    let ws_stream = tokio_tungstenite::accept_async(raw_stream)
        .await
        .expect("Error during the websocket handshake occurred");
    
    println!("WebSocket connection established: {}", addr);

    let (tx, rx) = mpsc::unbounded_channel();
    peer_map.lock().await.insert(addr, tx);

    let (outgoing, incoming) = ws_stream.split();

    let broadcast_incoming = incoming.try_for_each(|msg| {
        // Here you would handle incoming messages from clients, 
        // e.g., to update database state via a Tauri event or direct call.
        println!("Received a message from {}: {}", addr, msg.to_text().unwrap_or(""));
        futures_util::future::ok(())
    });

    let receive_from_others = tokio_stream::wrappers::UnboundedReceiverStream::new(rx)
        .map(Ok)
        .forward(outgoing);

    tokio::select! {
        _ = broadcast_incoming => {},
        _ = receive_from_others => {},
    }

    println!("{} disconnected", &addr);
    peer_map.lock().await.remove(&addr);
}

pub async fn start_server(port: u16) {
    let addr = format!("0.0.0.0:{}", port);
    let listener = TcpListener::bind(&addr).await.expect("Failed to bind");
    println!("Listening on: {}", addr);

    while let Ok((stream, addr)) = listener.accept().await {
        tokio::spawn(handle_connection(PEERS.clone(), stream, addr));
    }
}

// Tauri command to broadcast a message to all connected WS clients
#[tauri::command]
pub async fn broadcast_ws_message(message: String) -> Result<(), String> {
    let peers = PEERS.lock().await;
    for recp in peers.values() {
        let _ = recp.send(Message::text(message.clone()));
    }
    Ok(())
}

// Tauri command to start the server from the UI
#[tauri::command]
pub async fn start_ws_server(port: u16, state: tauri::State<'_, Arc<WsServerState>>) -> Result<(), String> {
    let mut is_running = state.is_running.lock().await;
    if *is_running {
        return Err("Server is already running".to_string());
    }

    *is_running = true;
    *state.port.lock().await = port;

    // Spawn the WebSocket server in the background
    tokio::spawn(async move {
        start_server(port).await;
    });

    Ok(())
}

#[tauri::command]
pub async fn get_ws_server_status(state: tauri::State<'_, Arc<WsServerState>>) -> Result<bool, String> {
    let is_running = state.is_running.lock().await;
    Ok(*is_running)
}
