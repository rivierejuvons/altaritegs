import React, { useState, useEffect } from 'react';
import {
  Link,
  Globe,
  RefreshCw,
  Sliders,
  Tv,
  ListTodo,
  Info,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Play,
  Share2,
  Radio,
  Computer,
  Video,
  MessageSquare,
  Network,
  Users,
  Search,
  BookOpen,
  Eye,
  SlidersHorizontal
} from 'lucide-react';
import { ServiceItem } from '../types';

interface IntegrationsSettingsViewProps {
  items: ServiceItem[];
  setItems: React.Dispatch<React.SetStateAction<ServiceItem[]>>;
  
  // Lifted integration states for synchronization
  pcoToken: string;
  setPcoToken: (token: string) => void;
  pcoConnected: boolean;
  setPcoConnected: (con: boolean) => void;
  pcoInternetStatus: 'Online' | 'Offline';
  setPcoInternetStatus: (s: 'Online' | 'Offline') => void;
  pcoLastSync: string | null;
  setPcoLastSync: (time: string | null) => void;

  activeEngine: 'FreeShow' | 'ProPresenter' | 'EasyWorship' | 'None';
  setActiveEngine: (val: 'FreeShow' | 'ProPresenter' | 'EasyWorship' | 'None') => void;

  freeShowIp: string;
  setFreeShowIp: (val: string) => void;
  freeShowConnected: boolean;
  setFreeShowConnected: (val: boolean) => void;
  
  proPresenterIp: string;
  setProPresenterIp: (val: string) => void;
  proPresenterConnected: boolean;
  setProPresenterConnected: (val: boolean) => void;
  proPropApiEnabled: boolean;
  setProPropApiEnabled: (val: boolean) => void;

  easyWorshipConnected: boolean;
  setEasyWorshipConnected: (val: boolean) => void;
  
  outputStatus: 'live' | 'preview' | 'blackout';
  setOutputStatus: (val: 'live' | 'preview' | 'blackout') => void;
}

