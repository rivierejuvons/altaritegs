# LinkOS Sprint Fixes & Development Roadmap (TASKS.md)

This file serves as the unified task-tracking artifact. Sub-agents can read this document, select active tasks, and mark them completed as they work.

---

## 🔒 Category 1: Security Hardening

- [ ] **SEC-001 (CRITICAL): Missing Schema validation & payload sanitization on `/api/action`**
  - **Issue:** The Express backend accepts any raw payload for actions like `UPDATE_PATCH_NODES`, `UPDATE_PATCH_CONNECTIONS`, and `SYNC_ITEMS_REORDER` with simple `Array.isArray()` checks. It lacks size limits, schema-conformance checks, or nested string sanitization.
  - **Risk:** Malicious payloads can pollute state, inject prototype values, or crash the Node process.
  - **Task:** Introduce a simple runtime validation layer (or Joi/Zod-style inline schema parser) for the POST `/api/action` handler to validate exact properties (e.g., node coordinates as safe integers, strings within safe lengths).

- [ ] **SEC-002 (HIGH): Unauthenticated State Mutations on LAN Access**
  - **Issue:** All endpoints (`/api/state`, `/api/action`, `/api/external/slides/control`) are completely open without session token verification, even though the spec dictates 4-digit PINs for volunteers and password auth for producers.
  - **Risk:** Any device connected to the local Wi-Fi can trigger a blackout, modify the runsheet, or clear checklists anonymously.
  - **Task:** Implement simple header-based authentication checks (e.g., matching a PIN or checking a Mock JWT token) inside `/api/action` and `/api/external/slides/control`.

- [ ] **SEC-003 (MEDIUM): Cross-Origin Resource Sharing (CORS) Over-exposure**
  - **Issue:** By default, when binding to `0.0.0.0` for local LAN access, there are no restricted CORS policies.
  - **Risk:** Malicious local websites visited in other tabs can execute cross-origin fetch requests to the local LinkOS instance.
  - **Task:** Configure standard CORS middleware in `server.ts` to only permit requests from local trusted origins or explicit UI frame hosts.

- [ ] **SEC-004 (LOW): Raw Memory Allocations & Heap Overgrowth in Diagnostics**
  - **Issue:** `/api/external/diagnostics` dumps full `process.memoryUsage()` fields to the world.
  - **Risk:** Minor information exposure regarding system footprint.
  - **Task:** Restrict diagnostic logs to local admin-authorized calls.

---

## ⚡ Category 2: Performance & Memory Optimization

- [ ] **OPT-001 (HIGH): Micro-rendering Lag due to Global State Synchronizations**
  - **Issue:** The `DeviceSimulator` and main workspace exchange entire state dumps over HTTP. Every tiny coordinate change in the patchbay or microphone console forces a full-state repaint of the entire DOM.
  - **Risk:** Stuttering UI animations during interactive drag-and-drops or real-time audio VU monitoring.
  - **Task:** Debounce high-frequency state updates (e.g. coordinates in `UPDATE_PATCH_NODES` or slider increments). Use localized state or CSS transitions for fluid visual shifts instead of pushing raw actions to the server on every pixel moved.

- [ ] **OPT-002 (MEDIUM): Interval Memory Leaks in Component Bodies**
  - **Issue:** High-frequency timers (like VU level mock fluctuations) run on un-debounced intervals.
  - **Risk:** Multiple mounting/unmounting of screens can trigger orphan intervals that exhaust the single-threaded CPU loop.
  - **Task:** Ensure every `setInterval` and `useEffect` listener has absolute guarantees of clean-up returned from their hooks.

- [ ] **OPT-003 (MEDIUM): Dead Code & Redundant Components**
  - **Issue:** There are unused styles, CSS imports, or minor variables from original prototypes that are never loaded.
  - **Task:** Audit imports across `App.tsx` and `ProducerDashboard.tsx` to strip unused functions and simplify code paths.

---

## 🔗 Category 3: Traceability & Signatures Integrity

- [ ] **TRC-001: Sync state structures across App.tsx and server.ts**
  - **Issue:** The properties of `state` inside `server.ts` must align perfectly with those managed by `App.tsx` and `ProducerDashboard.tsx`.
  - **Task:** Create unified signature interfaces in `src/types.ts` for all payload contracts (e.g., `SET_ACTIVE_SEGMENT`, `TOGGLE_CHECKLIST_ITEM`, etc.) and enforce strict typing across the HTTP request/response pipeline.

- [ ] **TRC-002: Align Wireless Mic console with backend state persistence**
  - **Issue:** The newly implemented microphone console tracks inline name changes and mute/unmute actions on the client.
  - **Task:** Wire the microphone actions (mute toggle, name edit) to the backend `/api/action` endpoint via a new `"UPDATE_STAGE_MICS"` action. This ensures stage monitors and producer displays update simultaneously, adhering to the "One Truth, Zero Friction" philosophy.
