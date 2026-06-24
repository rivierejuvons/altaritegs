import React, { useState } from 'react';
import { ChecklistItem } from '../types';
import { CheckSquare, Square, ClipboardCheck, History, Trash2, Plus, Users, Search, Play, Volume2 } from 'lucide-react';

interface ChecklistsViewProps {
  checklists: ChecklistItem[];
  setChecklists: React.Dispatch<React.SetStateAction<ChecklistItem[]>>;
}

export default function ChecklistsView({ checklists, setChecklists }: ChecklistsViewProps) {
  const [activeTab, setActiveTab] = useState<'Audio' | 'Video' | 'Lighting' | 'Worship'>('Audio');
  const [volunteerName, setVolunteerName] = useState('');
  const [selectedPersonnel, setSelectedPersonnel] = useState('James (Audio)');
  const [customTask, setCustomTask] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Archive history matching Section 4.2: "After the service, every checklist is archived with who completed what and when. Searchable history."
  const [archiveSearch, setArchiveSearch] = useState('');
  const [archiveLogs, setArchiveLogs] = useState<Array<{ id: string; role: string; task: string; completedBy: string; completedAt: string; timestamp: Date }>>([
    { id: 'h1', role: 'Audio', task: 'Cleared monitor mix stage feedback paths', completedBy: 'James (Audio)', completedAt: '08:02 AM', timestamp: new Date(Date.now() - 3600000) },
    { id: 'h2', role: 'Video', task: 'Verified livestream RTMP key input', completedBy: 'Maria (Video)', completedAt: '08:14 AM', timestamp: new Date(Date.now() - 3000000) },
    { id: 'h3', role: 'Lighting', task: 'Programmed opening walk-in ambient color preset', completedBy: 'Toni (Lighting)', completedAt: '08:18 AM', timestamp: new Date(Date.now() - 2500000) },
    { id: 'h4', role: 'Worship', task: 'Double check visual song order matching PCO', completedBy: 'David (Worship Lead)', completedAt: '08:28 AM', timestamp: new Date(Date.now() - 1200000) },
  ]);

  const departments: Array<'Audio' | 'Video' | 'Lighting' | 'Worship'> = ['Audio', 'Video', 'Lighting', 'Worship'];

  const personnelRoster = {
    Audio: ['James (Audio)', 'Peter (Volunteer FOH)', 'Lucas (Monitor Tech)'],
    Video: ['Maria (Video)', 'David (PTZ Operator)', 'Sarah (Livestream Comm)'],
    Lighting: ['Toni (Lighting)', 'Michael (Console Op)', 'Chloe (Stage Art)'],
    Worship: ['David (Worship Lead)', 'Julia (Keyboard/Synth)', 'Cody (Drums Tech)'],
  };

  // Adjust pre-selected volunteer based on active view tab
  React.useEffect(() => {
    setSelectedPersonnel(personnelRoster[activeTab][0]);
  }, [activeTab]);

  const handleToggleTask = (id: string) => {
    // Play subtle audio chirp if enabled
    if (soundEnabled) {
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(650, audioCtx.currentTime); // high note check pitch
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        gainNode.gain.setValueAtTime(0.02, audioCtx.currentTime);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.12);
      } catch (e) {
        // Audio API sandboxed or failed, fail silently
      }
    }

    let loggedTask: any = null;

    setChecklists(prev =>
      prev.map(item => {
        if (item.id === id) {
          const checkState = !item.completed;
          const completedBy = checkState ? (volunteerName.trim() || selectedPersonnel) : undefined;
          const completedAt = checkState ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined;

          // If marking complete, set up historical archive logging object outside main updater
          if (checkState && completedBy && completedAt) {
            loggedTask = {
              id: `hist-${Date.now()}`,
              role: item.role,
              task: item.task,
              completedBy,
              completedAt,
              timestamp: new Date()
            };
          }

          return { ...item, completed: checkState, completedBy, completedAt };
        }
        return item;
      })
    );

    if (loggedTask) {
      setArchiveLogs(hist => [loggedTask, ...hist]);
    }
  };

  const handleAddCustomTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTask.trim()) return;

    setChecklists(prev => [
      ...prev,
      {
        id: `custom-chk-${Date.now()}`,
        role: activeTab,
        task: customTask,
        completed: false
      }
    ]);
    setCustomTask('');
  };

  const handleRemoveTask = (id: string) => {
    setChecklists(prev => prev.filter(chk => chk.id !== id));
  };

  // Metrics for active tab
  const activeItems = checklists.filter(item => item.role === activeTab);
  const completedCount = activeItems.filter(item => item.completed).length;
  const totalCount = activeItems.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Global metric summary across all tabs
  const getDeptProgress = (dept: 'Audio' | 'Video' | 'Lighting' | 'Worship') => {
    const list = checklists.filter(i => i.role === dept);
    const complete = list.filter(i => i.completed).length;
    return { complete, total: list.length, percentage: list.length > 0 ? Math.round((complete / list.length) * 100) : 0 };
  };

  const filteredArchive = archiveLogs.filter(log =>
    log.task.toLowerCase().includes(archiveSearch.toLowerCase()) ||
    log.completedBy.toLowerCase().includes(archiveSearch.toLowerCase()) ||
    log.role.toLowerCase().includes(archiveSearch.toLowerCase())
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="checklists-container">
      {/* Interactive Checklists Section */}
      <div className="lg:col-span-2 space-y-4" id="main-checklists-card">
        <div className="immersive-panel p-6 shadow-2xl" id="checklist-card">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h2 className="text-xs font-black uppercase font-sans tracking-widest text-white flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                Crew Checklist Tracker
              </h2>
              <p className="text-xs text-neutral-400 font-mono mt-1">
                Assign and sign off technical checks and safety procedures.
              </p>
            </div>

            {/* Audio Feedback controller toggle */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono transition-all cursor-pointer ${
                soundEnabled
                  ? 'bg-amber-500/10 border-amber-500/40 text-amber-400'
                  : 'bg-black border-white/[0.06] text-neutral-500 hover:text-neutral-400'
              }`}
              title="Toggle checklist signoff sound effect"
            >
              <Volume2 className="h-3.5 w-3.5" />
              Chirp: {soundEnabled ? 'ON' : 'OFF'}
            </button>
          </div>

          {/* Department Selection Slider Tab Headers */}
          <div className="grid grid-cols-4 bg-black/60 border border-white/[0.06] p-1.5 rounded-xl mb-6 gap-1.5" id="dept-tabs">
            {departments.map(dept => {
              const info = getDeptProgress(dept);
              const isSelected = activeTab === dept;
              return (
                <button
                  key={dept}
                  onClick={() => setActiveTab(dept)}
                  className={`py-2 px-1 rounded-lg text-xs md:text-sm font-sans tracking-tight font-semibold transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                    isSelected
                      ? 'bg-amber-500/10 text-amber-400 shadow-sm border border-amber-500/30'
                      : 'text-neutral-400 hover:bg-neutral-900/40 hover:text-white'
                  }`}
                  id={`tab-dept-${dept}`}
                >
                  <span className="tracking-wide">{dept}</span>
                  <span className={`text-[9px] font-mono ${isSelected ? 'text-amber-550 font-bold' : 'text-neutral-500'}`}>
                    ({info.complete}/{info.total})
                  </span>
                </button>
              );
            })}
          </div>

          {/* Progress Bar with big text */}
          <div className="bg-black/30 border border-white/[0.04] rounded-xl p-4 mb-6" id="progress-indicator-block">
            <div className="flex justify-between items-center text-xs font-mono mb-2">
              <span className="text-neutral-400">Department checklist progress:</span>
              <span className="text-amber-400 font-bold">{progressPercent}% COMPLETED</span>
            </div>
            <div className="w-full bg-black h-2 rounded-full overflow-hidden border border-white/[0.06]">
              <div
                className="bg-amber-500 h-full transition-all duration-500 shadow-[0_0_12px_rgba(245,158,11,0.5)]"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Signoff details assignment input */}
          <div className="bg-black/35 border border-white/[0.04] p-4 rounded-xl mb-6 space-y-3" id="personnel-assignment-block">
            <h4 className="text-xs font-sans uppercase font-bold text-neutral-450 tracking-widest font-mono flex items-center gap-1">
              <Users className="h-3.5 w-3.5 text-neutral-500" />
              Sign-off Assignment Credentials
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[9px] font-mono text-neutral-500 uppercase mb-1">Select Active Crew member</label>
                <select
                  value={selectedPersonnel}
                  onChange={(e) => setSelectedPersonnel(e.target.value)}
                  className="w-full bg-black border border-white/[0.06] rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  id="selected-volunteer-select"
                >
                  {personnelRoster[activeTab].map(person => (
                    <option key={person} value={person}>{person}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[9px] font-mono text-neutral-500 uppercase mb-1">Or Type Guest Name</label>
                <input
                  type="text"
                  placeholder="e.g. Maria (Volunteer Video)"
                  value={volunteerName}
                  onChange={(e) => setVolunteerName(e.target.value)}
                  className="w-full bg-black border border-white/[0.06] rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  id="volunteer-name-input"
                />
              </div>
            </div>
          </div>

          {/* Interactive Checklist List Items */}
          <div className="space-y-3 mb-6" id="checklist-tasks-panel">
            {activeItems.length > 0 ? (
              activeItems.map((item) => (
                <div
                  key={item.id}
                  className={`border rounded-xl p-3 md:p-4 flex items-center justify-between gap-4 transition-all ${
                    item.completed
                      ? 'bg-amber-500/[0.03] border-amber-500/20 shadow-sm'
                      : 'bg-[#121214]/65 border-white/[0.05] hover:border-white/[0.1]'
                  }`}
                  id={`checklist-row-${item.id}`}
                >
                  <div
                    onClick={() => handleToggleTask(item.id)}
                    className="flex items-start gap-3 cursor-pointer select-none flex-grow"
                  >
                    <div className="mt-0.5 shrink-0" id="checkbox-trigger">
                      {item.completed ? (
                        <CheckSquare className="h-5 w-5 text-amber-500" />
                      ) : (
                        <Square className="h-5 w-5 text-neutral-600 hover:text-neutral-500" />
                      )}
                    </div>
                    <div>
                      <p className={`text-sm tracking-tight ${item.completed ? 'text-zinc-500 line-through font-normal' : 'text-zinc-100 font-medium'}`}>
                        {item.task}
                      </p>
                      {item.completed && item.completedBy && (
                        <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full inline-block mt-1">
                          Completed by: {item.completedBy} at {item.completedAt}
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleRemoveTask(item.id)}
                    className="text-neutral-600 hover:text-red-400 p-1.5 transition-all cursor-pointer shrink-0"
                    title="Delete custom task"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))
            ) : (
              <p className="text-center text-xs text-neutral-500 py-6 italic select-none">
                No items in this checklist. Create a custom task below.
              </p>
            )}
          </div>

          {/* Form to insert custom task */}
          <form onSubmit={handleAddCustomTask} className="flex gap-2" id="add-checklist-task-form">
            <input
              type="text"
              required
              value={customTask}
              onChange={(e) => setCustomTask(e.target.value)}
              placeholder="Add quick custom task to active department..."
              className="flex-grow bg-black border border-white/[0.06] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 font-sans"
              id="custom-task-input"
            />
            <button
              type="submit"
              className="bg-amber-500 hover:bg-amber-400 text-black font-extrabold uppercase tracking-wide text-xs px-4 py-2.5 rounded-xl cursor-pointer transition-all shrink-0 shadow-md shadow-amber-500/10"
              id="save-task-btn"
            >
              Add Check
            </button>
          </form>
        </div>
      </div>

      {/* Checklist Audit Logs & Historical Tracker Side panel */}
      <div className="space-y-6" id="checklist-logs-sidebar">
        <div className="immersive-panel p-6 shadow-2xl" id="historical-logs-widget">
          <div>
            <h2 className="text-xs font-black uppercase font-sans tracking-widest text-white flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              Completed History
            </h2>
            <p className="text-xs text-neutral-400 font-mono mt-1">
              Search historical audit trail for completed volunteer checklists.
            </p>
          </div>

          {/* Search audit box */}
          <div className="relative mt-4">
            <Search className="absolute left-3 top-3 h-3.5 w-3.5 text-neutral-500" />
            <input
              type="text"
              placeholder="Search checklist history..."
              value={archiveSearch}
              onChange={(e) => setArchiveSearch(e.target.value)}
              className="w-full bg-black border border-white/[0.06] rounded-xl py-2.5 pl-9 pr-4 text-xs text-white focus:outline-none focus:border-amber-500"
              id="audit-search-input"
            />
          </div>

          {/* Log events stack */}
          <div className="space-y-4 max-h-[460px] overflow-y-auto mt-4 pr-1 scrollbar-thin" id="audit-logs-list">
            {filteredArchive.length > 0 ? (
              filteredArchive.map((log) => (
                <div key={log.id} className="bg-black/40 border border-white/[0.04] p-3.5 rounded-xl text-xs space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-mono uppercase bg-neutral-800/80 text-neutral-350 px-2 py-0.5 rounded border border-neutral-700/60">
                      {log.role}
                    </span>
                    <span className="text-[10px] font-mono text-neutral-500">{log.completedAt}</span>
                  </div>
                  <p className="text-neutral-200 mt-1 font-sans font-medium leading-tight">
                    {log.task}
                  </p>
                  <p className="text-[10px] text-zinc-500 italic">
                    Signed by: <span className="text-zinc-400 font-medium">{log.completedBy}</span>
                  </p>
                </div>
              ))
            ) : (
              <p className="text-center text-[10px] text-neutral-500 italic py-4">
                No completion logs found matching search.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
