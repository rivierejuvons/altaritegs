import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";

// Interfaces
export interface ServiceItem {
  id: string;
  service_id: string;
  title: string;
  planned_duration_seconds: number;
  order_index: number;
  status: string;
  owner?: string;
}

export interface LiveServiceState {
  service_id: string;
  current_item_id?: string;
  is_running: boolean;
  running_time_seconds: number;
  overrides?: string;
}

export const isTauri = () => {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
};

// --- SQLite Database Calls via Tauri Commands ---

export async function fetchServiceItemsFromDb(serviceId: string): Promise<ServiceItem[]> {
  if (!isTauri()) return []; // Mock or fallback
  try {
    const items = await invoke<ServiceItem[]>("get_service_items", { serviceId });
    return items;
  } catch (error) {
    console.error("Failed to fetch service items:", error);
    return [];
  }
}

export async function createServiceItemInDb(item: ServiceItem): Promise<void> {
  if (!isTauri()) return;
  await invoke("create_service_item", { item });
}

export async function updateLiveServiceStateInDb(state: LiveServiceState): Promise<void> {
  if (!isTauri()) return;
  await invoke("update_live_service_state", { state });
}

// --- Local Area Network Synchronization via WebSocket ---

let wsClient: WebSocket | null = null;

export async function startLocalWsServer(port: number): Promise<void> {
  if (!isTauri()) return;
  try {
    await invoke("start_ws_server", { port });
    console.log(`Local WS server started on port ${port}`);
  } catch (err) {
    console.error("Failed to start WS server:", err);
  }
}

export function connectToLocalWsServer(ipAddress: string, port: number, onMessage: (msg: any) => void) {
  wsClient = new WebSocket(`ws://${ipAddress}:${port}`);
  
  wsClient.onopen = () => {
    console.log("Connected to local synchronization server");
  };

  wsClient.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      onMessage(data);
    } catch (e) {
      console.error("Failed to parse WS message", e);
    }
  };

  wsClient.onerror = (err) => {
    console.error("WS error:", err);
  };
}

export async function broadcastToLocalNetwork(actionType: string, payload: any): Promise<void> {
  if (!isTauri()) {
    // Web fallback
    return;
  }
  
  const messageStr = JSON.stringify({ type: actionType, payload });
  
  try {
    // Use Tauri to broadcast to all connected WS clients
    await invoke("broadcast_ws_message", { message: messageStr });
  } catch (err) {
    console.error("Broadcast failed:", err);
  }
}

// --- Listen to local Tauri events (same machine) ---
export async function setupTauriListeners(onStateUpdate: (payload: any) => void) {
  if (!isTauri()) return;
  
  const unlisten = await listen("state-updated", (event) => {
    onStateUpdate(event.payload);
  });
  
  return unlisten; // Call this function on cleanup
}