export default function IntegrationsSettingsView({
  items,
  setItems,
  pcoToken,
  setPcoToken,
  pcoConnected,
  setPcoConnected,
  pcoInternetStatus,
  setPcoInternetStatus,
  pcoLastSync,
  setPcoLastSync,
  activeEngine,
  setActiveEngine,
  freeShowIp,
  setFreeShowIp,
  freeShowConnected,
  setFreeShowConnected,
  proPresenterIp,
  setProPresenterIp,
  proPresenterConnected,
  setProPresenterConnected,
  proPropApiEnabled,
  setProPropApiEnabled,
  easyWorshipConnected,
  setEasyWorshipConnected,
  outputStatus,
  setOutputStatus
}: IntegrationsSettingsViewProps) {
  // Navigation for settings sub-categories
  const [subTab, setSubTab] = useState<'PCO' | 'FreeShow' | 'ProPresenter' | 'EasyWorship' | 'Phase2' | 'Telemetry'>('PCO');

  // Input fields local to Settings page
  const [tokenInput, setTokenInput] = useState(pcoToken);
  const [fsIpInput, setFsIpInput] = useState(freeShowIp);
  const [ppIpInput, setPpIpInput] = useState(proPresenterIp);

  // Simulated scan state
  const [isScanning, setIsScanning] = useState(false);
  const [scanMessage, setScanMessage] = useState('');
  
  // Sync counter details (5 min timer simulation)
  const [nextSyncSeconds, setNextSyncSeconds] = useState(300);

  // Show detailed connection modal for active engine
  const [showDetailModal, setShowDetailModal] = useState(false);

  // ProPresenter detailed guide state
  const [showProGuide, setShowProGuide] = useState(false);

  // Simulated validation state for PCO
  const [validationResult, setValidationResult] = useState<{
    servicesCount: number;
    teamsCount: number;
    peopleCount: number;
  } | null>(pcoConnected ? { servicesCount: 3, teamsCount: 5, peopleCount: 24 } : null);
  const [pcoError, setPcoError] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Mock volunteers synced from PCO with Accept/Decline status
  const [volunteers, setVolunteers] = useState([
    { name: 'Sarah Miller', role: 'Producer', status: 'Accepted', time: '08:10 AM' },
    { name: 'David Jones', role: 'Worship Lead', status: 'Accepted', time: '08:15 AM' },
    { name: 'Julia Vance', role: 'Keyboard', status: 'Accepted', time: '08:24 AM' },
    { name: 'James Carter', role: 'Audio Engineer', status: 'Accepted', time: '08:05 AM' },
    { name: 'Maria Santos', role: 'Video Switcher', status: 'Accepted', time: '08:31 AM' },
    { name: 'Toni Albright', role: 'Lekos Operator', status: 'Pending', time: '-' },
    { name: 'Robert Vance', role: 'Camera 2 Operator', status: 'Pending', time: '-' },
    { name: 'John Smith', role: 'Utility Hand', status: 'Declined', time: '-' },
  ]);

  // Handle countdown background sync tick
  useEffect(() => {
    let syncInterval: any = null;
    if (pcoConnected && pcoInternetStatus === 'Online') {
      syncInterval = setInterval(() => {
        setNextSyncSeconds(prev => {
          if (prev <= 1) {
            // Trigger automatic sync
            triggerPcoSync();
            return 300;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(syncInterval);
  }, [pcoConnected, pcoInternetStatus]);

  // Automatically scan port 5505 on startup for FreeShow if not connected
  useEffect(() => {
    if (!freeShowConnected && activeEngine === 'FreeShow') {
      simulateFreeShowScan();
    }
  }, [activeEngine]);

  const simulateFreeShowScan = () => {
    setIsScanning(true);
    setScanMessage('Scanning LAN ports for active presentation software instances...');
    setTimeout(() => {
      // Scans for port 5505 silently
      setFreeShowConnected(true);
      setIsScanning(false);
      setScanMessage('Silently connected! Auto-discovered FreeShow instance on port 5505 (192.168.1.110)');
    }, 1200);
  };

  const triggerPcoSync = () => {
    if (!pcoConnected) return;
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      const now = new Date();
      setPcoLastSync(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      
      // Add a visual confirmation toast style message
      setScanMessage('Sync Completed successfully! Fetched updated schedules.');
    }, 1500);
  };

  const handlePcoConnect = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenInput.trim()) {
      setPcoError('Please provide a valid Private Access Token.');
      return;
    }
    setIsSyncing(true);
    setPcoError(null);

    setTimeout(() => {
      // Validate Token Simulation
      if (tokenInput.trim().toLowerCase().startsWith('pat_expired') || tokenInput.length < 8) {
        setPcoError('Expired or invalid Personal Access Token token credential. Please generate clean credentials.');
        setPcoConnected(false);
        setIsSyncing(false);
        setValidationResult(null);
      } else {
        setPcoToken(tokenInput.trim());
        setPcoConnected(true);
        setIsSyncing(false);
        setValidationResult({
          servicesCount: 3,
          teamsCount: 5,
          peopleCount: 24
        });
        const now = new Date();
        setPcoLastSync(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        setScanMessage('Altarite authenticated perfectly with planningcenteronline.com');
      }
    }, 1500);
  };

  const handlePcoDisconnect = () => {
    setPcoConnected(false);
    setPcoToken('');
    setTokenInput('');
    setValidationResult(null);
    setPcoError(null);
  };

  const handleFreeShowManualIp = (e: React.FormEvent) => {
    e.preventDefault();
    setFreeShowIp(fsIpInput);
    setFreeShowConnected(true);
    setScanMessage(`Configured FreeShow manually at ${fsIpInput}:5505`);
  };

  const handleProPresenterManualIp = (e: React.FormEvent) => {
    e.preventDefault();
    setProPresenterIp(ppIpInput);
    if (!proPropApiEnabled) {
      setProPresenterConnected(false);
    } else {
      setProPresenterConnected(true);
    }
    setScanMessage(`Configured ProPresenter manually at ${ppIpInput}`);
  };

  // Format countdown string
  const formatSyncCountdown = (totalSecs: number) => {
    const min = Math.floor(totalSecs / 60);
    const sec = totalSecs % 60;
    return `${min}m ${sec < 10 ? '0' : ''}${sec}s`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6" id="integrations-view-parent">
      {/* Integrations Category Menu Bar */}
      <div className="lg:col-span-1 space-y-3" id="integrations-sidebar-tabs">
        <div className="immersive-panel p-4 space-y-4">
          <div className="border-b border-white/[0.06] pb-3 select-none">
            <h3 className="text-xs font-black uppercase text-white tracking-widest flex items-center gap-1.5">
              <Sliders className="h-4 w-4 text-amber-500" />
              INTEGRATION RAILS
            </h3>
            <p className="text-[10px] text-zinc-500 font-mono mt-0.5">Control live deck hookups.</p>
          </div>

          <nav className="flex flex-col gap-1.5 font-sans text-xs">
            {/* PCO */}
            <button
              onClick={() => setSubTab('PCO')}
              className={`w-full p-2.5 rounded-lg text-left flex items-center justify-between transition-all cursor-pointer ${
                subTab === 'PCO'
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-[0_0_12px_rgba(245,158,11,0.04)] font-semibold'
                  : 'text-neutral-400 hover:bg-white/[0.02] hover:text-white border border-transparent'
              }`}
            >
              <span className="flex items-center gap-2">
                <Globe className="h-4 w-4 shrink-0" />
                Planning Center (PCO)
              </span>
              <span className={`w-2 h-2 rounded-full ${pcoConnected ? 'bg-emerald-500' : 'bg-neutral-600'}`} />
            </button>

            {/* FreeShow */}
            <button
              onClick={() => setSubTab('FreeShow')}
              className={`w-full p-2.5 rounded-lg text-left flex items-center justify-between transition-all cursor-pointer ${
                subTab === 'FreeShow'
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-[0_0_12px_rgba(245,158,11,0.04)] font-semibold'
                  : 'text-neutral-400 hover:bg-white/[0.02] hover:text-white border border-transparent'
              }`}
            >
              <span className="flex items-center gap-2">
                <Tv className="h-4 w-4 shrink-0" />
                FreeShow Slides
              </span>
              <span className={`w-2 h-2 rounded-full ${freeShowConnected ? 'bg-emerald-500' : 'bg-neutral-600'}`} />
            </button>

            {/* ProPresenter */}
            <button
              onClick={() => setSubTab('ProPresenter')}
              className={`w-full p-2.5 rounded-lg text-left flex items-center justify-between transition-all cursor-pointer ${
                subTab === 'ProPresenter'
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-[0_0_12px_rgba(245,158,11,0.04)] font-semibold'
                  : 'text-neutral-400 hover:bg-white/[0.02] hover:text-white border border-transparent'
              }`}
            >
              <span className="flex items-center gap-2">
                <Tv className="h-4 w-4 shrink-0" />
                ProPresenter Slides
              </span>
              <span className={`w-2 h-2 rounded-full ${proPresenterConnected ? 'bg-emerald-500' : 'bg-neutral-600'}`} />
            </button>

            {/* EasyWorship */}
            <button
              onClick={() => setSubTab('EasyWorship')}
              className={`w-full p-2.5 rounded-lg text-left flex items-center justify-between transition-all cursor-pointer ${
                subTab === 'EasyWorship'
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-[0_0_12px_rgba(245,158,11,0.04)] font-semibold'
                  : 'text-neutral-400 hover:bg-white/[0.02] hover:text-white border border-transparent'
              }`}
            >
              <span className="flex items-center gap-2">
                <Tv className="h-4 w-4 shrink-0" />
                EasyWorship Slides
              </span>
              <span className={`w-2 h-2 rounded-full ${easyWorshipConnected ? 'bg-emerald-500' : 'bg-neutral-600'}`} />
            </button>

            {/* Phase 2 */}
            <button
              onClick={() => setSubTab('Phase2')}
              className={`w-full p-2.5 rounded-lg text-left flex items-center justify-between transition-all cursor-pointer ${
                subTab === 'Phase2'
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-[0_0_12px_rgba(245,158,11,0.04)] font-semibold'
                  : 'text-neutral-400 hover:bg-white/[0.02] hover:text-white border border-transparent'
              }`}
            >
              <span className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 shrink-0" />
                OBS, Restream, Slack
              </span>
              <span className="text-[8px] bg-neutral-850 border border-white/[0.06] text-neutral-400 px-1.5 py-0.5 rounded font-mono">P2</span>
            </button>

            {/* LAN Daemon Telemetry */}
            <button
              onClick={() => setSubTab('Telemetry')}
              className={`w-full p-2.5 rounded-lg text-left flex items-center justify-between transition-all cursor-pointer ${
                subTab === 'Telemetry'
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-[0_0_12px_rgba(245,158,11,0.04)] font-semibold'
                  : 'text-neutral-400 hover:bg-white/[0.02] hover:text-white border border-transparent'
              }`}
            >
              <span className="flex items-center gap-2">
                <Network className="h-4 w-4 shrink-0" />
                LAN Server Telemetry
              </span>
              <span className="text-[8px] bg-amber-500/10 border border-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded font-mono">LIVE</span>
            </button>
          </nav>
        </div>

        {/* Global Connection Overview Status Box */}
        <div className="immersive-panel p-4 space-y-3.5 text-xs">
          <div className="flex justify-between items-center select-none border-b border-white/[0.06] pb-2 text-[10px] font-mono text-neutral-400">
            <span>ACTIVE PROJECTION ENGINE</span>
            <span className="text-amber-500 font-bold">{activeEngine}</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
            <button
              onClick={() => {
                setActiveEngine('FreeShow');
                if (!freeShowIp) setFreeShowIp('192.168.1.55');
              }}
              className={`p-2 rounded-lg text-center border font-medium ${activeEngine === 'FreeShow' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-black text-neutral-500 border-white/[0.04] hover:text-zinc-300'}`}
            >
              FreeShow
            </button>
            <button
              onClick={() => {
                setActiveEngine('ProPresenter');
                if (!proPresenterIp) setProPresenterIp('192.168.1.12');
              }}
              className={`p-2 rounded-lg text-center border font-medium ${activeEngine === 'ProPresenter' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-black text-neutral-500 border-white/[0.04] hover:text-zinc-300'}`}
            >
              ProPresenter
            </button>
          </div>

          <div className="bg-black/50 border border-white/[0.04] p-2.5 rounded-lg space-y-1 text-[10px] font-mono text-neutral-500">
            <div className="flex justify-between">
              <span>Sync status:</span>
              <span className={activeEngine !== 'None' ? 'text-emerald-400' : 'text-zinc-505'}>
                {activeEngine !== 'None' ? 'Synchronizing' : 'None Selected'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>LAN Broadcast:</span>
              <span className="text-neutral-300">Enabled</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Connection setup panel content */}
      <div className="lg:col-span-3 space-y-6" id="integrations-main-viewport">
        
        {/* Sync Offline / Alert Banner */}
        {pcoConnected && pcoInternetStatus === 'Offline' && (
          <div className="bg-amber-950/40 border border-amber-500/30 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs" id="offline-sim-banner">
            <div className="flex gap-2.5">
              <AlertCircle className="text-amber-500 h-5 w-5 shrink-0 mt-0.5" />
              <div>
                <p className="text-amber-400 font-bold">Offline Sync Fallback Mode</p>
                <p className="text-neutral-400 mt-0.5">Altarite is using the last cached PCO run sheet schedule. Stage checklist execution and slide links operate normally while disconnected.</p>
              </div>
            </div>
            <div className="text-[10px] font-mono text-neutral-400 bg-black/80 px-2.5 py-1 rounded-md border border-white/[0.06] shrink-0">
              LAST SYNCED: {pcoLastSync || '08:35 AM'}
            </div>
          </div>
        )}

        {/* 1. PLANNING CENTER ONLINE TAB */}
        {subTab === 'PCO' && (
          <div className="immersive-panel p-6 space-y-6" id="panel-setup-pco">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/[0.06] pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-amber-500" />
                  <h2 className="text-sm font-black uppercase text-white tracking-widest">Planning Center Online Service Sync</h2>
                </div>
                <p className="text-xs text-neutral-400 mt-1">Automatic download of schedules, times, segments, and confirmed volunteer team lists.</p>
              </div>

              {/* Status and Internet options */}
              <div className="flex items-center gap-2 self-start sm:self-center" id="pco-live-toggle-set">
                <span className="text-[10px] font-mono text-zinc-500 uppercase">Simulated WAN:</span>
                <button
                  onClick={() => setPcoInternetStatus(pcoInternetStatus === 'Online' ? 'Offline' : 'Online')}
                  className={`px-3 py-1 text-[10px] font-mono rounded-lg transition-all border ${
                    pcoInternetStatus === 'Online'
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                      : 'bg-red-500/10 border-red-500/30 text-red-400'
                  }`}
                  id="pco-internet-state-toggle"
                >
                  {pcoInternetStatus === 'Online' ? '● INTERNET CONNECTED' : '○ OFFLINE (NO WAN)'}
                </button>
              </div>
            </div>

            {pcoError && (
              <div className="bg-red-950/35 border border-red-500/35 p-3.5 rounded-lg flex items-start gap-2.5 text-xs text-red-300" id="pco-error-bubble">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">PCO Authentication Error</p>
                  <p className="mt-0.5 opacity-90">{pcoError}</p>
                  <p className="mt-1 font-mono text-[10px]">
                    Ensure your token hasn&apos;t expired or been revoked in your profile.
                  </p>
                </div>
              </div>
            )}

            {!pcoConnected ? (
              <div className="space-y-4" id="pco-credentials-form-box">
                <div className="bg-neutral-950/50 border border-white/[0.04] p-4 rounded-xl text-neutral-400 leading-relaxed text-xs">
                  <p className="font-bold text-white mb-1">Getting Started with Planning Center API</p>
                  To sync schedules, Altarite needs a **Personal Access Token (PAT)**. You can easily generate a private token on the PCO developer panel. No oauth complexity or firewall mapping required.
                  <a
                    href="https://api.planningcenteronline.com/oauth/applications"
                    target="_blank"
                    rel="noreferrer"
                    className="text-amber-500 font-semibold underline block mt-2 hover:text-amber-400"
                  >
                    Generate a New PCO Token on Developer Page ↗
                  </a>
                </div>

                <form onSubmit={handlePcoConnect} className="space-y-4" id="pco-auth-credentials-form">
                  <div>
                    <label className="block text-xs font-mono text-zinc-400 mb-1.5 uppercase">Personal Access Token</label>
                    <input
                      type="password"
                      placeholder="Paste your token (e.g. pat_xxxx...)"
                      value={tokenInput}
                      onChange={(e) => setTokenInput(e.target.value)}
                      className="w-full bg-black border border-white/[0.06] rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500 font-mono tracking-widest"
                      id="input-token-pco-value"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSyncing || !tokenInput}
                    className="w-full bg-amber-500 hover:bg-amber-400 text-black font-black uppercase tracking-wider text-xs py-3 rounded-xl transition-all font-sans cursor-pointer flex items-center justify-center gap-2 shadow-md shadow-amber-500/10"
                    id="btn-pco-verify-submit"
                  >
                    {isSyncing ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" /> VALIDATING CREDENTIALS...
                      </>
                    ) : (
                      'Validate Token & Download Core Run Sheet'
                    )}
                  </button>
                </form>
              </div>
            ) : (
              <div className="space-y-6" id="pco-connected-dashboard">
                {/* Visual Status Indicator cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-black/40 border border-white/[0.04] p-4 rounded-xl space-y-1">
                    <span className="text-[9px] font-mono text-neutral-500 uppercase block">AUTHENTICATION STATUS</span>
                    <span className="text-emerald-400 font-mono text-xs font-bold block flex items-center gap-1">
                      <CheckCircle2 className="h-4 w-4 shrink-0" /> Verified Credentials
                    </span>
                  </div>
                  <div className="bg-black/40 border border-white/[0.04] p-4 rounded-xl space-y-1">
                    <span className="text-[9px] font-mono text-neutral-500 uppercase block">BACKGROUND AUTO-SYNC</span>
                    <span className="text-zinc-200 font-mono text-xs block">
                      {pcoInternetStatus === 'Online' ? `Syncing in ${formatSyncCountdown(nextSyncSeconds)}` : 'DISABLED (OFFLINE)'}
                    </span>
                  </div>
                  <div className="bg-black/40 border border-white/[0.04] p-4 rounded-xl space-y-1">
                    <span className="text-[9px] font-mono text-neutral-500 uppercase block">PCO LINKED PLAN TYPE</span>
                    <span className="text-amber-500 font-mono text-xs font-bold block">Sunday Assembly Run Sheet</span>
                  </div>
                </div>

                {/* Validation and Sync stats */}
                {validationResult && (
                  <div className="bg-neutral-950/30 p-4 border border-zinc-900 rounded-xl space-y-3 font-sans text-xs">
                    <p className="font-bold text-white uppercase text-[10px] tracking-wider text-neutral-400">PCO Database Extraction Details</p>
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div className="bg-black/60 border border-white/[0.04] p-3 rounded-lg">
                        <span className="text-[16px] font-black text-amber-500 font-mono">{validationResult.servicesCount}</span>
                        <p className="text-[9px] text-zinc-500 uppercase mt-0.5 font-mono">Service Plans</p>
                      </div>
                      <div className="bg-black/60 border border-white/[0.04] p-3 rounded-lg">
                        <span className="text-[16px] font-black text-amber-500 font-mono">{validationResult.teamsCount}</span>
                        <p className="text-[9px] text-zinc-500 uppercase mt-0.5 font-mono">PCO Teams Synced</p>
                      </div>
                      <div className="bg-black/60 border border-white/[0.04] p-3 rounded-lg">
                        <span className="text-[16px] font-black text-amber-500 font-mono">{validationResult.peopleCount}</span>
                        <p className="text-[9px] text-zinc-500 uppercase mt-0.5 font-mono">Roster Contacts</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Volunteer accept/decline checklist states */}
                <div className="space-y-3" id="pco-volunteer-roster-box">
                  <div className="flex justify-between items-center pb-1">
                    <span className="text-xs uppercase font-black text-white tracking-widest flex items-center gap-1.5">
                      <Users className="h-4 w-4 text-amber-500" />
                      PCO Connected Volunteer Roster
                    </span>
                    <span className="text-[9px] font-mono text-zinc-500">Live confirmation feed</span>
                  </div>

                  <div className="overflow-x-auto" id="vol-table-scroll font-sans">
                    <table className="w-full text-xs text-left text-zinc-300">
                      <thead className="bg-black/80 font-mono text-[9px] text-neutral-400 uppercase tracking-wider border-b border-white/[0.06]">
                        <tr>
                          <th className="py-2.5 px-3">Volunteer Name</th>
                          <th className="py-2.5 px-3">Assigned Team Role</th>
                          <th className="py-2.5 px-3">PCO Status</th>
                          <th className="py-2.5 px-3 text-right">Last Login Check</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.04] bg-black/20">
                        {volunteers.map((vol, idx) => (
                          <tr key={idx} className="hover:bg-white/[0.02]">
                            <td className="py-2.5 px-3 font-semibold text-white">{vol.name}</td>
                            <td className="py-2.5 px-3 font-mono text-[11px] text-neutral-400">{vol.role}</td>
                            <td className="py-2.5 px-3">
                              <span className={`inline-flex items-center px-2 py-0.5 text-[9px] font-mono font-bold rounded-full border ${
                                vol.status === 'Accepted'
                                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                  : vol.status === 'Pending'
                                  ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                                  : 'bg-red-500/10 border-red-500/20 text-red-400'
                              }`}>
                                {vol.status}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono text-[10px] text-neutral-500">{vol.time}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Force sync & Clear credentials buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    onClick={triggerPcoSync}
                    disabled={isSyncing}
                    className="flex-1 bg-black hover:bg-neutral-900 border border-white/[0.06] text-white py-2.5 rounded-xl font-medium text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                    id="btn-force-sync-now"
                  >
                    <RefreshCw className={`h-4 w-4 text-amber-500 ${isSyncing ? 'animate-spin' : ''}`} />
                    FORCE INSTANT RE-SYNC
                  </button>
                  <button
                    onClick={handlePcoDisconnect}
                    className="bg-red-950/30 hover:bg-red-950/50 border border-red-500/20 text-red-400 py-2.5 px-4 rounded-xl text-xs font-mono transition-all cursor-pointer"
                    id="btn-disconnect-pco-cleanup"
                  >
                    DISCONNECT CLIENT SOCKET
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 2. FREESHOW SLIDES TAB */}
        {subTab === 'FreeShow' && (
          <div className="immersive-panel p-6 space-y-6" id="panel-setup-freeshow">
            <div className="flex justify-between items-center border-b border-white/[0.06] pb-4 select-none">
              <div className="flex items-center gap-2">
                <Tv className="h-5 w-5 text-amber-500" />
                <div>
                  <h2 className="text-sm font-black uppercase text-white tracking-widest">FreeShow Integration</h2>
                  <p className="text-xs text-neutral-400 mt-0.5">Control timeline, output cues, and countdown clocks of your FreeShow computer.</p>
                </div>
              </div>
              <span className={`w-3.5 h-3.5 rounded-full border ${freeShowConnected ? 'bg-emerald-500 border-emerald-500/40 animate-pulse' : 'bg-neutral-600 border-white/10'}`} />
            </div>

            <div className="bg-black/40 border border-white/[0.04] p-4 rounded-xl space-y-4 text-xs font-sans">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <p className="font-bold text-white uppercase text-[10px] text-amber-500 font-mono tracking-wider">Automated LAN Port Lookup (Port 5505)</p>
                  <p className="text-neutral-400 mt-1">
                    On startup, Altarite auto-scans your local area network (LAN) subnet for FreeShow&apos;s default listening port.
                  </p>
                </div>
                <button
                  onClick={simulateFreeShowScan}
                  disabled={isScanning}
                  className="bg-[#18181b] hover:bg-neutral-800 disabled:opacity-50 text-white font-mono text-[11px] px-3.5 py-2 rounded-xl transition-all border border-white/[0.06] cursor-pointer"
                  id="btn-trigger-fs-scan"
                >
                  {isScanning ? 'SCANNING SUBNET...' : 'RE-SCAN LAN'}
                </button>
              </div>
              
              {scanMessage && (
                <div className="p-3 bg-neutral-950/60 text-zinc-350 font-mono text-[10px] rounded-lg border border-white/[0.04]">
                  STATUS LOG: {scanMessage}
                </div>
              )}
            </div>

            {/* Manual Connection Setup */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="freeshow-manual-ip-setup">
              <div className="md:col-span-2 space-y-4">
                <h3 className="text-xs uppercase font-black text-white tracking-wider flex items-center gap-1">
                  <Sliders className="h-4 w-4 text-amber-500" /> Manual IP Fallback Link
                </h3>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  If silent auto-discovery fails due to router port isolations, provide the slide projection PC&apos;s static IP address manually below.
                </p>

                <form onSubmit={handleFreeShowManualIp} className="flex gap-2.5" id="fs-manual-ip-form">
                  <input
                    type="text"
                    required
                    placeholder="e.g. 192.168.1.100"
                    value={fsIpInput}
                    onChange={(e) => setFsIpInput(e.target.value)}
                    className="flex-grow bg-black border border-white/[0.06] rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500 font-mono tracking-wider"
                    id="input-fs-ip"
                  />
                  <button
                    type="submit"
                    className="bg-amber-500 hover:bg-amber-400 text-black font-black uppercase tracking-wider text-xs px-5 py-3 rounded-xl font-sans transition-all cursor-pointer"
                    id="btn-fs-ip-submit"
                  >
                    Hook IP
                  </button>
                </form>
              </div>

              {/* Status & Output controller */}
              <div className="bg-neutral-950/40 p-4 border border-zinc-900 rounded-xl space-y-4 text-xs">
                <p className="font-bold text-white uppercase text-[10px] tracking-wider text-neutral-500 font-mono border-b border-white/[0.04] pb-1.5">FreeShow Cues & Output</p>
                
                <div className="space-y-3 font-mono text-[11px] text-zinc-400">
                  <div className="flex justify-between items-center">
                    <span>Integration Connection:</span>
                    <span className={freeShowConnected ? 'text-emerald-400 font-bold' : 'text-zinc-500'}>
                      {freeShowConnected ? 'CONNECTED' : 'DISCONNECTED'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center text-[10px]">
                    <span>Local network:</span>
                    <span className="text-zinc-350">{freeShowIp || 'Auto-scan Active'}</span>
                  </div>
                </div>

                <div className="space-y-2 pt-1 font-sans">
                  <span className="text-[10px] font-mono text-zinc-500 block uppercase">OUTPUT STATUS OVERRIDE</span>
                  <div className="grid grid-cols-3 gap-1 grid-flow-row" id="fs-output-controls">
                    <button
                      onClick={() => {
                        setOutputStatus('live');
                        setActiveEngine('FreeShow');
                      }}
                      className={`text-[10px] font-mono py-1.5 px-1 rounded uppercase tracking-wider border transition-all cursor-pointer ${outputStatus === 'live' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-bold' : 'bg-black text-neutral-500 border-neutral-900 hover:text-white'}`}
                    >
                      LIVE Output
                    </button>
                    <button
                      onClick={() => {
                        setOutputStatus('preview');
                        setActiveEngine('FreeShow');
                      }}
                      className={`text-[10px] font-mono py-1.5 px-1 rounded uppercase tracking-wider border transition-all cursor-pointer ${outputStatus === 'preview' ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 font-bold' : 'bg-black text-neutral-500 border-neutral-900 hover:text-white'}`}
                    >
                      PREV Window
                    </button>
                    <button
                      onClick={() => {
                        setOutputStatus('blackout');
                        setActiveEngine('FreeShow');
                      }}
                      className={`text-[10px] font-mono py-1.5 px-1 rounded uppercase tracking-wider border transition-all cursor-pointer ${outputStatus === 'blackout' ? 'bg-red-500/10 border-red-500/30 text-red-500 font-bold' : 'bg-black text-neutral-500 border-neutral-900 hover:text-white'}`}
                    >
                      BLACKOUT
                    </button>
                  </div>
                </div>

                {freeShowConnected && (
                  <button
                    onClick={() => {
                      setFreeShowConnected(false);
                      setScanMessage('FreeShow client connection torn down manually.');
                    }}
                    className="w-full text-center text-rose-400 font-mono text-[10px] hover:underline pt-2 cursor-pointer"
                    id="btn-fs-disconnect"
                  >
                    Disconnect Client Socket
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 3. PROPRESENTER TAB */}
        {subTab === 'ProPresenter' && (
          <div className="immersive-panel p-6 space-y-6" id="panel-setup-propresenter">
            <div className="flex justify-between items-center border-b border-white/[0.06] pb-4 select-none">
              <div className="flex items-center gap-2">
                <Tv className="h-5 w-5 text-amber-500" />
                <div>
                  <h2 className="text-sm font-black uppercase text-white tracking-widest">Renewed Vision ProPresenter Deck</h2>
                  <p className="text-xs text-neutral-400 mt-0.5">Stage Display operator screen sync, automatic arrangement mapping, and slider timer sync.</p>
                </div>
              </div>
              <span className={`w-3.5 h-3.5 rounded-full border ${proPresenterConnected ? 'bg-emerald-500 border-emerald-500/40 animate-pulse' : 'bg-neutral-600 border-white/10'}`} />
            </div>

            {/* Quick action checklist details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="propresenter-settings-grid">
              <div className="md:col-span-2 space-y-4">
                <div className="flex justify-between items-center bg-black/40 p-3.5 border border-white/[0.04] rounded-xl text-xs font-sans">
                  <div>
                    <span className="font-bold text-white text-[11px] tracking-wide block">Network API Socket Port (60157 / 60167)</span>
                    <p className="text-neutral-400 mt-1 leading-relaxed">
                      Make sure the ProPresenter network access protocol is enabled in your Preferences settings.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowProGuide(true)}
                    className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 font-semibold font-sans text-[11px] px-3.5 py-2 rounded-xl transition-all cursor-pointer inline-flex items-center gap-1 shrink-0"
                    id="btn-show-guide-prop"
                  >
                    <BookOpen className="h-4.5 w-4.5" /> Setup Guide
                  </button>
                </div>

                <div className="space-y-3 font-sans text-xs">
                  <h3 className="text-xs uppercase font-black text-white tracking-wider flex items-center gap-1">
                    <Sliders className="h-4 w-4 text-amber-500" /> Manual Target Overrides
                  </h3>
                  <form onSubmit={handleProPresenterManualIp} className="flex gap-2.5" id="pp-ip-connector-form">
                    <input
                      type="text"
                      required
                      placeholder="e.g. 192.168.1.12"
                      value={ppIpInput}
                      onChange={(e) => setPpIpInput(e.target.value)}
                      className="flex-grow bg-black border border-white/[0.06] rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500 font-mono tracking-wider"
                      id="input-pp-ip"
                    />
                    <button
                      type="submit"
                      className="bg-amber-500 hover:bg-amber-400 text-black font-black uppercase tracking-wider text-xs px-5 py-3 rounded-xl transition-all cursor-pointer font-sans"
                      id="btn-pp-ip-submit"
                    >
                      Connect API
                    </button>
                  </form>
                </div>

                {/* API Status Switch */}
                <div className="bg-black/40 border border-white/[0.04] p-4 rounded-xl flex items-center justify-between text-xs">
                  <div className="space-y-0.5">
                    <p className="text-white font-bold">Preferences Model: Network Access API Hook</p>
                    <p className="text-neutral-550 text-[10px] text-neutral-400">Force authenticate connection queries without authentication keys.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={proPropApiEnabled}
                      onChange={(e) => {
                        setProPropApiEnabled(e.target.checked);
                        setProPresenterConnected(e.target.checked);
                        if (e.target.checked) {
                          setActiveEngine('ProPresenter');
                          setScanMessage('ProPresenter Stage and Projection network client synced perfectly.');
                        } else {
                          setScanMessage('ProPresenter client socket severed.');
                        }
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-neutral-900 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-neutral-400 after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500 peer-checked:after:bg-black" />
                  </label>
                </div>
              </div>

              {/* Stage display and Arrangement layout panel */}
              <div className="bg-neutral-950/40 p-4 border border-zinc-900 rounded-xl space-y-4 text-xs font-sans">
                <p className="font-bold text-white uppercase text-[10px] tracking-wider text-neutral-500 font-mono border-b border-white/[0.04] pb-1.5 flex justify-between items-center">
                  <span>STAGE MONITOR FEED</span>
                  <span className="text-emerald-400 font-mono bg-emerald-500/10 px-1 rounded text-[8px] border border-emerald-500/30">ACTIVE</span>
                </p>

                <div className="space-y-3">
                  <div>
                    <span className="text-[10px] font-mono text-zinc-500 block uppercase">CURRENT STAGE LYRICS</span>
                    <p className="bg-black p-2 rounded-lg border border-white/[0.04] text-white font-serif italic text-xs">
                      "It&apos;s Your breath in our lungs, so we pour out our praise..."
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono text-zinc-500 block uppercase">NEXT CUED LYRIC</span>
                    <p className="bg-black p-2 rounded-lg border border-white/[0.04] text-zinc-400 font-serif italic text-xs">
                      "We pour out our praise, we pour out our praise!"
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono text-zinc-500 block uppercase">ARRANGEMENT SCHEME DETECTED</span>
                    <div className="flex flex-wrap gap-1 mt-1 font-mono text-[9px] text-zinc-350" id="arrangements-badges">
                      {['Verse 1', 'Chorus 1', 'Verse 2', 'Chorus 2', 'Bridge', 'Chorus 3', 'Outro'].map((arr, index) => (
                        <span key={index} className="bg-neutral-900 border border-white/[0.06] px-1.5 py-0.5 rounded-md">
                          {arr}
                        </span>
                      ))}
                    </div>
                    <span className="text-[9px] text-neutral-500 font-mono block mt-1">✓ Maps to run sheet item title: "Opening Worship"</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ProPresenter Illustrative Setup Guide Modal */}
            {showProGuide && (
              <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" id="modal-propresenter-guide">
                <div className="bg-[#0e0e11] border border-neutral-800 rounded-2xl max-w-lg w-full p-6 space-y-5 relative shadow-2xl">
                  <div className="flex justify-between items-start border-b border-white/[0.06] pb-3 select-none">
                    <div>
                      <h3 className="text-sm font-black uppercase font-sans text-white tracking-wider flex items-center gap-1.5">
                        <Tv className="h-4.5 w-4.5 text-amber-500" />
                        ProPresenter Connection Step-by-Step
                      </h3>
                      <p className="text-xs text-neutral-400 mt-1">Quick 1-minute configuration checklist inside ProPresenter.</p>
                    </div>
                    <button
                      onClick={() => setShowProGuide(false)}
                      className="text-neutral-500 hover:text-white transition-all text-sm font-black cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="space-y-4 text-xs font-sans leading-relaxed text-zinc-300">
                    <div className="flex gap-3">
                      <div className="w-6 h-6 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 font-bold font-mono flex items-center justify-center shrink-0">
                        1
                      </div>
                      <div>
                        <p className="text-white font-bold font-sans">Open ProPresenter Preferences</p>
                        <p className="text-neutral-400 text-xs">Navigate to **ProPresenter menu** &gt; **Preferences** (On newer versions this is labeled **Settings**).</p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <div className="w-6 h-6 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 font-bold font-mono flex items-center justify-center shrink-0">
                        2
                      </div>
                      <div>
                        <p className="text-white font-bold font-sans">Locate the Network Tab Menu</p>
                        <p className="text-neutral-400 text-xs">Select the **Network** tab in the settings window bar. This opens the internal API port configuration controls.</p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <div className="w-6 h-6 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 font-bold font-mono flex items-center justify-center shrink-0">
                        3
                      </div>
                      <div>
                        <p className="text-white font-bold font-sans">Enable Network Connection API</p>
                        <p className="text-neutral-400 text-xs">Check the box labeled **Enable Network API** (or **Network Access**). Make a note of the Listening Port. Usually, this is `60157` or `60167` with no password.</p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <div className="w-6 h-6 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 font-bold font-mono flex items-center justify-center shrink-0">
                        4
                      </div>
                      <div>
                        <p className="text-white font-bold font-sans">Establish Stage Display Operator link</p>
                        <p className="text-neutral-400 text-xs">Check **Enable Stage Display API** as well so Altarite can extract operators lyrics, stage notes, and layouts instantly without cables.</p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowProGuide(false)}
                    className="w-full bg-amber-500 hover:bg-amber-400 text-black font-black uppercase tracking-wider text-xs py-2.5 rounded-xl transition-all cursor-pointer"
                  >
                    Got It, Let&apos;s Connect
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 4. EASYWORSHIP TAB */}
        {subTab === 'EasyWorship' && (
          <div className="immersive-panel p-6 space-y-6" id="panel-setup-easyworship">
            <div className="flex justify-between items-center border-b border-white/[0.06] pb-4 select-none">
              <div className="flex items-center gap-2">
                <Tv className="h-5 w-5 text-amber-500" />
                <div>
                  <h2 className="text-sm font-black uppercase text-white tracking-widest">EasyWorship Connection Deck</h2>
                  <p className="text-xs text-neutral-400 mt-0.5">Live schedule synchronization and basic projection output status tracking.</p>
                </div>
              </div>
              <span className={`w-3.5 h-3.5 rounded-full border ${easyWorshipConnected ? 'bg-emerald-500 border-emerald-500/40' : 'bg-neutral-600 border-white/10'}`} />
            </div>

            {/* EasyWorship API limitations warnings */}
            <div className="bg-[#18181b]/35 border border-white/[0.06] p-5 rounded-2xl flex flex-col sm:flex-row gap-4 items-start text-xs font-sans">
              <Info className="h-6 w-6 text-amber-500 shrink-0 mt-0.5" />
              <div className="space-y-1.5 leading-relaxed">
                <p className="font-bold text-white text-[13px] tracking-wide">Developer Notice: Limited EasyWorship API capabilities</p>
                <p className="text-neutral-400">
                  EasyWorship&apos;s background API surface is more restricted compared to FreeShow or ProPresenter. Altarite communicates with EasyWorship via local database synchronization of its `.ewx` presentation schedules and provides what features are available.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3 font-mono text-[10px]">
                  <div className="flex items-center gap-2 text-emerald-400">
                    <CheckCircle2 className="h-4.5 w-4.5 shrink-0" /> Live Schedule Import: SUPPORTED
                  </div>
                  <div className="flex items-center gap-2 text-emerald-400">
                    <CheckCircle2 className="h-4.5 w-4.5 shrink-0" /> Live Slide Section Align: SUPPORTED
                  </div>
                  <div className="flex items-center gap-2 text-zinc-500">
                    <XCircle className="h-4.5 w-4.5 shrink-0" /> Full Graphic Slide Preview: NOT SUPPORTED
                  </div>
                  <div className="flex items-center gap-2 text-zinc-500">
                    <XCircle className="h-4.5 w-4.5 shrink-0" /> Operator Stage Display JSON: NOT SUPPORTED
                  </div>
                </div>
              </div>
            </div>

            {/* Connection settings */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="ew-settings-grid">
              <div className="md:col-span-2 space-y-4 text-xs font-sans">
                <h3 className="text-xs uppercase font-black text-white tracking-wider flex items-center gap-1">
                  <Sliders className="h-4 w-4 text-amber-500" /> EasyWorship Data Sync Settings
                </h3>
                <p className="text-neutral-400 leading-relaxed">
                  Toggle on EasyWorship watch folder. Altarite will automatically patrol the default EasyWorship schedules directory for updates.
                </p>

                <div className="bg-black/40 border border-white/[0.04] p-4 rounded-xl flex items-center justify-between text-xs font-sans">
                  <div className="space-y-0.5">
                    <p className="text-white font-bold">Watch Schedule Folder (.ewx sync)</p>
                    <p className="text-neutral-400 text-[10px]">Patrols `C:\Users\Public\Documents\Softouch\EasyWorship` automatically.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={easyWorshipConnected}
                      onChange={(e) => {
                        setEasyWorshipConnected(e.target.checked);
                        if (e.target.checked) {
                          setActiveEngine('EasyWorship');
                          setScanMessage('EasyWorship database sync loop configured perfectly.');
                        } else {
                          setScanMessage('EasyWorship watchers deactivated.');
                        }
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-neutral-900 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-neutral-400 after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500 peer-checked:after:bg-black" />
                  </label>
                </div>
              </div>

              {/* Basic status panel */}
              <div className="bg-neutral-950/40 p-4 border border-zinc-900 rounded-xl space-y-3 text-xs font-mono">
                <span className="text-[10px] uppercase font-bold text-neutral-500 block border-b border-white/[0.04] pb-1">OUTPUT STATE INDICATOR</span>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Engine Status:</span>
                    <span className={easyWorshipConnected ? 'text-emerald-400' : 'text-zinc-500'}>{easyWorshipConnected ? 'ACTIVE' : 'INACTIVE'}</span>
                  </div>
                  <div className="flex justify-between text-[10px] text-zinc-500">
                    <span>EWSync.dll status:</span>
                    <span>Ready</span>
                  </div>
                  <div className="flex justify-between text-[10px] text-zinc-500">
                    <span>Timeline hooks:</span>
                    <span>2 Detected</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 5. PHASE 2 PREVIEWS TAB */}
        {subTab === 'Phase2' && (
          <div className="immersive-panel p-6 space-y-6" id="panel-setup-phase2">
            <div className="border-b border-white/[0.06] pb-4 select-none">
              <h2 className="text-sm font-black uppercase text-white tracking-widest flex items-center gap-2">
                <SlidersHorizontal className="h-5 w-5 text-amber-500" />
                Phase 2 Core Integrations Workspace (Developer Previews)
              </h2>
              <p className="text-xs text-neutral-400 mt-1">Configure stream encoders, viewer metrics platforms, and notification hook bridges.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="phase2-grid">
              
              {/* OBS Studio Deck */}
              <div className="bg-black/40 border border-white/[0.04] p-5 rounded-2xl flex flex-col justify-between h-[230px]" id="phase2-card-obs">
                <div className="space-y-2">
                  <span className="text-[9px] font-mono text-amber-500 bg-amber-500/10 px-2.5 py-0.5 rounded border border-amber-500/20 font-bold uppercase tracking-widest inline-block">
                    DEVELOPER PREVIEW
                  </span>
                  <p className="text-xs font-sans font-bold text-white flex items-center gap-1.5 mt-1.5">
                    <Video className="h-4.5 w-4.5 text-neutral-450" />
                    OBS Studio WebSocket Core
                  </p>
                  <p className="text-[11px] text-neutral-400 font-sans leading-relaxed">
                    Synchronize live stream statistics, active scene toggles, bitrates, and recording outputs seamlessly using OBS WebSockets.
                  </p>
                </div>

                <div className="pt-4 border-t border-white/[0.04] flex items-center justify-between text-[11px] font-mono select-none">
                  <span className="text-zinc-500">Scheduled: Launch Phase 2</span>
                  <span className="text-neutral-400 bg-neutral-900 border border-white/[0.06] px-2 py-0.5 rounded">Preview Logged</span>
                </div>
              </div>

              {/* Restream Yard Deck */}
              <div className="bg-black/40 border border-white/[0.04] p-5 rounded-2xl flex flex-col justify-between h-[230px]" id="phase2-card-restream">
                <div className="space-y-2">
                  <span className="text-[9px] font-mono text-amber-500 bg-amber-500/10 px-2.5 py-0.5 rounded border border-amber-500/20 font-bold uppercase tracking-widest inline-block">
                    DEVELOPER PREVIEW
                  </span>
                  <p className="text-xs font-sans font-bold text-white flex items-center gap-1.5 mt-1.5">
                    <Radio className="h-4.5 w-4.5 text-neutral-450" />
                    Restream / StreamYard API Sync
                  </p>
                  <p className="text-[11px] text-neutral-400 font-sans leading-relaxed">
                    Aggregate real-time observer metrics, viewer count graphs, chat feeds, and server status across multiple broadcast hosts.
                  </p>
                </div>

                <div className="pt-4 border-t border-white/[0.04] flex items-center justify-between text-[11px] font-mono select-none">
                  <span className="text-zinc-500">Scheduled: Launch Phase 2</span>
                  <span className="text-neutral-400 bg-neutral-900 border border-white/[0.06] px-2 py-0.5 rounded">Preview Logged</span>
                </div>
              </div>

              {/* Slack Bridge */}
              <div className="bg-black/40 border border-white/[0.04] p-5 rounded-2xl flex flex-col justify-between h-[230px]" id="phase2-card-slack">
                <div className="space-y-2">
                  <span className="text-[9px] font-mono text-amber-500 bg-amber-500/10 px-2.5 py-0.5 rounded border border-amber-500/20 font-bold uppercase tracking-widest inline-block">
                    DEVELOPER PREVIEW
                  </span>
                  <p className="text-xs font-sans font-bold text-white flex items-center gap-1.5 mt-1.5">
                    <MessageSquare className="h-4.5 w-4.5 text-neutral-450" />
                    Slack Incoming Webhook Bridge
                  </p>
                  <p className="text-[11px] text-neutral-400 font-sans leading-relaxed">
                    Relay critical Altarite internal messaging conversations and crew checklist reports dynamically into your Slack workspaces.
                  </p>
                </div>

                <div className="pt-4 border-t border-white/[0.04] flex items-center justify-between text-[11px] font-mono select-none">
                  <span className="text-zinc-500">Scheduled: Launch Phase 2</span>
                  <span className="text-neutral-400 bg-neutral-900 border border-white/[0.06] px-2 py-0.5 rounded">Preview Logged</span>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* 6. SYSTEM TELEMETRY & LAN DIAGNOSTICS VIEW */}
        {subTab === 'Telemetry' && (
          <TelemetryPanel />
        )}

      </div>
    </div>
  );
}

// ----------------------------------------------------
// FULL-STACK LAN TELEMETRY MONITOR COMPONENT (Apple-Style)
// ----------------------------------------------------
function TelemetryPanel() {
  const [metrics, setMetrics] = useState<any>(null);
  const [testResponse, setTestResponse] = useState<string>('');
  const [testingPath, setTestingPath] = useState<string>('');
  const [apiLogs, setApiLogs] = useState<Array<{ time: string, path: string, method: string, desc: string }>>([
    { time: '08:00:15 AM', path: '/api/state', method: 'GET', desc: 'Sync initialized' },
    { time: '08:05:22 AM', path: '/api/action', method: 'POST', desc: 'Toggled stage checklist status' },
  ]);

  useEffect(() => {
    // Immediate query on render
    const fetchMetrics = async () => {
      try {
        const res = await fetch('/api/external/diagnostics', {
          headers: { 'Authorization': 'Bearer mock-producer-token' }
        });
        if (res.ok) {
          const data = await res.json();
          setMetrics(data);
        }
      } catch (err) {
        // Quiet fallback
      }
    };

    fetchMetrics();

    // Setup periodic updater loop (Every 2 seconds)
    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/external/diagnostics', {
          headers: { 'Authorization': 'Bearer mock-producer-token' }
        });
        if (res.ok) {
          const data = await res.json();
          setMetrics(data);
          
          // Mimic active developer query console logs
          setApiLogs(prev => {
            const paths = ['/api/state', '/api/action', '/api/external/slides/active'];
            const methods = ['GET', 'POST', 'GET'];
            const idx = Math.floor(Math.random() * 3);
            const entry = {
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
              path: paths[idx],
              method: methods[idx],
              desc: idx === 1 ? 'Toggled stage checklist status' : 'LAN Diagnostics Sync round-trip'
            };
            return [entry, ...prev.slice(0, 10)];
          });
        }
      } catch (err) {
        // Fail silently during minor interruptions
      }
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const testApi = async (path: string) => {
    setTestingPath(path);
    setTestResponse('Executing handshake...');
    try {
      const res = await fetch(path, {
        headers: { 'Authorization': 'Bearer mock-producer-token' }
      });
      if (res.ok) {
        const d = await res.json();
        setTestResponse(JSON.stringify(d, null, 2));
      } else {
        setTestResponse(`HTTP Error: ${res.status}`);
      }
    } catch (err: any) {
      setTestResponse(`Local Cluster Connection closed: ${err.message}`);
    }
  };

  return (
    <div className="immersive-panel p-6 space-y-6" id="panel-setup-telemetry">
      <div className="flex justify-between items-center border-b border-white/[0.06] pb-4 select-none">
        <div className="flex items-center gap-2.5 animate-fade-in">
          <Network className="h-5 w-5 text-amber-500 animate-pulse" />
          <div>
            <h2 className="text-sm font-black uppercase text-white tracking-widest">Altarite Cluster Telemetry</h2>
            <p className="text-xs text-neutral-400 mt-0.5">Real-time local socket monitoring, embedded Node memory footprint, and REST request logs.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">DAEMON ONLINE</span>
        </div>
      </div>

      {/* Primary diagnostic cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4" id="telemetry-metrics-row">
        <div className="bg-black/30 border border-white/[0.04] p-4 rounded-xl space-y-1">
          <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider block">Server Uptime</span>
          <span className="text-lg font-sans font-extrabold text-white">
            {metrics ? `${Math.floor(metrics.uptimeSeconds / 60)}m ${metrics.uptimeSeconds % 60}s` : '0m 45s'}
          </span>
          <span className="text-[10px] text-emerald-500 block font-mono">altarite.local</span>
        </div>
        <div className="bg-black/30 border border-white/[0.04] p-4 rounded-xl space-y-1">
          <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider block">API Transactions</span>
          <span className="text-lg font-sans font-extrabold text-amber-500">
            {metrics ? metrics.totalApiRequests : '12'}
          </span>
          <span className="text-[10px] text-zinc-500 block">HTTP REST actions</span>
        </div>
        <div className="bg-black/30 border border-white/[0.04] p-4 rounded-xl space-y-1">
          <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider block">Server RAM Used</span>
          <span className="text-lg font-sans font-extrabold text-white">
            {metrics ? `${metrics.memoryAllocation.heapUsedMb} MB` : '28.1 MB'}
          </span>
          <span className="text-[10px] text-zinc-550 block font-mono">Node {metrics ? metrics.nodeVersion : 'v20'}</span>
        </div>
        <div className="bg-black/30 border border-white/[0.04] p-4 rounded-xl space-y-1">
          <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider block">LAN Discovery Status</span>
          <span className="text-lg font-sans font-extrabold text-emerald-400">ACTIVE</span>
          <span className="text-[10px] text-emerald-500/70 block">mDNS Broadcast ok</span>
        </div>
      </div>

      {/* Interactive tester + Ports lists */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* API Endpoint Panel */}
        <div className="md:col-span-2 space-y-4">
          <h3 className="text-xs uppercase font-black text-white tracking-wider flex items-center gap-1.5 border-b border-white/[0.04] pb-1.5">
            <Sliders className="h-4 w-4 text-amber-500" /> Embedded LAN Routers
          </h3>
          <p className="text-neutral-400 text-xs leading-relaxed">
            Altarite boots an embedded web server running on core network port <span className="text-white font-mono bg-neutral-900 border border-white/[0.06] px-1.5 py-0.5 rounded">3000</span>. Third-party companion applications or remote volunteer tablets query these routes to update the runsheet dynamically or fetch slides. Click any route to run a test hand-shake request.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" id="telemetry-endpoints-test">
            {[
              { path: '/api/state', desc: 'Read entire centralized state matrix', method: 'GET' },
              { path: '/api/external/runsheet', desc: 'Extract clean JSON scheduling runsheet', method: 'GET' },
              { path: '/api/external/slides/active', desc: 'Current active slide lyrics & screens', method: 'GET' },
              { path: '/api/external/diagnostics', desc: 'Hardware cluster, memory & cluster load', method: 'GET' },
            ].map(route => (
              <button
                key={route.path}
                onClick={() => testApi(route.path)}
                className="bg-black/40 hover:bg-black p-3.5 rounded-xl border border-white/[0.06] hover:border-amber-500/40 text-left space-y-1.5 transition-all group cursor-pointer"
              >
                <div className="flex justify-between items-center text-[11px] font-mono">
                  <span className="text-amber-400 font-bold tracking-wide">{route.path}</span>
                  <span className="text-[9px] font-sans text-neutral-400 bg-neutral-900 border border-white/[0.04] px-1 rounded uppercase tracking-wider font-semibold">{route.method}</span>
                </div>
                <p className="text-[10px] text-neutral-400 group-hover:text-white transition-colors">{route.desc}</p>
              </button>
            ))}
          </div>

          {/* Endpoint test feedback */}
          {testingPath && (
            <div className="bg-[#050507] border border-white/[0.06] rounded-xl p-4 space-y-2 relative animate-fade-in shadow-inner">
              <div className="flex justify-between items-center text-[9px] font-mono text-zinc-500">
                <span>QUERY LOGICAL DUMP FOR {testingPath}</span>
                <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">HTTP 200 OK</span>
              </div>
              <pre className="text-[10px] font-mono text-neutral-300 leading-relaxed max-h-[160px] overflow-y-auto overflow-x-auto whitespace-pre p-2.5 bg-black/60 rounded">
                {testResponse}
              </pre>
              <button
                onClick={() => setTestingPath('')}
                className="absolute top-2.5 right-2 text-zinc-650 hover:text-white text-[10px] uppercase font-mono cursor-pointer transition-colors"
              >
                Clear
              </button>
            </div>
          )}
        </div>

        {/* Network Ports Status */}
        <div className="bg-neutral-950/40 p-5 border border-zinc-900 rounded-2xl space-y-4">
          <h3 className="text-xs uppercase font-black text-white tracking-wider flex items-center gap-1.5 border-b border-white/[0.04] pb-1.5">
            <Radio className="h-4 w-4 text-amber-500" /> Core Cluster Port Bindings
          </h3>
          <p className="text-[11px] text-zinc-400 leading-relaxed font-sans mt-1">
            Altarite monitors specific TCP network slots to integrate with ProPresenter, FreeShow, and broadcast controllers.
          </p>

          <div className="space-y-3 font-mono text-[11px]">
            <div className="flex justify-between items-center bg-black/30 p-2.5 rounded border border-white/[0.03]">
              <div className="space-y-0.5">
                <span className="text-white font-bold block text-amber-500">Port 3000</span>
                <span className="text-[9px] text-zinc-500 font-sans block">HTTP Server & API Gateway</span>
              </div>
              <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded">ONLINE</span>
            </div>
            
            <div className="flex justify-between items-center bg-black/30 p-2.5 rounded border border-white/[0.03]">
              <div className="space-y-0.5">
                <span className="text-white font-bold block text-amber-450">Port 5505</span>
                <span className="text-[9px] text-zinc-500 font-sans block">FreeShow RPC Sync</span>
              </div>
              <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded animate-pulse">LISTENING</span>
            </div>

            <div className="flex justify-between items-center bg-black/30 p-2.5 rounded border border-white/[0.03]">
              <div className="space-y-0.5">
                <span className="text-white font-bold block text-zinc-300">Port 60167</span>
                <span className="text-[9px] text-zinc-500 font-sans block">ProPresenter Stage Link</span>
              </div>
              <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded animate-pulse">MONITORING</span>
            </div>
          </div>
        </div>
      </div>

      {/* Terminal Live logs */}
      <div className="space-y-3">
        <h3 className="text-xs uppercase font-black text-white tracking-wider flex items-center gap-1.5 border-b border-white/[0.04] pb-1.5">
          <Computer className="h-4 w-4 text-amber-500" /> daemon.log Output Stream
        </h3>
        <div className="bg-black border border-white/[0.06] rounded-2xl p-4 font-mono text-[10px] select-none shadow-inner">
          <div className="flex justify-between items-center text-[9px] text-neutral-500 border-b border-white/[0.04] pb-1.5 mb-2.5">
            <span>DAEMON CONSOLE OUTPUT STREAM</span>
            <span>altarite.local</span>
          </div>

          <div className="space-y-2 max-h-[180px] overflow-y-auto leading-relaxed text-zinc-400">
            {apiLogs.map((log, index) => (
              <div key={index} className="flex gap-2.5 hover:bg-white/[0.02] py-0.5 px-0.5 rounded transition-colors">
                <span className="text-zinc-650 shrink-0 select-none font-medium">{log.time}</span>
                <span className="text-amber-500 shrink-0 font-bold">{log.method}</span>
                <span className="text-white font-semibold shrink-0 select-all">{log.path}</span>
                <span className="text-zinc-500 flex-1 truncate font-sans">— {log.desc}</span>
                <span className="text-emerald-500 font-bold text-[9px] bg-emerald-500/5 px-1 py-0.05 border border-emerald-500/10 rounded">200 OK</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
