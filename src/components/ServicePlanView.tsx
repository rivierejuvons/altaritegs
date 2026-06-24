import React, { useState, useEffect } from 'react';
import { ServiceItem } from '../types';
import { Play, Pause, RotateCcw, AlertCircle, RefreshCw, Layers, Plus, Trash2, GripVertical, CheckCircle2 } from 'lucide-react';

interface ServicePlanViewProps {
  items: ServiceItem[];
  setItems: React.Dispatch<React.SetStateAction<ServiceItem[]>>;
  activeId: string | null;
  setActiveId: (id: string | null) => void;
  pcoConnected?: boolean;
  pcoLastSync?: string | null;
  pcoInternetStatus?: 'Online' | 'Offline';
}

export default function ServicePlanView({
  items,
  setItems,
  activeId,
  setActiveId,
  pcoConnected = false,
  pcoLastSync = null,
  pcoInternetStatus = 'Online'
}: ServicePlanViewProps) {
  const [tokenInput, setTokenInput] = useState('');
  const [localConnected, setLocalConnected] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [localLastSync, setLocalLastSync] = useState<string | null>(null);

  const isConnected = pcoConnected || localConnected;
  const lastSync = pcoLastSync || localLastSync;

  // Form states for new item
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDuration, setNewDuration] = useState('300');
  const [newOwner, setNewOwner] = useState('');
  const [newRole, setNewRole] = useState<'Audio' | 'Video' | 'Lighting' | 'Worship' | 'Producer'>('Producer');
  const [newNotes, setNewNotes] = useState('');

  // Active item running timer (seconds)
  const activeItem = items.find(i => i.id === activeId);
  const [elapsedActive, setElapsedActive] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);

  useEffect(() => {
    if (activeItem) {
      setElapsedActive(activeItem.elapsed);
      setTimerRunning(activeItem.status === 'active');
    } else {
      setTimerRunning(false);
    }
  }, [activeId]);

  // Live countdown/elapsed timer tick
  useEffect(() => {
    let interval: any = null;
    if (timerRunning && activeId) {
      interval = setInterval(() => {
        setElapsedActive(prev => prev + 1);
        setItems(current => 
          current.map(item => 
            item.id === activeId ? { ...item, elapsed: item.elapsed + 1 } : item
          )
        );
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timerRunning, activeId, setItems]);

  const handleToggleTimer = () => {
    if (!activeId) return;
    setTimerRunning(!timerRunning);
    setItems(current =>
      current.map(item =>
        item.id === activeId
          ? { ...item, status: timerRunning ? 'upcoming' : 'active' }
          : item
      )
    );
  };

  const handleResetTimer = () => {
    if (!activeId) return;
    setElapsedActive(0);
    setItems(current =>
      current.map(item =>
        item.id === activeId ? { ...item, elapsed: 0 } : item
      )
    );
  };

  const handleSetActive = (id: string) => {
    setItems(current =>
      current.map(item => {
        if (item.id === id) {
          return { ...item, status: 'active' };
        } else if (item.status === 'active') {
          return { ...item, status: 'complete' };
        }
        return item;
      })
    );
    setActiveId(id);
  };

  const handleCompleteItem = (id: string) => {
    setItems(current =>
      current.map(item =>
        item.id === id ? { ...item, status: 'complete' } : item
      )
    );
    if (activeId === id) {
      setTimerRunning(false);
      setActiveId(null);
    }
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const item: ServiceItem = {
      id: `item-${Date.now()}`,
      title: newTitle,
      duration: parseInt(newDuration) || 300,
      elapsed: 0,
      owner: newOwner || 'TBD',
      role: newRole,
      status: 'upcoming',
      notes: newNotes,
    };
    setItems(prev => [...prev, item]);
    setNewTitle('');
    setNewOwner('');
    setNewNotes('');
    setShowAddForm(false);
  };

  const handleDeleteItem = (id: string) => {
    if (activeId === id) {
      setActiveId(null);
      setTimerRunning(false);
    }
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;
    setItems(prev => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[targetIndex];
      copy[targetIndex] = temp;
      return copy;
    });
  };

  const formatTime = (secs: number) => {
    const min = Math.floor(secs / 60);
    const sec = secs % 60;
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  // PCO Connection Simulator
  const handlePcoConnect = () => {
    if (!tokenInput.trim()) return;
    setIsSyncing(true);
    setTimeout(() => {
      setLocalConnected(true);
      setIsSyncing(false);
      const now = new Date();
      setLocalLastSync(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 1500);
  };

  const handlePcoRefresh = () => {
    if (!isConnected) return;
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      const now = new Date();
      setLocalLastSync(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 1000);
  };

  // Math for Service Progress
  const totalPlannedDuration = items.reduce((acc, current) => acc + current.duration, 0);
  const totalElapsedDuration = items.reduce((acc, current) => {
    if (current.status === 'complete') return acc + current.elapsed;
    if (current.id === activeId) return acc + elapsedActive;
    return acc;
  }, 0);
  const totalDifference = totalElapsedDuration - items.filter(i => i.status === 'complete' || i.id === activeId).reduce((acc, curr) => acc + curr.duration, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="service-plan-parent">
      {/* Service Plan List Grid */}
      <div className="lg:col-span-2 space-y-4" id="service-plan-list-panel">
        <div className="immersive-panel p-6 shadow-2xl relative overflow-hidden" id="service-items-card">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h2 className="text-xs font-black uppercase font-sans tracking-widest text-white flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                Live Service Run Sheet
              </h2>
              <p className="text-xs text-neutral-400 font-mono mt-1">
                Collaborative roadmap timed to the second.
              </p>
            </div>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-amber-500 hover:bg-amber-400 text-black font-black uppercase tracking-wider text-xs px-4 py-2.5 rounded-xl font-sans transition-all flex items-center gap-1 cursor-pointer shadow-md shadow-amber-500/10"
              id="add-item-btn"
            >
              <Plus className="h-4 w-4" /> Add Segment
            </button>
          </div>

          {/* Add Item Form */}
          {showAddForm && (
            <form onSubmit={handleAddItem} className="bg-black/60 border border-white/[0.06] rounded-xl p-5 mb-6 space-y-4" id="add-item-form">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-neutral-400 mb-1">Segment Title</label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder='e.g. Closing Worship Song'
                    className="w-full bg-black border border-white/[0.06] rounded-lg p-2 text-sm text-white focus:outline-none focus:border-amber-500"
                    id="new-title-input"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-neutral-400 mb-1">Planned Duration (seconds)</label>
                  <input
                    type="number"
                    value={newDuration}
                    onChange={(e) => setNewDuration(e.target.value)}
                    className="w-full bg-black border border-white/[0.06] rounded-lg p-2 text-sm text-white focus:outline-none focus:border-amber-500"
                    id="new-duration-input"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-neutral-400 mb-1">Owner Name</label>
                  <input
                    type="text"
                    value={newOwner}
                    onChange={(e) => setNewOwner(e.target.value)}
                    placeholder='e.g. David (Worship Lead)'
                    className="w-full bg-black border border-white/[0.06] rounded-lg p-2 text-sm text-white focus:outline-none focus:border-amber-500"
                    id="new-owner-input"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-neutral-400 mb-1">Responsive Department</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as any)}
                    className="w-full bg-black border border-white/[0.06] rounded-lg p-2 text-sm text-white focus:outline-none focus:border-amber-500"
                    id="new-role-select"
                  >
                    <option value="Producer">Producer</option>
                    <option value="Worship">Worship</option>
                    <option value="Audio">Audio</option>
                    <option value="Video">Video</option>
                    <option value="Lighting">Lighting</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-mono text-neutral-400 mb-1">Segment Technical Notes</label>
                <textarea
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Notes for screen overlays, monitor mixes, spotting presets..."
                  className="w-full bg-black border border-white/[0.06] rounded-lg p-2 text-sm text-white h-20 focus:outline-none focus:border-amber-500"
                  id="new-notes-textarea"
                />
              </div>
              <div className="flex justify-end gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="bg-[#18181b] hover:bg-neutral-800 text-neutral-300 px-3.5 py-2 rounded-xl cursor-pointer border border-white/[0.06]"
                  id="cancel-add-btn"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-400 text-black font-semibold px-3.5 py-2 rounded-xl cursor-pointer"
                  id="submit-add-btn"
                >
                  Save Segment
                </button>
              </div>
            </form>
          )}

          {/* List items */}
          <div className="space-y-3" id="service-items-list">
            {items.map((item, idx) => {
              const timerDiff = item.elapsed - item.duration;
              const isItemActive = item.id === activeId;
              const isCompleted = item.status === 'complete';
              const roleColors: Record<string, string> = {
                Producer: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
                Worship: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
                Audio: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
                Video: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
                Lighting: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
              };

              return (
                <div
                  key={item.id}
                  className={`border rounded-xl transition-all p-4 relative ${
                    isItemActive
                      ? 'bg-amber-500/[0.04] border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.06)] ring-1 ring-amber-500/10'
                      : isCompleted
                      ? 'bg-black/35 border-neutral-900 opacity-60 hover:opacity-90'
                      : 'bg-[#121214]/65 border-white/[0.05] hover:border-white/[0.12]'
                  }`}
                  id={`item-row-${item.id}`}
                >
                  <div className="flex items-start md:items-center justify-between gap-4">
                    {/* Left details */}
                    <div className="flex items-start gap-3">
                      <div className="flex flex-col gap-1 items-center justify-center pt-1 md:pt-0" id={`reorder-${item.id}`}>
                        <button
                          disabled={idx === 0}
                          onClick={() => moveItem(idx, 'up')}
                          className="text-neutral-500 hover:text-neutral-300 disabled:opacity-20 cursor-pointer text-xs"
                        >
                          ▲
                        </button>
                        <button
                          disabled={idx === items.length - 1}
                          onClick={() => moveItem(idx, 'down')}
                          className="text-neutral-500 hover:text-neutral-300 disabled:opacity-20 cursor-pointer text-xs"
                        >
                          ▼
                        </button>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full border ${roleColors[item.role]}`}>
                            {item.role}
                          </span>
                          <h3 className={`font-sans font-semibold text-sm md:text-base ${isItemActive ? 'text-amber-500' : 'text-zinc-100'}`}>
                            {item.title}
                          </h3>
                        </div>
                        <p className="text-xs text-neutral-400 mt-1">
                          Owner: <span className="text-neutral-200 font-medium">{item.owner}</span>
                        </p>
                        {item.notes && (
                          <div className="text-xs text-neutral-500 mt-2 border-l-2 border-white/[0.08] pl-2 italic">
                            {item.notes}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right timing metrics and controls */}
                    <div className="flex flex-col items-end gap-2 text-right shrink-0" id={`metrics-${item.id}`}>
                      <div className="flex items-baseline gap-2">
                        <span className="text-xs font-mono text-neutral-500" title="Planned Duration">
                          P: {formatTime(item.duration)}
                        </span>
                        <span className={`text-sm md:text-base font-mono font-bold ${isItemActive ? 'text-amber-400 animate-pulse' : 'text-zinc-200'}`}>
                          E: {formatTime(isItemActive ? elapsedActive : item.elapsed)}
                        </span>
                      </div>

                      {/* Over/Under Diff indicator */}
                      {(isCompleted || isItemActive) && (
                        <div className="flex items-center gap-1">
                          <span className={`text-[11px] font-mono font-medium ${
                            timerDiff > 0 ? 'text-red-400' : 'text-amber-400'
                          }`}>
                            {timerDiff === 0 ? 'Even' : `${timerDiff > 0 ? '+' : ''}${formatTime(timerDiff)}`}
                          </span>
                          <span className="text-[9px] font-mono text-zinc-500">diff</span>
                        </div>
                      )}

                      {/* Timing Actions */}
                      <div className="flex items-center gap-2 mt-2">
                        {!isItemActive ? (
                          <button
                            onClick={() => handleSetActive(item.id)}
                            className="bg-black hover:bg-[#18181b] hover:text-amber-500 text-neutral-300 text-xs px-2.5 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1 border border-white/[0.06]"
                            title="Go Live with this active item"
                          >
                            <Play className="h-3 w-3" /> Go Live
                          </button>
                        ) : (
                          <button
                            onClick={() => handleCompleteItem(item.id)}
                            className="bg-amber-500 text-black text-xs font-bold px-3 py-1.5 rounded-xl transition-all hover:bg-amber-400 cursor-pointer flex items-center gap-1 shadow-md shadow-amber-500/10"
                          >
                            <CheckCircle2 className="h-3 w-3" /> Done
                          </button>
                        )}

                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="text-neutral-500 hover:text-red-400 p-1 rounded-md transition-all cursor-pointer"
                          title="Delete Segment"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Service Control Side Panel */}
      <div className="space-y-6" id="service-controls-sidebar">
        {/* Active Timer Box */}
        {activeId ? (
          <div className="immersive-panel p-6 text-center space-y-4 border border-amber-500/30" id="active-countdown-box">
            <span className="text-[9px] font-mono uppercase bg-amber-500/10 text-amber-500 border border-amber-500/20 px-3 py-1 rounded-full inline-block tracking-widest font-bold">
              LIVE BROADCAST SEGMENT
            </span>
            <h3 className="text-sm font-sans uppercase tracking-wider font-semibold text-white truncate max-w-full">
              {activeItem?.title}
            </h3>
            
            {/* Massive Display Clock */}
            <div className="font-mono text-5xl md:text-6xl text-white font-black tracking-widest my-2 select-all" id="massive-counter">
              {formatTime(elapsedActive)}
            </div>

            <p className="text-xs text-neutral-400 font-mono">
              Planned limit: <span className="text-white font-semibold">{formatTime(activeItem?.duration || 0)}</span>
            </p>

            {/* Micro Timer Actions */}
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={handleToggleTimer}
                className={`w-12 h-12 rounded-full flex items-center justify-center cursor-pointer transition-all shadow-lg ${
                  timerRunning ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/10' : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/10'
                }`}
                id="play-pause-timer-btn"
              >
                {timerRunning ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-0.5" />}
              </button>
              <button
                onClick={handleResetTimer}
                className="w-10 h-10 rounded-full bg-black hover:bg-neutral-800 text-white flex items-center justify-center cursor-pointer border border-white/[0.06]"
                title="Restart active item's elapsed timer"
                id="reset-timer-btn"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="immersive-panel p-6 text-center text-neutral-400 space-y-3" id="no-live-segment-box">
            <AlertCircle className="h-8 w-8 mx-auto text-neutral-600" />
            <h3 className="text-xs font-black uppercase text-neutral-300">No Active Live Segment</h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Select &quot;Go Live&quot; on any item in the left table list to begin broadcasting and run live countdown metrics.
            </p>
          </div>
        )}

        {/* Global timing overview widgets */}
        <div className="immersive-panel p-6 space-y-4 shadow-xl" id="plan-time-summary-widget">
          <h3 className="text-xs font-black uppercase text-neutral-450 tracking-widest font-mono">
            Service Pace Summary
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-black/50 p-3 rounded-xl border border-white/[0.04]">
              <span className="text-[9px] font-mono text-neutral-500 block">TOTAL SCHEDULE</span>
              <span className="text-sm font-mono font-black text-white block mt-0.5">
                {formatTime(totalPlannedDuration)}
              </span>
            </div>
            <div className="bg-black/50 p-3 rounded-xl border border-white/[0.04]">
              <span className="text-[9px] font-mono text-neutral-500 block">ELAPSED ACCUMULATED</span>
              <span className="text-sm font-mono font-black text-white block mt-0.5">
                {formatTime(totalElapsedDuration)}
              </span>
            </div>
          </div>

          <div className="bg-black/50 p-4 rounded-xl border border-white/[0.04] flex justify-between items-center">
            <div>
              <span className="text-xs font-mono text-neutral-400">Total Deviancy Shift</span>
              <p className="text-[10px] text-neutral-500 italic mt-0.5">Is service running late?</p>
            </div>
            <div className={`text-sm font-mono font-bold px-3 py-1.5 rounded-lg ${
              totalDifference > 10 ? 'text-red-400 bg-red-500/10' : totalDifference < -10 ? 'text-amber-400 bg-amber-500/10' : 'text-neutral-300 bg-neutral-800'
            }`}>
              {totalDifference === 0 ? 'ON TIME' : `${totalDifference > 0 ? '+' : ''}${formatTime(totalDifference)}`}
            </div>
          </div>
        </div>

        {/* Planning Center Online API integration panel */}
        <div className="immersive-panel p-6 space-y-5 shadow-xl" id="planning-center-auth-widget">
          <div>
            <h3 className="text-xs font-black uppercase text-white tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              Planning Center Sync Engine
            </h3>
            <p className="text-xs text-neutral-400 font-mono mt-1">
              Synchronize checklists and schedules seamlessly.
            </p>
          </div>

          {!isConnected ? (
            <div className="space-y-3" id="pco-setup-fields">
              <p className="text-xs text-neutral-500 leading-relaxed">
                To sync your plans, paste your PCO Personal Access Token below. This establishes a read connection.
              </p>
              <div>
                <input
                  type="password"
                  placeholder="Paste PCO Token (e.g. pat_xxxx...)"
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  className="w-full bg-black border border-white/[0.06] rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                  id="pco-pat-input"
                />
              </div>
              <button
                type="button"
                onClick={handlePcoConnect}
                disabled={isSyncing || !tokenInput}
                className="w-full bg-[#18181b] hover:bg-neutral-800 disabled:opacity-50 text-white font-sans font-medium text-xs py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 border border-white/[0.06]"
                id="connect-pco-btn"
              >
                {isSyncing ? (
                  <>
                    <RefreshCw className="h-3 w-3 animate-spin text-amber-500" /> Connection Authenticating...
                  </>
                ) : (
                  'Establish PCO Link'
                )}
              </button>
            </div>
          ) : (
            <div className="bg-black/60 p-4 border border-white/[0.04] rounded-xl space-y-3" id="pco-connected-view">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[9px] font-mono uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded px-2 py-0.5 rounded-full inline-block">
                    SYNCD ACTIVE
                  </span>
                  <p className="text-xs text-neutral-350 font-bold mt-1">Sync Channel: PCO-V8</p>
                </div>
                <button
                  onClick={handlePcoRefresh}
                  disabled={isSyncing}
                  className="text-neutral-400 hover:text-white p-1 rounded transition-all cursor-pointer"
                  title="Force Instant Re-Sync"
                  id="refresh-pco-btn"
                >
                  <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin text-amber-400' : ''}`} />
                </button>
              </div>

              <div className="text-xs text-neutral-400 space-y-1 block border-t border-white/[0.04] pt-2 font-mono">
                <div className="flex justify-between">
                  <span>Last Checked URL:</span>
                  <span className="text-zinc-200">api.planningcenter.com</span>
                </div>
                <div className="flex justify-between">
                  <span>Last Sync Update:</span>
                  <span className="text-zinc-200">{lastSync || '08:35 AM'}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  setLocalConnected(false);
                  setTokenInput('');
                }}
                className="w-full text-center text-[10px] text-red-400 hover:text-red-300 transition-all font-mono hover:underline cursor-pointer"
                id="disconnect-pco-btn"
              >
                Disconnect & Clear Token Credential
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
