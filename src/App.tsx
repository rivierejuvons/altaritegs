import { useState, useEffect, useRef } from 'react';
import DeviceSimulator from './components/DeviceSimulator';
import ProducerDashboard from './components/ProducerDashboard';
import ServicePlanView from './components/ServicePlanView';
import ChecklistsView from './components/ChecklistsView';
import PatchbayView from './components/PatchbayView';
import TrainingView from './components/TrainingView';
import AnalyticsView from './components/AnalyticsView';
import IntegrationsSettingsView from './components/IntegrationsSettingsView';
import SetupWizard from './components/SetupWizard';
import { useWakeLock } from './hooks/useWakeLock';
import { getCurrentWindow } from '@tauri-apps/api/window';

import {
  INITIAL_SERVICE_ITEMS,
  INITIAL_CHECKLISTS,
  INITIAL_CHAT_MESSAGES,
  INITIAL_PATCH_NODES,
  INITIAL_PATCH_CONNECTIONS,
  TRAINING_MODULES,
  SLIDE_PRESETS
} from './data/mockData';

import { ServiceItem, ChecklistItem, ChatMessage, PatchNode, PatchConnection, TrainingModule, StageMic } from './types';
import { Layers, CheckSquare, Network, GraduationCap, TrendingUp, Monitor, QrCode, Wifi, Sliders, Keyboard } from 'lucide-react';

