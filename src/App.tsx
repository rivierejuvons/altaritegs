import { useState, useEffect } from 'react';
import DeviceSimulator from './components/DeviceSimulator';
import ProducerDashboard from './components/ProducerDashboard';
import ServicePlanView from './components/ServicePlanView';
import ChecklistsView from './components/ChecklistsView';
import PatchbayView from './components/PatchbayView';
import TrainingView from './components/TrainingView';
import AnalyticsView from './components/AnalyticsView';
import IntegrationsSettingsView from './components/IntegrationsSettingsView';

import {
  INITIAL_SERVICE_ITEMS,
  INITIAL_CHECKLISTS,
  INITIAL_CHAT_MESSAGES,
  INITIAL_PATCH_NODES,
  INITIAL_PATCH_CONNECTIONS,
  TRAINING_MODULES,
  SLIDE_PRESETS
} from './data/mockData';

import { ServiceItem, ChecklistItem, ChatMessage, PatchNode, PatchConnection, TrainingModule } from './types';
import { Layers, CheckSquare, Network, GraduationCap, TrendingUp, Monitor, QrCode, Wifi, Sliders } from 'lucide-react';

export default function App() {
  // Global Shared States matching Section 1 "One Truth, Zero Friction" (State Interceptor system!)
  const [items, setItemsState] = useState<ServiceItem[]>(INITIAL_SERVICE_ITEMS);
  const [checklists, setChecklistsState] = useState<ChecklistItem[]>(INITIAL_CHECKLISTS);
  const [chatMessages, setChatMessagesState] = useState<ChatMessage[]>(INITIAL_CHAT_MESSAGES);
  const [patchNodes, setPatchNodesState] = useState<PatchNode[]>(INITIAL_PATCH_NODES);
  const [patchConnections, setPatchConnectionsState] = useState<PatchConnection[]>(INITIAL_PATCH_CONNECTIONS);
  const [trainingModules, setTrainingModulesState] = useState<TrainingModule[]>(TRAINING_MODULES);

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

  // ----------------------------------------------------
  // FULL-STACK SERVER CONNECTION INTERCEPTORS
  // ----------------------------------------------------
  const sendAction = async (type: string, payload: any) => {
    try {
      await fetch('/api/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
        const res = await fetch('/api/state');
        if (res.ok) {
          const data = await res.json();
          if (data.items) setItemsState(data.items);
          if (data.checklists) setChecklistsState(data.checklists);
          if (data.chatMessages) setChatMessagesState(data.chatMessages);
          if (data.patchNodes) setPatchNodesState(data.patchNodes);
          if (data.patchConnections) setPatchConnectionsState(data.patchConnections);
          if (data.trainingModules) setTrainingModulesState(data.trainingModules);
          if (data.activeSegmentId) setActiveSegmentIdState(data.activeSegmentId);
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
        }
      } catch (err) {
        console.warn("Express backend server unreached during initial handshake. Operating offline local database.", err);
      }
    };

    fetchInitialState();

    // High fidelity poll interval representing continuous network presence
    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/state');
        if (res.ok) {
          const data = await res.json();
          if (data.items) setItemsState(data.items);
          if (data.checklists) setChecklistsState(data.checklists);
          if (data.chatMessages) setChatMessagesState(data.chatMessages);
          if (data.patchNodes) setPatchNodesState(data.patchNodes);
          if (data.patchConnections) setPatchConnectionsState(data.patchConnections);
          if (data.trainingModules) setTrainingModulesState(data.trainingModules);
          if (data.activeSegmentId) setActiveSegmentIdState(data.activeSegmentId);
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

  return (
    <DeviceSimulator
      items={items}
      setItems={setItems}
      checklists={checklists}
      setChecklists={setChecklists}
      activeId={activeSegmentId}
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
          <div className="flex items-center gap-4 text-xs font-mono">
            <button
              onClick={() => setShowQrLauncher(!showQrLauncher)}
              className="flex items-center gap-1.5 bg-black hover:bg-neutral-900 px-3.5 py-2.5 rounded-xl border border-white/[0.06] text-[11px] text-zinc-300 transition-all cursor-pointer hover:border-amber-500/40"
              title="Show volunteer QR coupling code"
              id="qr-coupling-trigger"
            >
              <QrCode className="h-4 w-4 text-amber-500" />
              <span className="font-semibold">Connect QR Code</span>
            </button>

            <div className="flex items-center gap-1.5 text-[11px] text-neutral-400">
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
    </DeviceSimulator>
  );
}
