import React, { useState, useEffect } from 'react';
import { ServiceItem, ChecklistItem, StageMic } from '../types';
import { SLIDE_PRESETS } from '../data/mockData';
import { Smartphone, Tv, Monitor, QrCode, Wifi, Lock, UserCheck, ShieldAlert, CheckSquare, Square, Volume2, Battery, Mic, VolumeX, Play, ArrowRight, Activity, Grid } from 'lucide-react';

interface DeviceSimulatorProps {
  items: ServiceItem[];
  setItems: React.Dispatch<React.SetStateAction<ServiceItem[]>>;
  checklists: ChecklistItem[];
  setChecklists: React.Dispatch<React.SetStateAction<ChecklistItem[]>>;
  activeId: string | null;
  stageMics: StageMic[];
  setStageMics: React.Dispatch<React.SetStateAction<StageMic[]>>;
  activeSlideIndex: number;
  setActiveSlideIndex: (val: any) => void;
  children: React.ReactNode;
}

export default function DeviceSimulator({
  items,
  setItems,
  checklists,
  setChecklists,
  activeId,
  stageMics,
  setStageMics,
  activeSlideIndex,
  setActiveSlideIndex,
  children
}: DeviceSimulatorProps) {
  const [deviceMode, setDeviceMode] = useState<'Producer' | 'Mobile' | 'LobbyTV' | 'StageMonitor' | 'GreenRoomHUD'>('Producer');

  // Mobile Auth credentials based on Section 5.1
  const [selectedCrew, setSelectedCrew] = useState('James (Audio)');
  const [pinInput, setPinInput] = useState('');
  const [isAuth, setIsAuth] = useState(false);
  const [pinError, setPinError] = useState<string | null>(null);

  // Active items and checklists references
  const activeItem = items.find(i => i.id === activeId) || items.find(i => i.status === 'active');
  const activeRole = selectedCrew.includes('Audio') ? 'Audio' : selectedCrew.includes('Video') ? 'Video' : selectedCrew.includes('Lighting') ? 'Lighting' : 'Worship';

  // Tick for TV simulated running clocks
  const [unfoldedSystemTime, setUnfoldedSystemTime] = useState(new Date());

  useEffect(() => {
    const clock = setInterval(() => setUnfoldedSystemTime(new Date()), 1000);
    return () => clearInterval(clock);
  }, []);

  // Filter relevant mobile checklist items for checked crew department
  const mobileCrewChecklists = checklists.filter(chk => chk.role === activeRole);

  const handleMobileLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Default mock PIN is "1234" as described in Section 5.1
    if (pinInput === '1234') {
      setIsAuth(true);
      setPinError(null);
    } else {
      setPinError('Incorrect 4-digit volunteer credential PIN. Use default "1234" to test this view.');
    }
  };

  const handleToggleChecklistInMobile = (id: string) => {
    setChecklists(prev =>
      prev.map(chk =>
        chk.id === id
          ? {
              ...chk,
              completed: !chk.completed,
              completedBy: !chk.completed ? selectedCrew : undefined,
              completedAt: !chk.completed ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined
            }
          : chk
      )
    );
  };

  const formatTime = (secs: number) => {
    const min = Math.floor(secs / 60);
    const sec = secs % 60;
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 flex flex-col relative overflow-hidden grid-overlay" id="simulator-parent">
      {/* Immersive background glowing radial center blur */}
      <div className="immersive-glow-bg opacity-70" />

      {/* Top Simulator Mode Selector bar */}
      <div className="bg-[#0c0c0c]/90 backdrop-blur-md border-b border-white/[0.06] p-4 flex flex-col sm:flex-row justify-between items-center gap-3 relative z-55 select-none shrink-0" id="simulation-header">
        <div className="flex items-center gap-2">
          <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 text-black font-black text-base uppercase tracking-tight shadow-md shadow-amber-500/20">
            A
          </span>
          <div>
            <h1 className="text-zinc-100 font-sans tracking-widest font-black text-xs uppercase text-amber-500">
              Altarite OS
            </h1>
            <p className="text-[10px] text-zinc-400 font-mono">
              STAGE CONTROL PANEL • PERSPECTIVE SELECTOR
            </p>
          </div>
        </div>

        {/* Device Modes Toggle Toggles with amber immersive theme */}
        <div className="flex flex-wrap bg-black border border-white/[0.08] p-1 rounded-xl text-xs font-sans gap-1" id="device-selector-tabs">
          <button
            onClick={() => setDeviceMode('Producer')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium cursor-pointer transition-all ${
              deviceMode === 'Producer' ? 'bg-[#18181b] text-amber-500 border border-white/[0.08] shadow-[0_0_15px_rgba(245,158,11,0.06)]' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Monitor className="h-4 w-4" /> Producer Studio
          </button>
          
          <button
            onClick={() => {
              setDeviceMode('Mobile');
              setIsAuth(false);
              setPinInput('');
            }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium cursor-pointer transition-all ${
              deviceMode === 'Mobile' ? 'bg-[#18181b] text-amber-500 border border-white/[0.08] shadow-[0_0_15px_rgba(245,158,11,0.06)]' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Smartphone className="h-4 w-4" /> Volunteer Phone View
          </button>

          <button
            onClick={() => setDeviceMode('LobbyTV')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium cursor-pointer transition-all ${
              deviceMode === 'LobbyTV' ? 'bg-[#18181b] text-amber-500 border border-white/[0.08] shadow-[0_0_15px_rgba(245,158,11,0.06)]' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Tv className="h-4 w-4" /> Lobby TV Mode
          </button>

          <button
            onClick={() => setDeviceMode('StageMonitor')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium cursor-pointer transition-all ${
              deviceMode === 'StageMonitor' ? 'bg-[#18181b] text-amber-500 border border-white/[0.08] shadow-[0_0_15px_rgba(245,158,11,0.06)]' : 'text-neutral-400 hover:text-white'
            }`}
            id="tab-btn-stage-monitor"
          >
            <Activity className="h-4 w-4 text-emerald-500" /> Stage Confidence Monitor
          </button>

          <button
            onClick={() => setDeviceMode('GreenRoomHUD')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium cursor-pointer transition-all ${
              deviceMode === 'GreenRoomHUD' ? 'bg-[#18181b] text-amber-500 border border-white/[0.08] shadow-[0_0_15px_rgba(245,158,11,0.06)] font-bold' : 'text-neutral-400 hover:text-white'
            }`}
            id="tab-btn-green-room-hud"
          >
            <Grid className="h-4 w-4 text-amber-500 animate-pulse" /> Green Room HUD & Mics
          </button>
        </div>
      </div>

      {/* Main body viewport */}
      <div className="flex-grow flex items-center justify-center p-2 sm:p-6 relative z-10" id="simulator-viewport-container">
        {deviceMode === 'Producer' && (
          <div className="w-full h-full max-w-7xl mx-auto" id="producer-viewport">
            {children}
          </div>
        )}

        {/* SIMULATED PHONE CHASSIS VIEW */}
        {deviceMode === 'Mobile' && (
          <div className="w-full max-w-[370px] bg-[#09090b] border-[8px] border-[#1d1d20] rounded-[3rem] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] h-[700px] overflow-hidden relative flex flex-col justify-between" id="simulated-iphone">
            {/* Phone speaker mesh notch */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-4.5 bg-neutral-900 rounded-b-xl z-55 flex items-center justify-center">
              <span className="w-10 h-0.5 bg-black rounded-full" />
            </div>

            {/* Simulated Phone Top Header */}
            <div className="bg-[#050505] px-6 pt-7 pb-2 border-b border-white/[0.03] flex justify-between items-center text-[10px] font-mono text-zinc-500 z-10 select-none">
              <span>{unfoldedSystemTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              <div className="flex items-center gap-1">
                <Wifi className="h-3 w-3 text-amber-500" />
                <span>LAN LINKED</span>
              </div>
            </div>

            {/* Phone Content Frame */}
            <div className="flex-grow p-4 overflow-y-auto bg-black font-sans" id="simulated-screen-content">
              {!isAuth ? (
                /* Volunteer Quick Access login form (Sec 5.1) */
                <div className="space-y-6 py-10" id="volunteer-pin-auth">
                  <div className="text-center space-y-2">
                    <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-center mx-auto text-amber-500">
                      <Lock className="h-5 w-5" />
                    </div>
                    <h3 className="text-sm font-black font-sans tracking-wide uppercase text-white">Volunteer Safe Signoff</h3>
                    <p className="text-[11px] text-zinc-500 max-w-[220px] mx-auto text-center leading-normal">
                      Select your roster name and enter your security PIN <span className="text-amber-500 font-mono">(1234)</span> to access checklists.
                    </p>
                  </div>

                  <form onSubmit={handleMobileLogin} className="space-y-4" id="sim-iphone-login-form">
                    <div>
                      <label className="block text-[9px] font-mono uppercase text-zinc-500 tracking-wider mb-1">Crew Profile Selection</label>
                      <select
                        value={selectedCrew}
                        onChange={(e) => setSelectedCrew(e.target.value)}
                        className="w-full bg-[#0a0a0c] border border-white/[0.06] rounded-xl p-3 text-xs text-zinc-200 focus:outline-none focus:border-amber-500/50"
                      >
                        <option value="James (Audio)">James (Audio Team)</option>
                        <option value="Maria (Video)">Maria (Video Team)</option>
                        <option value="Toni (Lighting)">Toni (Lighting Team)</option>
                        <option value="David (Worship Lead)">David (Worship Team)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[9px] font-mono uppercase text-zinc-500 tracking-wider mb-1">Enter 4-Digit authorization code</label>
                      <input
                        type="password"
                        placeholder="••••"
                        maxLength={4}
                        value={pinInput}
                        onChange={(e) => setPinInput(e.target.value)}
                        className="w-full text-center bg-[#0a0a0c] border border-white/[0.06] rounded-xl p-3 text-base tracking-widest text-white focus:outline-none focus:border-amber-500/50"
                        id="sim-iphone-pin-input"
                      />
                    </div>

                    {pinError && (
                      <div className="flex items-start gap-1.5 p-3 bg-red-950/20 border border-red-500/10 rounded-xl text-[10px] text-red-400 leading-normal" id="sim-iphone-auth-error">
                        <ShieldAlert className="h-3.5 w-3.5 shrink-0 mt-0.5 text-red-500" />
                        <span>{pinError}</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      className="w-full bg-amber-500 hover:bg-amber-400 text-black font-black uppercase tracking-wide text-[11px] py-3 rounded-xl cursor-pointer transition-all shadow-md shadow-amber-500/10 active:scale-[0.98]"
                      id="sim-iphone-auth-submit"
                    >
                      Authenticate Crew Profile
                    </button>
                  </form>
                </div>
              ) : (
                /* Authenticated Mobile Checklist & status box (Sec 5.2) */
                <div className="space-y-5 py-2" id="volunteer-active-dashboard">
                  {/* Status heading */}
                  <div className="bg-[#09090b] border border-white/[0.06] rounded-xl p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <UserCheck className="h-4 w-4 text-amber-500" />
                      <div>
                        <span className="text-[8px] font-mono text-zinc-500 uppercase block leading-none">LOGGED ROSTER:</span>
                        <span className="text-xs text-white font-semibold">{selectedCrew}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsAuth(false)}
                      className="text-[9px] font-mono text-red-400 hover:underline"
                    >
                      LOGOUT
                    </button>
                  </div>

                  {/* Service active status marquee */}
                  <div className="bg-amber-500/[0.02] border border-amber-500/10 p-4 rounded-xl space-y-2 text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-8 h-8 rounded-bl-full bg-amber-500/5" />
                    <span className="text-[8px] font-mono text-amber-500 uppercase bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                      LIVE ON STAGE
                    </span>
                    <h4 className="text-xs text-white font-bold leading-tight">{activeItem?.title}</h4>
                    <p className="text-[10px] text-zinc-400 font-mono">Running elapsed: <span className="text-amber-500 font-semibold">{formatTime(activeItem?.elapsed || 0)}</span></p>
                  </div>

                  {/* Big checklist Sign-off targets Section 5.2 */}
                  <div className="space-y-2.5">
                    <h3 className="text-[10px] font-mono uppercase tracking-wider text-amber-500/70 font-black">🎯 Your Assigned Checklist</h3>
                    {mobileCrewChecklists.length > 0 ? (
                      mobileCrewChecklists.map((chk) => (
                        <div
                          key={chk.id}
                          onClick={() => handleToggleChecklistInMobile(chk.id)}
                          className={`p-3.5 border rounded-xl flex items-center gap-3 cursor-pointer select-none transition-all active:scale-95 ${
                            chk.completed
                              ? 'bg-amber-500/[0.01] border-amber-500/10 text-zinc-500'
                              : 'bg-[#09090b] border-white/[0.06] text-white hover:border-white/[0.12] shadow-sm'
                          }`}
                          id={`mob-task-row-${chk.id}`}
                        >
                          <div className="shrink-0">
                            {chk.completed ? (
                              <CheckSquare className="h-5 w-5 text-amber-500" />
                            ) : (
                              <Square className="h-5 w-5 text-neutral-800" />
                            )}
                          </div>
                          <span className={`text-xs font-sans tracking-tight ${chk.completed ? 'line-through opacity-50' : 'text-zinc-200'}`}>
                            {chk.task}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-[11px] text-zinc-600 py-6 italic select-none">
                        No checks scheduled for your department profile today.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom physical home indicator line bar */}
            <div className="bg-[#050505] p-2 text-center select-none shrink-0 border-t border-white/[0.03]">
              <span className="w-24 h-1 bg-neutral-800 rounded-full inline-block" />
            </div>
          </div>
        )}

        {/* LOBBY DISPLAY TV BROADMIST FEED WITH LITERAL ALTAR-CORE DIAGRAMS */}
        {deviceMode === 'LobbyTV' && (
          <div className="w-full max-w-4xl bg-[#050505] border border-white/[0.08] rounded-2xl shadow-[0_30px_70px_rgba(0,0,0,0.9)] p-8 relative flex flex-col justify-between aspect-video overflow-hidden select-none" id="simulated-lobby-tv">
            {/* TV Ambient glow inside the screen */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[340px] bg-amber-500/[0.04] blur-[80px] rounded-full pointer-events-none" />

            {/* TV corner bracket frame lines */}
            <div className="absolute top-4 left-4 border-t border-l border-white/[0.12] w-6 h-6" />
            <div className="absolute top-4 right-4 border-t border-r border-white/[0.12] w-6 h-6" />
            <div className="absolute bottom-4 left-4 border-b border-l border-white/[0.12] w-6 h-6" />
            <div className="absolute bottom-4 right-4 border-b border-r border-white/[0.12] w-6 h-6" />

            {/* TV Header metadata display (Sec  5.3) */}
            <div className="flex justify-between items-center pb-4 border-b border-white/[0.06] relative z-10" id="tv-header">
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-1.5 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-500 font-sans font-black text-xs tracking-wider leading-none">
                  ALTARITE BROADCAST
                </span>
                <div>
                  <h3 className="text-xs text-white font-bold tracking-tight">Main Sanctuary Feed Monitor</h3>
                  <p className="text-[9px] text-zinc-500 font-mono uppercase mt-0.5">Altarite Community Broadcast Hub</p>
                </div>
              </div>

              <div className="text-right font-mono relative z-10">
                <span className="text-sm text-zinc-300 font-semibold">{unfoldedSystemTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                <p className="text-[9px] text-zinc-500">LIVE LOCAL LAN SYSTEM TIME</p>
              </div>
            </div>

            {/* CENTRAL SCHEMATIC CHASSIS MATCHING THE EXACT EMBEDDED CONCENTRIC ALTAR-CORE SPEC */}
            <div className="flex flex-col md:flex-row items-center justify-center gap-10 my-auto py-4 relative z-10" id="tv-showcase">
              
              {/* Compiling static visual container altar core */}
              <div className="altar-core flex-shrink-0 relative flex items-center justify-center" style={{ width: '220px', height: '220px', border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: '50%' }}>
                {/* Dashed outer-inner circle (absolute) */}
                <div className="absolute rounded-full pointer-events-none" style={{ width: '170px', height: '170px', border: '1px dashed rgba(255, 255, 255, 0.1)' }} />
                
                {/* Core inner golden halo */}
                <div className="core-inner altar-core-glow absolute rounded-full pointer-events-none" style={{ width: '100px', height: '100px', background: 'radial-gradient(circle, #f59e0b 0%, transparent 80%)', filter: 'blur(15px)', opacity: '0.6' }} />
                
                {/* Active tag metadata label */}
                <div className="absolute text-[8px] tracking-[0.4em] text-white/50 uppercase text-center mt-28 font-mono select-none">
                  ACTIVE ALTAR
                </div>

                {/* Simulated Core Status Dot */}
                <div className="absolute w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_10px_#f59e0b] animate-ping" />
              </div>

              {/* Text metadata telemetry aligned carefully */}
              <div className="text-left space-y-4 max-w-sm">
                <div className="inline-block px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 rounded text-[9px] font-mono text-amber-500 uppercase tracking-widest leading-none">
                  Lobby Monitor Status: SYSTEM NOMINAL
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-mono tracking-wider text-zinc-500 block uppercase">
                    CURRENT CONGREGATIONAL LIVE SEGMENT
                  </span>
                  <h2 className="text-2xl md:text-3xl font-sans tracking-tight text-white font-extrabold leading-tight">
                    {activeItem?.title || 'Pre-Service Countdown'}
                  </h2>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-white/[0.04] pt-3">
                  <div className="space-y-0.5">
                    <span className="text-[9px] font-mono text-zinc-500 block">ELAPSED CLOCK</span>
                    <span className="text-3xl font-mono font-black text-amber-500 tracking-wide">
                      {formatTime(activeItem?.elapsed || 0)}
                    </span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[9px] font-mono text-zinc-500 block">PLANNED TARGET</span>
                    <span className="text-xl font-mono font-bold text-zinc-400 block mt-1">
                      {formatTime(activeItem?.duration || 300)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* TV Footer announcement block */}
            <div className="border-t border-white/[0.04] pt-4 flex justify-between items-center text-[10px] font-mono text-zinc-600 relative z-10" id="tv-footer">
              <span>READ-ONLY LAND BROADCAST LAYOUT FEED</span>
              <span>ALTARITE LIVE OS v4.2.0-STABLE</span>
            </div>
          </div>
        )}

        {/* STAGE CONFIDENCE MONITOR MODE FOR STAGE DISPLAYS */}
        {deviceMode === 'StageMonitor' && (
          <div className="w-full max-w-5xl bg-[#030303] border-4 border-zinc-900 rounded-3xl shadow-[0_40px_90px_rgba(0,0,0,0.95)] p-8 relative flex flex-col justify-between aspect-video overflow-hidden text-white" id="simulated-stage-monitor">
            {/* Ambient backlight glow */}
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-emerald-500/[0.02] blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[450px] h-[450px] bg-amber-500/[0.01] blur-[120px] rounded-full pointer-events-none" />

            {/* Header: High contrast metadata & giant local clock */}
            <div className="flex justify-between items-center pb-5 border-b-2 border-zinc-900 relative z-10" id="stage-mon-header">
              <div className="flex items-center gap-3">
                <span className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <div>
                  <span className="text-[10px] font-mono tracking-widest text-emerald-400 font-bold uppercase block">ALTARITE STAGE CONNECT</span>
                  <h1 className="text-sm font-sans font-black tracking-tight uppercase text-zinc-100">CONFIDENCE STAGE MONITOR</h1>
                </div>
              </div>

              {/* Huge local clock for speakers to track overall time */}
              <div className="text-right flex items-center gap-4">
                <div className="bg-zinc-950 px-3 py-1.5 rounded-lg border border-zinc-900">
                  <span className="text-[9px] font-mono text-zinc-500 uppercase block leading-none mb-1">LOCAL TIME</span>
                  <span className="text-2xl font-mono font-black text-white tracking-wide">
                    {unfoldedSystemTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>
              </div>
            </div>

            {/* Main grid split: Left (Service status timers) & Right (Active Mic status indicators) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 my-auto relative z-10 items-stretch" id="stage-mon-body">
              
              {/* Left col: Big Clock Timers & Progression details */}
              <div className="lg:col-span-7 flex flex-col justify-between gap-6" id="stage-left-pnl">
                <div className="space-y-3">
                  <span className="inline-block px-2.5 py-0.5 bg-amber-500/10 border border-amber-500/20 rounded text-[9px] font-mono text-amber-500 uppercase tracking-widest leading-none font-bold">
                    ACTIVE RUNSHEET SEGMENT
                  </span>
                  
                  <h2 className="text-3xl md:text-4xl font-sans tracking-tight text-white font-black leading-tight">
                    {activeItem?.title || 'Pre-Service Countdown'}
                  </h2>

                  <p className="text-[11px] text-zinc-400 font-sans italic line-clamp-2 bg-zinc-950 p-3 rounded-xl border border-zinc-900/60">
                    &ldquo;{activeItem?.notes || 'No notes loaded'}&rdquo;
                  </p>
                </div>

                {/* GIGANTIC STAGE TIMERS WITH HIGH CONTRAST */}
                <div className="grid grid-cols-2 gap-4 bg-zinc-950/65 border border-zinc-900 rounded-2xl p-5" id="stage-timers-frame">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-zinc-500 block uppercase font-bold tracking-wider">ELAPSED TIME</span>
                    <span className="text-4xl md:text-5xl font-mono font-black text-emerald-400 tracking-wider">
                      {formatTime(activeItem?.elapsed || 0)}
                    </span>
                    <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden mt-1">
                      <div className="bg-emerald-500 h-full" style={{ width: `${Math.min(100, ((activeItem?.elapsed || 0) / (activeItem?.duration || 1)) * 100)}%` }} />
                    </div>
                  </div>

                  <div className="space-y-1 border-l border-zinc-900 pl-4">
                    <span className="text-[10px] font-mono text-zinc-500 block uppercase font-bold tracking-wider">PLANNED TARGET</span>
                    <span className="text-3xl md:text-4xl font-mono font-bold text-zinc-400 tracking-wider block pt-1">
                      {formatTime(activeItem?.duration || 300)}
                    </span>
                    <span className="text-[10px] font-mono text-zinc-500 block">
                      Owner: <span className="text-zinc-300">{activeItem?.owner || 'Producer'}</span>
                    </span>
                  </div>
                </div>

                {/* Next up item - so speaker always knows what is next! */}
                {items[items.findIndex(i => i.id === activeId) + 1] && (
                  <div className="bg-zinc-950/40 p-3.5 border border-zinc-900/50 rounded-xl flex items-center justify-between gap-4" id="stage-next-segment">
                    <div className="flex items-center gap-3 truncate">
                      <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center font-bold font-mono text-zinc-500 shrink-0 text-xs">
                        NEXT
                      </div>
                      <div className="truncate">
                        <span className="text-[9px] font-mono text-zinc-500 block uppercase">Cue Up Next Segment</span>
                        <span className="text-zinc-200 font-semibold text-xs truncate">
                          {items[items.findIndex(i => i.id === activeId) + 1].title}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-mono text-zinc-500 bg-zinc-950 px-2 py-0.5 rounded shrink-0">
                      {Math.floor(items[items.findIndex(i => i.id === activeId) + 1].duration / 60)}m
                    </span>
                  </div>
                )}
              </div>

              {/* Right col: Active Wireless Microphones Grid Assignments with photos! */}
              <div className="lg:col-span-5 bg-zinc-950/80 border border-zinc-900 rounded-2xl p-5 flex flex-col justify-between gap-4" id="stage-right-pnl">
                <div className="flex justify-between items-center border-b border-zinc-900 pb-2 mb-1 select-none">
                  <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <Mic className="h-3.5 w-3.5 text-emerald-400" /> STAGE WIRELESS CHANNELS
                  </span>
                  <span className="text-[8px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.2 rounded uppercase">
                    LAN LIVE
                  </span>
                </div>

                <div className="space-y-3.5 flex-grow overflow-y-auto pr-1" id="stage-mics-stack">
                  {stageMics.map((mic) => (
                    <div 
                      key={mic.id} 
                      className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                        mic.isMuted 
                          ? 'bg-zinc-900/30 border-zinc-900/60 opacity-55' 
                          : 'bg-black border-zinc-900 hover:border-zinc-800 shadow-md'
                      }`}
                      id={`stage-mic-row-${mic.id}`}
                    >
                      {/* Avatar Photo Frame with live glowing mute indicator */}
                      <div className="flex items-center gap-3 truncate">
                        <div className="relative shrink-0 select-none">
                          <img 
                            src={mic.avatarUrl} 
                            alt={mic.assignedTo} 
                            referrerPolicy="no-referrer"
                            className={`w-10 h-10 rounded-full object-cover border-2 ${
                              mic.isMuted ? 'border-zinc-700 gray-filter' : 'border-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]'
                            }`}
                          />
                          {mic.isMuted && (
                            <div className="absolute -bottom-1 -right-1 bg-red-500 text-white rounded-full p-0.5 border border-black shadow">
                              <VolumeX className="h-2.5 w-2.5" />
                            </div>
                          )}
                        </div>

                        <div className="truncate text-left leading-tight">
                          <span className="text-[8px] font-mono text-zinc-500 uppercase block tracking-wider font-bold">
                            {mic.name} &bull; {mic.frequency}
                          </span>
                          <span className="text-xs font-bold text-zinc-100 truncate block">
                            {mic.assignedTo}
                          </span>
                          <span className="text-[10px] text-zinc-400 truncate block">
                            {mic.role}
                          </span>
                        </div>
                      </div>

                      {/* Right column: Audio signal meters, wireless signal strength, battery level */}
                      <div className="flex flex-col items-end gap-1.5 shrink-0 select-none">
                        {/* Audio VU levels bar indicator */}
                        <div className="flex items-center gap-1">
                          <span className="text-[8px] font-mono text-zinc-500">VU</span>
                          <div className="w-16 h-2 bg-zinc-950 border border-zinc-900 rounded-sm overflow-hidden flex gap-0.5 p-0.5">
                            {!mic.isMuted ? (
                              <>
                                <div className="bg-emerald-500 h-full rounded-sm transition-all duration-300" style={{ width: `${Math.min(100, (mic.level / 60) * 100)}%` }} />
                                <div className="bg-amber-500 h-full rounded-sm transition-all duration-300" style={{ width: `${Math.max(0, ((mic.level - 60) / 30) * 100)}%` }} />
                                <div className="bg-red-500 h-full rounded-sm transition-all duration-300" style={{ width: `${Math.max(0, ((mic.level - 90) / 10) * 100)}%` }} />
                              </>
                            ) : (
                              <div className="bg-zinc-800 h-full w-full rounded-sm" />
                            )}
                          </div>
                        </div>

                        {/* Wireless RF battery & strength indicators */}
                        <div className="flex items-center gap-2 text-[9px] font-mono">
                          <span className={`flex items-center gap-0.5 ${mic.battery <= 20 ? 'text-rose-400 font-bold animate-pulse' : 'text-zinc-400'}`}>
                            <Battery className="h-3 w-3 inline" /> {mic.battery}%
                          </span>
                          <span className="text-zinc-500 border border-zinc-900 px-1 py-0.2 rounded bg-zinc-950 uppercase text-[8px]">
                            RF: {mic.signal}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Stage monitor footer warning metrics */}
            <div className="border-t-2 border-zinc-900 pt-4 flex justify-between items-center text-[10px] font-mono text-zinc-500 relative z-10" id="stage-mon-footer">
              <span>ALTA-STAGE SYSTEM OVER LAN INTERCONNECT</span>
              <span className="flex items-center gap-1 text-emerald-500">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping inline-block" /> 
                CONNECTED CLIENTS: STABLE 60fps
              </span>
            </div>
          </div>
        )}

        {/* GREEN ROOM WORSHIP HUD MODE (EXACTLY MATCHES APP STYLE) */}
        {deviceMode === 'GreenRoomHUD' && (
          <div className="w-full max-w-6xl immersive-panel border border-white/[0.06] rounded-3xl shadow-2xl p-6 relative flex flex-col justify-between text-white overflow-hidden font-sans select-none" id="simulated-greenroom-hud">
            {/* Real aesthetic background grid details */}
            <div className="absolute inset-0 grid-overlay pointer-events-none opacity-50" />
            <div className="immersive-glow-bg" />

            {/* Header: ProPresenter Relay Hub Title Bar */}
            <div className="flex justify-between items-center border-b border-white/[0.06] pb-4 relative z-10">
              <div className="flex items-center gap-2.5">
                <div className="h-2.5 w-2.5 rounded-full bg-amber-500 animate-ping" />
                <div>
                  <span className="text-[9px] font-mono tracking-widest text-amber-500 font-bold uppercase block">ALTARITE RELAY INTERCONNECT</span>
                  <h1 className="text-sm font-sans font-black tracking-wider uppercase text-slate-100 flex items-center gap-2">
                    GREEN ROOM DISPLAY <span className="text-[10px] font-mono text-zinc-400 bg-black border border-white/[0.06] px-2 py-0.5 rounded-full">ACTIVE NODE: RELAY 1</span>
                  </h1>
                </div>
              </div>

              {/* Status and Clock */}
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <span className="text-[8px] font-mono text-zinc-400 block uppercase">SYNC RATE</span>
                  <span className="text-xs font-mono font-bold text-amber-500">SUB-10ms LAN DELAY</span>
                </div>
                <div className="bg-black/40 px-3 py-1.5 rounded-lg border border-white/[0.06] text-right">
                  <span className="text-[8px] font-mono text-zinc-400 uppercase block leading-none mb-1">LOCAL CLOCK</span>
                  <span className="text-xl font-mono font-black text-white tracking-wide">
                    {unfoldedSystemTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>
              </div>
            </div>

            {/* Main Area divided into 3 rows: Slides, Timers, Mics */}
            <div className="space-y-6 my-4 relative z-10">
              
              {/* ROW 1: Side-by-Side Slide Preview Monitors */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="hud-slide-monitors">
                
                {/* Monitor A: Main Sanctuary Slide Output */}
                <div className="bg-black/60 border border-white/[0.06] rounded-xl overflow-hidden shadow-inner flex flex-col relative group">
                  <div className="bg-black/40 px-3 py-1.5 border-b border-white/[0.06] flex justify-between items-center text-[10px] font-mono text-zinc-400">
                    <span>LIVE SLIDE OUTPUT</span>
                    <span className="text-amber-500 uppercase text-[9px] font-bold">● ACTIVE</span>
                  </div>
                  {/* Checkerboard transparency preview window */}
                  <div className="aspect-[16/9] bg-[linear-gradient(45deg,#18181b_25%,transparent_25%),linear-gradient(-45deg,#18181b_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#18181b_75%),linear-gradient(-45deg,transparent_75%,#18181b_75%)] bg-[size:16px_16px] bg-[#09090b] flex items-center justify-center relative p-6">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    
                    {/* Mock slide content: Connected to activeSlideIndex */}
                    <div className="text-center space-y-2 relative z-10 transform scale-90 sm:scale-100 w-full px-4">
                      <p className="text-[10px] font-mono text-amber-500 uppercase tracking-widest leading-none">PRESENTATION ENGINE</p>
                      <h2 className="text-xl md:text-2xl font-sans font-black text-white uppercase tracking-tight drop-shadow-md py-2.5 px-4 bg-black/40 rounded-xl text-center break-words border border-white/[0.04]">
                        {SLIDE_PRESETS[activeSlideIndex]?.title || "BLACK OUT SCREEN"}
                      </h2>
                      <p className="text-[9px] font-mono text-zinc-400">Presentation &bull; Slide {activeSlideIndex + 1}</p>
                    </div>
                  </div>
                </div>

                {/* Monitor B: Secondary Lower-Third Monitor Output */}
                <div className="bg-black/60 border border-white/[0.06] rounded-xl overflow-hidden shadow-inner flex flex-col relative group">
                  <div className="bg-black/40 px-3 py-1.5 border-b border-white/[0.06] flex justify-between items-center text-[10px] font-mono text-zinc-400">
                    <span>OVERLAY MONITOR (LOWER-THIRD)</span>
                    <span className="text-amber-500 uppercase text-[9px]">● RENDERER</span>
                  </div>
                  {/* Checkerboard transparency preview window */}
                  <div className="aspect-[16/9] bg-[linear-gradient(45deg,#18181b_25%,transparent_25%),linear-gradient(-45deg,#18181b_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#18181b_75%),linear-gradient(-45deg,transparent_75%,#18181b_75%)] bg-[size:16px_16px] bg-[#09090b] flex flex-col justify-end p-4 relative">
                    <div className="absolute inset-0 bg-black/10 pointer-events-none" />
                    
                    {/* Lower third overlay mockup exact detail */}
                    <div className="bg-zinc-900 text-white border border-white/[0.1] px-4 py-2 rounded shadow-2xl flex items-center justify-between border-l-4 border-l-amber-500 relative z-10 w-full max-w-[95%] mx-auto">
                      <div className="min-w-0 flex-grow text-left">
                        <span className="text-[8px] font-black uppercase font-sans tracking-widest text-amber-500 block leading-none">PRESENTATION TITLE OVERLAY</span>
                        <h3 className="text-xs font-extrabold tracking-tight truncate">
                          {SLIDE_PRESETS[activeSlideIndex]?.title || "NO OVERLAY MEDIA"}
                        </h3>
                      </div>
                      <span className="text-[8px] font-mono bg-black text-amber-500 px-1.5 py-0.5 rounded border border-white/[0.06] font-bold shrink-0 ml-2">
                        STAGE CUE
                      </span>
                    </div>
                  </div>
                </div>

              </div>

              {/* ROW 2: Live Status Widgets / Relayed Timers */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="hud-status-widgets">
                
                {/* Widget A: Video Countdown - linked to active runsheet timer remaining */}
                <div className="bg-black/60 border border-white/[0.06] rounded-xl p-4 flex flex-col justify-between shadow-lg relative group">
                  <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider flex items-center justify-between select-none">
                    <span>ACTIVE ITEM TIME</span>
                    <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                  </div>
                  <div className="py-2 text-left">
                    <span className="text-3xl md:text-4xl font-mono font-black text-amber-500 tracking-wider">
                      {formatTime(Math.max(0, (activeItem?.duration || 300) - (activeItem?.elapsed || 0)))}
                    </span>
                  </div>
                  <div className="text-[9px] font-mono text-zinc-500 text-left">
                    RUNNING: {activeItem?.title || 'Pre-Service'}
                  </div>
                </div>

                {/* Widget B: Interactive Slides Remaining - linked to activeSlideIndex and slide navigation */}
                <div className="bg-black/60 border border-white/[0.06] rounded-xl p-4 flex flex-col justify-between shadow-lg relative group">
                  <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider flex items-center justify-between select-none">
                    <span>SLIDES REMAINING</span>
                    <div className="flex gap-1">
                      <button 
                        onClick={() => setActiveSlideIndex((prev: number) => Math.max(0, prev - 1))}
                        className="h-5 w-5 bg-neutral-800 hover:bg-neutral-700 text-white rounded flex items-center justify-center text-[11px] font-bold cursor-pointer transition-all active:scale-90 border border-white/[0.06]" 
                        title="Previous Slide"
                      >
                        -
                      </button>
                      <button 
                        onClick={() => setActiveSlideIndex((prev: number) => Math.min(SLIDE_PRESETS.length - 1, prev + 1))}
                        className="h-5 w-5 bg-neutral-800 hover:bg-neutral-700 text-white rounded flex items-center justify-center text-[11px] font-bold cursor-pointer transition-all active:scale-90 border border-white/[0.06]" 
                        title="Next Slide"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="py-2 text-left">
                    <span className="text-3xl md:text-4xl font-mono font-black text-slate-100 tracking-wider">
                      {Math.max(0, SLIDE_PRESETS.length - activeSlideIndex - 1)}
                    </span>
                  </div>
                  <div className="text-[9px] font-mono text-zinc-500 text-left">
                    SLIDE {activeSlideIndex + 1} OF {SLIDE_PRESETS.length} ACTIVE
                  </div>
                </div>

                {/* Widget C: Message End Countdown */}
                <div className="bg-black/60 border border-white/[0.06] rounded-xl p-4 flex flex-col justify-between shadow-lg relative group">
                  <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider flex items-center justify-between select-none">
                    <span>SERVICE REMAINING</span>
                    <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                  </div>
                  <div className="py-2 text-left">
                    <span className="text-3xl md:text-4xl font-mono font-black text-red-500 tracking-wider">
                      00:28:14
                    </span>
                  </div>
                  <div className="text-[9px] font-mono text-zinc-500 text-left">
                    NOMINAL SCHEDULE PROGRESSION
                  </div>
                </div>

              </div>

              {/* ROW 3: Tall Vertical Vocalists & Microphones Channel Strips Grid */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-[10px] font-mono text-zinc-400 tracking-widest uppercase font-bold flex items-center gap-1.5">
                    <Mic className="h-3.5 w-3.5 text-amber-500" /> STAGE MICROPHONES & IEM CHANNELS
                  </h3>
                  <span className="text-[8px] font-mono text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded uppercase font-bold">
                    SYSTEM: ONLINE
                  </span>
                </div>

                {/* Tall Vertical Strips - fully dynamic map */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4" id="hud-mic-channel-strips">
                  
                  {stageMics.map((mic, index) => (
                    <div key={mic.id} className="bg-black/60 border border-white/[0.06] rounded-2xl overflow-hidden flex flex-col justify-between relative group shadow-xl transition-all hover:border-white/[0.12]">
                      <div className="absolute top-2 left-2 z-10 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded border border-white/[0.06] text-[9px] font-mono text-zinc-300">
                        {mic.name}
                      </div>
                      
                      {/* Tall Image container with gradient overlay */}
                      <div className="h-44 relative bg-black">
                        <img 
                          src={mic.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'} 
                          alt={mic.assignedTo || "Unassigned Channel"} 
                          referrerPolicy="no-referrer"
                          className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${mic.isMuted ? 'opacity-40 grayscale' : ''}`}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                      </div>

                      {/* Vocalist Details */}
                      <div className="p-3 space-y-2 text-center">
                        <div className="truncate">
                          {mic.assignedTo ? (
                            <>
                              <h4 className="text-xs font-bold text-slate-100 truncate">{mic.assignedTo}</h4>
                              <span className="text-[9px] font-mono text-amber-500 uppercase tracking-widest block font-bold mt-0.5 truncate">{mic.role}</span>
                            </>
                          ) : (
                            <>
                              <h4 className="text-xs font-bold text-zinc-500 italic truncate">Unassigned Channel</h4>
                              <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest block font-bold mt-0.5">READY</span>
                            </>
                          )}
                        </div>

                        {/* RF battery indicator & telemetry details */}
                        <div className="bg-black/40 p-2 rounded-lg border border-white/[0.06] text-[9px] font-mono text-zinc-400 space-y-1.5 text-left">
                          <div className="flex justify-between">
                            <span>IEM PACK {index + 1}</span>
                            <span className={mic.isMuted ? 'text-red-400 font-bold' : 'text-amber-500 font-bold'}>
                              {mic.isMuted ? 'MUTED' : 'ONLINE'}
                            </span>
                          </div>
                          <div className="flex justify-between font-mono text-[8px] text-zinc-500">
                            <span>{mic.frequency}</span>
                            <span className="flex items-center gap-0.5 text-zinc-400">
                              <Battery className="h-3 w-3 inline" /> {mic.battery}%
                            </span>
                          </div>
                        </div>

                        {/* Live Fluctuating Level Meter */}
                        <div className="space-y-1">
                          <div className="flex justify-between items-center text-[8px] font-mono text-zinc-500">
                            <span>AUDIO VU</span>
                            <span className={mic.isMuted ? 'text-red-500' : 'text-amber-500 font-bold'}>
                              {mic.isMuted ? 'MUTE' : 'LIVE'}
                            </span>
                          </div>
                          <div className="h-2.5 bg-black border border-white/[0.06] rounded-sm overflow-hidden p-0.5 flex">
                            {!mic.isMuted ? (
                              <div className="bg-amber-500 h-full rounded-sm transition-all duration-300" style={{ width: `${mic.level}%` }} />
                            ) : (
                              <div className="bg-zinc-900 h-full w-full rounded-sm" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Smart Interactive Unassigned Mic connector option */}
                  <div className="bg-black/40 border border-dashed border-white/[0.12] hover:border-white/[0.2] rounded-2xl overflow-hidden flex flex-col justify-center items-center relative group p-5 text-center transition-all shadow-inner min-h-[300px]" id="hud-mic-strip-unassigned">
                    <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded border border-white/[0.06] text-[9px] font-mono text-zinc-500">
                      Smart Connect
                    </div>
                    
                    <div className="space-y-4">
                      <div className="mx-auto w-12 h-12 rounded-full bg-black border border-white/[0.06] flex items-center justify-center text-zinc-400 group-hover:text-amber-500 group-hover:border-amber-500/40 group-hover:bg-amber-500/5 transition-all">
                        <Activity className="h-5 w-5 animate-pulse" />
                      </div>
                      
                      <div>
                        <h4 className="text-xs font-bold text-zinc-300 group-hover:text-white transition-colors">Quick Assign Mic</h4>
                        <p className="text-[10px] text-zinc-500 mt-1 max-w-[120px] mx-auto">Quickly add a guest or speaker assignment directly from here.</p>
                      </div>

                      <div className="flex flex-col gap-1.5 w-full">
                        <input 
                          type="text" 
                          placeholder="Guest Name..." 
                          className="bg-black border border-white/[0.06] rounded px-2.5 py-1.5 text-zinc-200 text-[10px] font-sans w-full focus:outline-none focus:border-amber-500/30 text-center"
                          id="hud-quick-connect-name"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              const inputEl = e.currentTarget;
                              const val = inputEl.value.trim();
                              if (val) {
                                // Add/Assign to first unassigned mic or create a new mic
                                setStageMics((prev: StageMic[]) => {
                                  const unassignedIndex = prev.findIndex(m => !m.assignedTo);
                                  if (unassignedIndex !== -1) {
                                    return prev.map((m, idx) => idx === unassignedIndex ? { ...m, assignedTo: val, role: 'Guest Vocalist' } : m);
                                  } else {
                                    return [
                                      ...prev,
                                      {
                                        id: `mic-${Date.now()}`,
                                        name: `Wireless Mic ${prev.length + 1}`,
                                        assignedTo: val,
                                        role: 'Guest Vocalist',
                                        battery: 100,
                                        frequency: '531.4 MHz',
                                        signal: 'strong',
                                        isMuted: false,
                                        level: 50,
                                        avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'
                                      }
                                    ];
                                  }
                                });
                                inputEl.value = '';
                              }
                            }
                          }}
                        />
                        <span className="text-[8px] font-mono text-zinc-500">Press ENTER to assign</span>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

            </div>

            {/* Custom volunteer warning overlay: Simple and straightforward */}
            <div className="border-t border-white/[0.06] pt-4 flex flex-col sm:flex-row justify-between items-center text-[10px] font-mono text-zinc-500" id="greenroom-hud-footer">
              <span className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse shrink-0" />
                SYSTEM STATUS: ONLINE OVER LOCAL WIFI MESH
              </span>
              <span className="text-amber-500 font-bold bg-amber-500/10 px-2.5 py-1 rounded border border-amber-500/20 mt-2 sm:mt-0">
                💡 NO LOGINS OR PASSWORD NEEDED &bull; SIMPLY CONNECT & VIEW
              </span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