export default function App() {
  // Production Mode states
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isAlwaysOnTop, setIsAlwaysOnTop] = useState(false);

  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      // Toggle Fullscreen (F11 or Ctrl+Shift+F)
      if (e.key === 'F11' || (e.ctrlKey && e.shiftKey && e.key === 'F')) {
        e.preventDefault();
        try {
          const win = getCurrentWindow();
          const current = await win.isFullscreen();
          await win.setFullscreen(!current);
          setIsFullscreen(!current);
        } catch (err) {
          console.warn("Fullscreen toggle failed (might be in web preview):", err);
        }
      }
      
      // Toggle Always On Top (Ctrl+Shift+T)
      if (e.ctrlKey && e.shiftKey && e.key === 'T') {
        e.preventDefault();
        try {
          const win = getCurrentWindow();
          await win.setAlwaysOnTop(!isAlwaysOnTop);
          setIsAlwaysOnTop(!isAlwaysOnTop);
        } catch (err) {
          console.warn("Always on Top toggle failed:", err);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAlwaysOnTop]);

  // Global Shared States matching Section 1 "One Truth, Zero Friction" (State Interceptor system!)
  const [items, setItemsState] = useState<ServiceItem[]>(INITIAL_SERVICE_ITEMS);
  const [checklists, setChecklistsState] = useState<ChecklistItem[]>(INITIAL_CHECKLISTS);
  const [chatMessages, setChatMessagesState] = useState<ChatMessage[]>(INITIAL_CHAT_MESSAGES);
  const [patchNodes, setPatchNodesState] = useState<PatchNode[]>(INITIAL_PATCH_NODES);
  const [patchConnections, setPatchConnectionsState] = useState<PatchConnection[]>(INITIAL_PATCH_CONNECTIONS);
  const [trainingModules, setTrainingModulesState] = useState<TrainingModule[]>(TRAINING_MODULES);

  const [stageMics, setStageMicsState] = useState<StageMic[]>([
    { id: 'mic-1', name: 'Wireless Mic 1', assignedTo: 'Pastor Marcus', role: 'Preacher', battery: 92, frequency: '512.4 MHz', signal: 'strong', isMuted: false, level: 75, avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80' },
    { id: 'mic-2', name: 'Wireless Mic 2', assignedTo: 'David (Worship Lead)', role: 'Worship Lead', battery: 78, frequency: '516.2 MHz', signal: 'strong', isMuted: false, level: 20, avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80' },
    { id: 'mic-3', name: 'Wireless Mic 3', assignedTo: 'Julia (Backing Vocals)', role: 'Worship Singer', battery: 85, frequency: '520.8 MHz', signal: 'good', isMuted: true, level: 0, avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80' },
    { id: 'mic-4', name: 'Wireless Mic 4', assignedTo: 'Guest Speaker', role: 'Welcome Host', battery: 100, frequency: '524.1 MHz', signal: 'strong', isMuted: false, level: 10, avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80' }
  ]);

  const [activeSlideIndex, setActiveSlideIndexState] = useState<number>(4);

  // Simulate microphone audio input level fluctuations (local-only to avoid network flooding, satisfying OPT-001)
  useEffect(() => {
    const micInterval = setInterval(() => {
      setStageMicsState(prevMics =>
        prevMics.map(mic => {
          if (mic.isMuted) return { ...mic, level: 0 };
          const change = (Math.random() - 0.5) * 30;
          const nextLevel = Math.max(5, Math.min(95, Math.round(mic.level + change)));
          return { ...mic, level: nextLevel };
        })
      );
    }, 1000);
    return () => clearInterval(micInterval);
  }, []);

  // Shared Core Integration States
  const [pcoToken, setPcoTokenState] = useState<string>('');
  const [pcoConnected, setPcoConnectedState] = useState<boolean>(false);
  const [pcoInternetStatus, setPcoInternetStatusState] = useState<'Online' | 'Offline'>('Online');
  const [pcoLastSync, setPcoLastSyncState] = useState<string | null>(null);

  const [activeEngine, setActiveEngineState] = useState<'FreeShow' | 'ProPresenter' | 'EasyWorship' | 'None'>('FreeShow');
  const [freeShowIp, setFreeShowIpState] = useState<string>('192.168.1.55');
  const [freeShowConnected, setFreeShowConnectedState] = useState<boolean>(true);

  const [proPresenterIp, setProPresenterIpState] = useState<string>('192.168.1.12');
  const [proPresenterConnected, setProPresenterConnectedState] = useState<boolean>(false);
  const [proPropApiEnabled, setProPropApiEnabledState] = useState<boolean>(true);

  const [easyWorshipConnected, setEasyWorshipConnectedState] = useState<boolean>(false);

  const [outputStatus, setOutputStatusState] = useState<'live' | 'preview' | 'blackout'>('live');

  // Active schedule execution pointer
  const [activeSegmentId, setActiveSegmentIdState] = useState<string | null>('item-5'); // default sermon

  // Tracks the timestamp of the last local action to prevent polling race conditions
  const lastActionTime = useRef<number>(0);

  const [isBooting, setIsBooting] = useState(true);
  const [setupComplete, setSetupComplete] = useState(false);

  // Apply Wake Lock for iPhones/iPads/monitors
  useWakeLock();

  // ----------------------------------------------------
  // Shared ref for debouncing high-frequency actions like UPDATE_PATCH_NODES
  const actionTimeoutRef = useRef<any>(null);

  // FULL-STACK SERVER CONNECTION INTERCEPTORS
  // ----------------------------------------------------
  const sendAction = async (type: string, payload: any) => {
    lastActionTime.current = Date.now();

    // High frequency actions like UPDATE_PATCH_NODES should be debounced (OPT-001)
    if (type === 'UPDATE_PATCH_NODES') {
      if (actionTimeoutRef.current) {
        clearTimeout(actionTimeoutRef.current);
      }
      actionTimeoutRef.current = setTimeout(async () => {
        try {
          await fetch('/api/action', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': 'Bearer mock-producer-token'
            },
            body: JSON.stringify({ type, payload })
          });
        } catch (err) {
          console.warn("API state transmission postponed (operating off memory):", err);
        }
      }, 300);
      return;
    }

    try {
      await fetch('/api/action', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mock-producer-token'
        },
        body: JSON.stringify({ type, payload })
      });
    } catch (err) {
      console.warn("API state transmission postponed (operating off memory):", err);
    }
  };

  const setItems = (updater: any) => {
    setItemsState((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      sendAction('UPDATE_SERVICE_ITEMS', { items: next });
      return next;
    });
  };

  const setChecklists = (updater: any) => {
    setChecklistsState((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      sendAction('UPDATE_CHECKLISTS', { checklists: next });
      return next;
    });
  };

  const setChatMessages = (updater: any) => {
    setChatMessagesState((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      sendAction('UPDATE_CHAT_MESSAGES', { chatMessages: next });
      return next;
    });
  };

  const setPatchNodes = (updater: any) => {
    setPatchNodesState((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      sendAction('UPDATE_PATCH_NODES', { nodes: next });
      return next;
    });
  };

  const setPatchConnections = (updater: any) => {
    setPatchConnectionsState((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      sendAction('UPDATE_PATCH_CONNECTIONS', { connections: next });
      return next;
    });
  };

  const setTrainingModules = (updater: any) => {
    setTrainingModulesState((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      sendAction('UPDATE_TRAINING_MODULES', { modules: next });
      return next;
    });
  };

  const setStageMics = (updater: any) => {
    setStageMicsState((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      sendAction('UPDATE_STAGE_MICS', { stageMics: next });
      return next;
    });
  };

  const setActiveSlideIndex = (updater: any) => {
    setActiveSlideIndexState((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      sendAction('CHANGE_SLIDE', { direction: next });
      return next;
    });
  };

  const setPcoToken = (val: string) => {
    setPcoTokenState(val);
    sendAction('SET_PCO_CONNECTION', { token: val, connected: pcoConnected, lastSync: pcoLastSync });
  };

  const setPcoConnected = (val: boolean) => {
    setPcoConnectedState(val);
    sendAction('SET_PCO_CONNECTION', { token: pcoToken, connected: val, lastSync: pcoLastSync });
  };

  const setPcoInternetStatus = (val: 'Online' | 'Offline') => {
    setPcoInternetStatusState(val);
  };

  const setPcoLastSync = (val: string | null) => {
    setPcoLastSyncState(val);
    sendAction('SET_PCO_CONNECTION', { token: pcoToken, connected: pcoConnected, lastSync: val });
  };

  const setActiveEngine = (val: 'FreeShow' | 'ProPresenter' | 'EasyWorship' | 'None') => {
    setActiveEngineState(val);
    sendAction('SET_ENGINE', { activeEngine: val, freeShowIp, proPresenterIp });
  };

  const setFreeShowIp = (val: string) => {
    setFreeShowIpState(val);
    sendAction('SET_ENGINE', { activeEngine, freeShowIp: val, proPresenterIp });
  };

  const setFreeShowConnected = (val: boolean) => {
    setFreeShowConnectedState(val);
    sendAction('SET_CONNECTION_STATUS', { engine: 'FreeShow', connected: val });
  };

  const setProPresenterIp = (val: string) => {
    setProPresenterIpState(val);
    sendAction('SET_ENGINE', { activeEngine, freeShowIp, proPresenterIp: val });
  };

  const setProPresenterConnected = (val: boolean) => {
    setProPresenterConnectedState(val);
    sendAction('SET_CONNECTION_STATUS', { engine: 'ProPresenter', connected: val });
  };

  const setProPropApiEnabled = (val: boolean) => {
    setProPropApiEnabledState(val);
  };

  const setEasyWorshipConnected = (val: boolean) => {
    setEasyWorshipConnectedState(val);
    sendAction('SET_CONNECTION_STATUS', { engine: 'EasyWorship', connected: val });
  };

  const setOutputStatus = (val: any) => {
    setOutputStatusState((prev) => {
      const next = typeof val === 'function' ? val(prev) : val;
      sendAction('SET_OUTPUT_STATUS', { status: next });
      return next;
    });
  };

  const setActiveSegmentId = (id: string | null) => {
    setActiveSegmentIdState(id);
    sendAction('SET_ACTIVE_SEGMENT', { id });
  };

  // ----------------------------------------------------
  // CENTRAL SYNCHRONIZER POLL LOOP (Apple style robust sync)
  // ----------------------------------------------------
  useEffect(() => {
    // Initial fetch to load state from actual backend storage on component mount
    const fetchInitialState = async () => {
      try {
        const res = await fetch('/api/state', {
          headers: { 'Authorization': 'Bearer mock-producer-token' }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.setupComplete !== undefined) setSetupComplete(data.setupComplete);
          if (data.items) setItemsState(data.items);
          if (data.checklists) setChecklistsState(data.checklists);
          if (data.chatMessages) setChatMessagesState(data.chatMessages);
          if (data.patchNodes) setPatchNodesState(data.patchNodes);
          if (data.patchConnections) setPatchConnectionsState(data.patchConnections);
          if (data.trainingModules) setTrainingModulesState(data.trainingModules);
          if (data.stageMics) setStageMicsState(data.stageMics);
          if (data.activeSegmentId) setActiveSegmentIdState(data.activeSegmentId);
          if (data.activeSlideIndex !== undefined) setActiveSlideIndexState(data.activeSlideIndex);
          if (data.outputStatus) setOutputStatusState(data.outputStatus);
          if (data.pcoConnected !== undefined) setPcoConnectedState(data.pcoConnected);
          if (data.pcoToken !== undefined) setPcoTokenState(data.pcoToken);
          if (data.pcoLastSync !== undefined) setPcoLastSyncState(data.pcoLastSync);
          if (data.activeEngine !== undefined) setActiveEngineState(data.activeEngine);
          if (data.freeShowIp !== undefined) setFreeShowIpState(data.freeShowIp);
          if (data.freeShowConnected !== undefined) setFreeShowConnectedState(data.freeShowConnected);
          if (data.proPresenterIp !== undefined) setProPresenterIpState(data.proPresenterIp);
          if (data.proPresenterConnected !== undefined) setProPresenterConnectedState(data.proPresenterConnected);
          if (data.easyWorshipConnected !== undefined) setEasyWorshipConnectedState(data.easyWorshipConnected);
          setIsBooting(false);
        }
      } catch (err) {
        console.warn("Express backend server unreached during initial handshake. Operating offline local database.", err);
        setIsBooting(false);
      }
    };

    fetchInitialState();

    // High fidelity poll interval representing continuous network presence
    const interval = setInterval(async () => {
      // Prevent race conditions: bypass background polling for 4s after local actions
      if (Date.now() - lastActionTime.current < 4000) {
        return;
      }
      try {
        const res = await fetch('/api/state', {
          headers: { 'Authorization': 'Bearer mock-producer-token' }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.setupComplete !== undefined) setSetupComplete(data.setupComplete);
          if (data.items) setItemsState(data.items);
          if (data.checklists) setChecklistsState(data.checklists);
          if (data.chatMessages) setChatMessagesState(data.chatMessages);
          if (data.patchNodes) setPatchNodesState(data.patchNodes);
          if (data.patchConnections) setPatchConnectionsState(data.patchConnections);
          if (data.trainingModules) setTrainingModulesState(data.trainingModules);
          if (data.stageMics) setStageMicsState(data.stageMics);
          if (data.activeSegmentId) setActiveSegmentIdState(data.activeSegmentId);
          if (data.activeSlideIndex !== undefined) setActiveSlideIndexState(data.activeSlideIndex);
          if (data.outputStatus) setOutputStatusState(data.outputStatus);
          if (data.pcoConnected !== undefined) setPcoConnectedState(data.pcoConnected);
          if (data.pcoLastSync !== undefined) setPcoLastSyncState(data.pcoLastSync);
          if (data.activeEngine !== undefined) setActiveEngineState(data.activeEngine);
          if (data.freeShowConnected !== undefined) setFreeShowConnectedState(data.freeShowConnected);
          if (data.proPresenterConnected !== undefined) setProPresenterConnectedState(data.proPresenterConnected);
          if (data.easyWorshipConnected !== undefined) setEasyWorshipConnectedState(data.easyWorshipConnected);
        }
      } catch (err) {
        // Fail silently during background polling to prevent distracting console red ink
      }
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  // Workspace Main View switcher
  const [workspaceTab, setWorkspaceTab] = useState<'Director' | 'Schedule' | 'Checks' | 'Wiring' | 'Academy' | 'Audit' | 'Integrations'>('Director');

  // Triggering simulated QR barcode popup
  const [showQrLauncher, setShowQrLauncher] = useState(false);

  // Keyboard shortcut help modal state
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);

  // Global Keyboard listener for rapid workspace navigation and quick actions
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid intercepting browser shortcuts if user is currently typing in input fields
      const activeEl = document.activeElement;
      if (activeEl) {
        const tagName = activeEl.tagName.toLowerCase();
        if (tagName === 'input' || tagName === 'textarea' || activeEl.hasAttribute('contenteditable')) {
          return;
        }
      }

      // 1. Core Quick Action: Toggle Blackout (Ctrl + Shift + B or Alt + B or Ctrl + B)
      const keyLower = e.key.toLowerCase();
      const isB = keyLower === 'b';
      if (isB && (e.altKey || (e.ctrlKey && e.shiftKey) || e.ctrlKey)) {
        e.preventDefault();
        setOutputStatus((prev: any) => prev === 'blackout' ? 'live' : 'blackout');
        return;
      }

      // 2. Tab switcher shortcuts: Ctrl + [1-7] or Alt + [1-7]
      const digitMatch = e.key.match(/^[1-7]$/);
      if (digitMatch && (e.ctrlKey || e.altKey || e.metaKey)) {
        e.preventDefault();
        const tabMap: Record<string, 'Director' | 'Schedule' | 'Checks' | 'Wiring' | 'Academy' | 'Audit' | 'Integrations'> = {
          '1': 'Director',
          '2': 'Schedule',
          '3': 'Checks',
          '4': 'Wiring',
          '5': 'Academy',
          '6': 'Audit',
          '7': 'Integrations'
        };
        const targetTab = tabMap[e.key];
        if (targetTab) {
          setWorkspaceTab(targetTab);
        }
        return;
      }

      // 3. Display Keyboard shortcuts menu (Pressing '?' or Ctrl + '/')
      if (e.key === '?' || (e.ctrlKey && e.key === '/')) {
        e.preventDefault();
        setShowShortcutsHelp(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (isBooting) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center font-sans">
        <div className="animate-pulse flex flex-col items-center">
          <Monitor className="w-12 h-12 text-zinc-600 mb-4" />
          <p className="text-zinc-500 text-sm font-mono uppercase tracking-widest">Starting Altarite...</p>
        </div>
      </div>
    );
  }

  if (!setupComplete) {
    return (
      <SetupWizard 
        onComplete={async (data) => {
          setSetupComplete(true);
          await fetch('/api/action', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': 'Bearer mock-producer-token'
            },
            body: JSON.stringify({ type: 'INITIALIZE_WORKSPACE', payload: data })
          });
          window.location.reload();
        }} 
      />
    );
  }

  return (
    <DeviceSimulator
      items={items}
      setItems={setItems}
      checklists={checklists}
      setChecklists={setChecklists}
      activeId={activeSegmentId}
      stageMics={stageMics}
      setStageMics={setStageMics}
      activeSlideIndex={activeSlideIndex}
      setActiveSlideIndex={setActiveSlideIndex}
    >
      <div className="flex flex-col min-h-full space-y-6" id="altarite-workspace">
        {/* Main Workspace Header & Navigation bar */}
        <header className="bg-[#0a0a0c]/80 backdrop-blur-md border border-white/[0.06] rounded-2xl p-5 shadow-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 select-none relative overflow-hidden" id="workspace-header">
          {/* Accent lighting strip */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center font-black font-sans text-xl text-black shadow-lg shadow-amber-500/10">
              A
            </div>
            <div>
              <h2 className="text-sm font-black uppercase font-sans text-white tracking-widest flex items-center gap-2">
                Altarite Live OS
                <span className="text-[9px] font-mono font-bold tracking-widest text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md">
                  STAGE CONNECT
                </span>
              </h2>
              <p className="text-xs text-neutral-400 mt-0.5">Tactile low-overhead LAN production software for modern congregations.</p>
            </div>
          </div>

          {/* Quick Connection Bar indicators */}
          <div className="flex items-center gap-2 text-xs font-mono">
            <button
              onClick={() => setShowShortcutsHelp(!showShortcutsHelp)}
              className="flex items-center gap-1.5 bg-black hover:bg-neutral-900 px-3.5 py-2.5 rounded-xl border border-white/[0.06] text-[11px] text-zinc-300 transition-all cursor-pointer hover:border-amber-500/40"
              title="Show Keyboard Shortcuts (Press ?)"
              id="shortcuts-help-trigger"
            >
              <Keyboard className="h-4 w-4 text-amber-500" />
              <span className="font-semibold">Shortcuts (?)</span>
            </button>

            <button
              onClick={() => setShowQrLauncher(!showQrLauncher)}
              className="flex items-center gap-1.5 bg-black hover:bg-neutral-900 px-3.5 py-2.5 rounded-xl border border-white/[0.06] text-[11px] text-zinc-300 transition-all cursor-pointer hover:border-amber-500/40"
              title="Show volunteer QR coupling code"
              id="qr-coupling-trigger"
            >
              <QrCode className="h-4 w-4 text-amber-500" />
              <span className="font-semibold">Connect QR Code</span>
            </button>

            <div className="flex items-center gap-1.5 text-[11px] text-neutral-400 pl-2">
              <span className="w-2 h-2 bg-amber-500 rounded-full animate-ping shrink-0" />
              <span>STATION HOST: <span className="text-zinc-200">LOCAL LAN</span></span>
            </div>
          </div>
        </header>

        {/* QR Coupling overlay drawer */}
        {showQrLauncher && (
          <div className="bg-[#0c0c0e] border border-amber-500/30 rounded-2xl p-6 shadow-2xl flex flex-col sm:flex-row items-center gap-6 relative overflow-hidden" id="qr-drawer">
            <div className="absolute inset-0 bg-amber-500/[0.01] pointer-events-none" />
            <div className="bg-white p-3.5 rounded-xl shadow-md shrink-0 select-none">
              <QrCode className="h-28 w-28 text-neutral-950" />
            </div>
            <div className="space-y-2 text-xs">
              <h3 className="text-white font-sans text-sm font-black uppercase tracking-wider flex items-center gap-1.5">
                <Wifi className="text-amber-500 h-4.5 w-4.5" />
                Scan to Sync Checklists Instantly
              </h3>
              <p className="text-zinc-400 leading-relaxed font-sans max-w-xl">
                Deploy checklists directly on volunteer hardware. Volunteers scan this security safe code to authenticate and sign off tasks instantly with zero internet overhead.
              </p>
              <div className="bg-black border border-white/[0.06] p-2.5 rounded-lg text-[10px] font-mono text-zinc-300">
                LAN ENDPOINT: <span className="text-amber-500 font-semibold">altarite.local:3000/mobile</span>
              </div>
            </div>
            <button
              onClick={() => setShowQrLauncher(false)}
              className="absolute top-4 right-4 text-neutral-500 hover:text-white transition-colors cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* Workspace Primary Tabbed Menus Bar styled with immersive dark rules */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-1.5 bg-black border border-white/[0.06] p-1.5 rounded-xl select-none text-xs font-sans font-medium" id="workspace-tabs-menu">
          <button
            onClick={() => setWorkspaceTab('Director')}
            className={`py-2.5 px-1.5 rounded-lg transition-all cursor-pointer flex flex-col sm:flex-row items-center justify-center gap-1.5 ${
              workspaceTab === 'Director' ? 'bg-[#18181b] text-amber-500 border border-white/[0.06] shadow-[0_0_15px_rgba(245,158,11,0.06)]' : 'text-neutral-400 hover:bg-white/[0.02] hover:text-white'
            }`}
            id="tab-btn-director"
          >
            <Monitor className="h-4 w-4" /> Director Control
          </button>

          <button
            onClick={() => setWorkspaceTab('Schedule')}
            className={`py-2.5 px-1.5 rounded-lg transition-all cursor-pointer flex flex-col sm:flex-row items-center justify-center gap-1.5 ${
              workspaceTab === 'Schedule' ? 'bg-[#18181b] text-amber-500 border border-white/[0.06] shadow-[0_0_15px_rgba(245,158,11,0.06)]' : 'text-neutral-400 hover:bg-white/[0.02] hover:text-white'
            }`}
            id="tab-btn-schedule"
          >
            <Layers className="h-4 w-4" /> Live Run Sheet
          </button>

          <button
            onClick={() => setWorkspaceTab('Checks')}
            className={`py-2.5 px-1.5 rounded-lg transition-all cursor-pointer flex flex-col sm:flex-row items-center justify-center gap-1.5 ${
              workspaceTab === 'Checks' ? 'bg-[#18181b] text-amber-500 border border-white/[0.06] shadow-[0_0_15px_rgba(245,158,11,0.06)]' : 'text-neutral-400 hover:bg-white/[0.02] hover:text-white'
            }`}
            id="tab-btn-checks"
          >
            <CheckSquare className="h-4 w-4" /> Crew Checks
          </button>

          <button
            onClick={() => setWorkspaceTab('Wiring')}
            className={`py-2.5 px-1.5 rounded-lg transition-all cursor-pointer flex flex-col sm:flex-row items-center justify-center gap-1.5 ${
              workspaceTab === 'Wiring' ? 'bg-[#18181b] text-[#f59e0b] border border-white/[0.06] shadow-[0_0_15px_rgba(245,158,11,0.06)]' : 'text-neutral-400 hover:bg-white/[0.02] hover:text-white'
            }`}
            id="tab-btn-wiring"
          >
            <Network className="h-4 w-4" /> Patchbay Map
          </button>

          <button
            onClick={() => setWorkspaceTab('Academy')}
            className={`py-2.5 px-1.5 rounded-lg transition-all cursor-pointer flex flex-col sm:flex-row items-center justify-center gap-1.5 ${
              workspaceTab === 'Academy' ? 'bg-[#18181b] text-amber-500 border border-white/[0.06] shadow-[0_0_15px_rgba(245,158,11,0.06)]' : 'text-neutral-400 hover:bg-white/[0.02] hover:text-white'
            }`}
            id="tab-btn-academy"
          >
            <GraduationCap className="h-4 w-4" /> Academy
          </button>

          <button
            onClick={() => setWorkspaceTab('Audit')}
            className={`py-2.5 px-1.5 rounded-lg transition-all cursor-pointer flex flex-col sm:flex-row items-center justify-center gap-1.5 ${
              workspaceTab === 'Audit' ? 'bg-[#18181b] text-amber-500 border border-white/[0.06] shadow-[0_0_15px_rgba(245,158,11,0.06)]' : 'text-neutral-400 hover:bg-white/[0.02] hover:text-white'
            }`}
            id="tab-btn-audit"
          >
            <TrendingUp className="h-4 w-4" /> Analytics
          </button>

          <button
            onClick={() => setWorkspaceTab('Integrations')}
            className={`py-2.5 px-1.5 rounded-lg transition-all cursor-pointer flex flex-col sm:flex-row items-center justify-center gap-1.5 ${
              workspaceTab === 'Integrations' ? 'bg-[#18181b] text-amber-500 border border-white/[0.06] shadow-[0_0_15px_rgba(245,158,11,0.06)]' : 'text-neutral-400 hover:bg-white/[0.02] hover:text-white'
            }`}
            id="tab-btn-integrations"
          >
            <Sliders className="h-4 w-4" /> Integrations
          </button>
        </div>

        {/* Content render routing panel switcher */}
        <main className="flex-grow min-h-0" id="workspace-viewport">
          {workspaceTab === 'Director' && (
            <ProducerDashboard
              items={items}
              setItems={setItems}
              checklists={checklists}
              setChecklists={setChecklists}
              chatMessages={chatMessages}
              setChatMessages={setChatMessages}
              slides={SLIDE_PRESETS}
              activeId={activeSegmentId}
              setActiveId={setActiveSegmentId}
              activeEngine={activeEngine}
              setActiveEngine={setActiveEngine}
              freeShowConnected={freeShowConnected}
              setFreeShowConnected={setFreeShowConnected}
              freeShowIp={freeShowIp}
              setFreeShowIp={setFreeShowIp}
              proPresenterConnected={proPresenterConnected}
              setProPresenterConnected={setProPresenterConnected}
              proPresenterIp={proPresenterIp}
              setProPresenterIp={setProPresenterIp}
              proPropApiEnabled={proPropApiEnabled}
              easyWorshipConnected={easyWorshipConnected}
              outputStatus={outputStatus}
              setOutputStatus={setOutputStatus}
              stageMics={stageMics}
              setStageMics={setStageMics}
              currentSlideIndex={activeSlideIndex}
              setCurrentSlideIndex={setActiveSlideIndex}
            />
          )}

          {workspaceTab === 'Schedule' && (
            <ServicePlanView
              items={items}
              setItems={setItems}
              activeId={activeSegmentId}
              setActiveId={setActiveSegmentId}
              pcoConnected={pcoConnected}
              pcoLastSync={pcoLastSync}
              pcoInternetStatus={pcoInternetStatus}
            />
          )}

          {workspaceTab === 'Checks' && (
            <ChecklistsView
              checklists={checklists}
              setChecklists={setChecklists}
            />
          )}

          {workspaceTab === 'Wiring' && (
            <PatchbayView
              nodes={patchNodes}
              setNodes={setPatchNodes}
              connections={patchConnections}
              setConnections={setPatchConnections}
            />
          )}

          {workspaceTab === 'Academy' && (
            <TrainingView
              modules={trainingModules}
              setModules={setTrainingModules}
            />
          )}

          {workspaceTab === 'Audit' && (
            <AnalyticsView
              items={items}
              checklists={checklists}
              trainingModules={trainingModules}
            />
          )}

          {workspaceTab === 'Integrations' && (
            <IntegrationsSettingsView
              items={items}
              setItems={setItems}
              pcoToken={pcoToken}
              setPcoToken={setPcoToken}
              pcoConnected={pcoConnected}
              setPcoConnected={setPcoConnected}
              pcoInternetStatus={pcoInternetStatus}
              setPcoInternetStatus={setPcoInternetStatus}
              pcoLastSync={pcoLastSync}
              setPcoLastSync={setPcoLastSync}
              activeEngine={activeEngine}
              setActiveEngine={setActiveEngine}
              freeShowIp={freeShowIp}
              setFreeShowIp={setFreeShowIp}
              freeShowConnected={freeShowConnected}
              setFreeShowConnected={setFreeShowConnected}
              proPresenterIp={proPresenterIp}
              setProPresenterIp={setProPresenterIp}
              proPresenterConnected={proPresenterConnected}
              setProPresenterConnected={setProPresenterConnected}
              proPropApiEnabled={proPropApiEnabled}
              setProPropApiEnabled={setProPropApiEnabled}
              easyWorshipConnected={easyWorshipConnected}
              setEasyWorshipConnected={setEasyWorshipConnected}
              outputStatus={outputStatus}
              setOutputStatus={setOutputStatus}
            />
          )}
        </main>
      </div>

      {/* Keyboard Shortcuts overlay modal */}
      {showShortcutsHelp && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" id="keyboard-shortcuts-modal" onClick={() => setShowShortcutsHelp(false)}>
          <div 
            className="bg-[#0e0e11] border border-white/[0.08] rounded-3xl p-6 max-w-lg w-full shadow-2xl relative space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-center border-b border-white/[0.06] pb-3 select-none">
              <div className="flex items-center gap-2">
                <Keyboard className="h-5 w-5 text-amber-500 animate-pulse" />
                <h3 className="text-white font-sans text-sm font-black uppercase tracking-wider">
                  Core Keyboard Operations
                </h3>
              </div>
              <button
                onClick={() => setShowShortcutsHelp(false)}
                className="text-neutral-500 hover:text-white transition-colors cursor-pointer text-xs uppercase font-mono"
              >
                Close (✕)
              </button>
            </div>

            {/* Description */}
            <p className="text-xs text-neutral-400 font-sans leading-relaxed">
              Altarite Live OS supports global hardware acceleration keybinds for instantaneous navigation and control on production laptops.
            </p>

            {/* Grid content of keys */}
            <div className="space-y-3.5">
              <div className="space-y-2">
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block font-bold">Workspace Navigation</span>
                <div className="grid grid-cols-1 gap-2.5">
                  {[
                    { keys: ['Ctrl', '1'], desc: 'Director Control Dashboard' },
                    { keys: ['Ctrl', '2'], desc: 'Live Service Runsheet' },
                    { keys: ['Ctrl', '3'], desc: 'Crew Checks / Active Checklists' },
                    { keys: ['Ctrl', '4'], desc: 'Patchbay System Map' },
                    { keys: ['Ctrl', '5'], desc: 'Academy Training Center' },
                    { keys: ['Ctrl', '6'], desc: 'Historical Analytics' },
                    { keys: ['Ctrl', '7'], desc: 'Integrations & Diagnostics Settings' },
                  ].map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-black/40 p-2 rounded-xl border border-white/[0.03]">
                      <span className="text-xs text-neutral-300 font-sans">{item.desc}</span>
                      <div className="flex items-center gap-1 font-mono text-[10px]">
                        {item.keys.map((k, kIdx) => (
                          <kbd key={kIdx} className="bg-neutral-850 text-white border border-white/[0.08] px-1.5 py-0.5 rounded shadow">
                            {k}
                          </kbd>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-white/[0.04]">
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block font-bold">Production Mode</span>
                <div className="grid grid-cols-1 gap-2.5">
                  <div className="flex justify-between items-center bg-black/40 p-2.5 rounded-xl border border-white/[0.03]">
                    <span className="text-xs text-neutral-300 font-sans">Toggle Fullscreen Mode</span>
                    <div className="flex items-center gap-1 font-mono text-[10px]">
                      <kbd className="bg-neutral-850 text-white border border-white/[0.08] px-1.5 py-0.5 rounded shadow">F11</kbd>
                      <span className="text-zinc-500">or</span>
                      <kbd className="bg-neutral-850 text-white border border-white/[0.08] px-1.5 py-0.5 rounded shadow">Ctrl</kbd>
                      <span className="text-zinc-500">+</span>
                      <kbd className="bg-neutral-850 text-white border border-white/[0.08] px-1.5 py-0.5 rounded shadow">Shift</kbd>
                      <span className="text-zinc-500">+</span>
                      <kbd className="bg-neutral-850 text-white border border-white/[0.08] px-1.5 py-0.5 rounded shadow">F</kbd>
                    </div>
                  </div>
                  <div className="flex justify-between items-center bg-black/40 p-2.5 rounded-xl border border-white/[0.03]">
                    <span className="text-xs text-neutral-300 font-sans">Toggle Always On Top</span>
                    <div className="flex items-center gap-1 font-mono text-[10px]">
                      <kbd className="bg-neutral-850 text-white border border-white/[0.08] px-1.5 py-0.5 rounded shadow">Ctrl</kbd>
                      <span className="text-zinc-500">+</span>
                      <kbd className="bg-neutral-850 text-white border border-white/[0.08] px-1.5 py-0.5 rounded shadow">Shift</kbd>
                      <span className="text-zinc-500">+</span>
                      <kbd className="bg-neutral-850 text-white border border-white/[0.08] px-1.5 py-0.5 rounded shadow">T</kbd>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-white/[0.04]">
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block font-bold">Common Actions</span>
                <div className="flex justify-between items-center bg-black/40 p-2.5 rounded-xl border border-white/[0.03]">
                  <span className="text-xs text-neutral-300 font-sans">Toggle Blackout Slide Output</span>
                  <div className="flex items-center gap-1 font-mono text-[10px]">
                    <kbd className="bg-neutral-850 text-white border border-white/[0.08] px-1.5 py-0.5 rounded shadow">Ctrl</kbd>
                    <span className="text-zinc-500">+</span>
                    <kbd className="bg-neutral-850 text-white border border-white/[0.08] px-1.5 py-0.5 rounded shadow">Shift</kbd>
                    <span className="text-zinc-500">+</span>
                    <kbd className="bg-neutral-850 text-white border border-white/[0.08] px-1.5 py-0.5 rounded shadow">B</kbd>
                    <span className="text-zinc-500">or</span>
                    <kbd className="bg-neutral-850 text-white border border-white/[0.08] px-1.5 py-0.5 rounded shadow">Alt</kbd>
                    <span className="text-zinc-500">+</span>
                    <kbd className="bg-neutral-850 text-white border border-white/[0.08] px-1.5 py-0.5 rounded shadow">B</kbd>
                  </div>
                </div>
              </div>
            </div>

            {/* Tip footer */}
            <div className="bg-amber-500/5 border border-amber-500/10 p-3 rounded-2xl text-[10px] text-amber-500/90 leading-relaxed font-sans">
              💡 <strong>Pro Tip</strong>: Pressing <kbd className="bg-neutral-900 border border-white/[0.08] px-1.5 py-0.5 rounded mx-0.5 text-white font-mono text-[9px]">?</kbd> anywhere outside of input fields instantly toggles this manual guide.
            </div>
          </div>
        </div>
      )}
    </DeviceSimulator>
  );
}
