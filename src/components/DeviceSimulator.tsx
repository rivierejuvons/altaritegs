import React, { useState, useEffect } from 'react';
import { ServiceItem, ChecklistItem } from '../types';
import { Smartphone, Tv, Monitor, QrCode, Wifi, Lock, UserCheck, ShieldAlert, CheckSquare, Square, Volume2 } from 'lucide-react';

interface DeviceSimulatorProps {
  items: ServiceItem[];
  setItems: React.Dispatch<React.SetStateAction<ServiceItem[]>>;
  checklists: ChecklistItem[];
  setChecklists: React.Dispatch<React.SetStateAction<ChecklistItem[]>>;
  activeId: string | null;
  children: React.ReactNode;
}

export default function DeviceSimulator({
  items,
  setItems,
  checklists,
  setChecklists,
  activeId,
  children
}: DeviceSimulatorProps) {
  const [deviceMode, setDeviceMode] = useState<'Producer' | 'Mobile' | 'LobbyTV'>('Producer');

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
        <div className="flex bg-black border border-white/[0.08] p-1 rounded-xl text-xs font-sans gap-1" id="device-selector-tabs">
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
      </div>
    </div>
  );
}

