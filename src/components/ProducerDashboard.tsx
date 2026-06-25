import React, { useState, useEffect, useRef } from 'react';
import { ServiceItem, ChecklistItem, ChatMessage, SlidePreset, StageMic } from '../types';
import { Play, SkipForward, SkipBack, Edit3, Trash2, Send, MessageSquare, Volume2, Info, ChevronRight, Activity, Layers, Pin, Grid, AlertTriangle, AlertCircle, Wifi, WifiOff, Tv, CheckCircle2, XCircle, Battery, Mic, VolumeX } from 'lucide-react';

interface ProducerDashboardProps {
  items: ServiceItem[];
  setItems: React.Dispatch<React.SetStateAction<ServiceItem[]>>;
  checklists: ChecklistItem[];
  setChecklists: React.Dispatch<React.SetStateAction<ChecklistItem[]>>;
  chatMessages: ChatMessage[];
  setChatMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  slides: SlidePreset[];
  activeId: string | null;
  setActiveId: (id: string | null) => void;

  // New integration props
  activeEngine?: 'FreeShow' | 'ProPresenter' | 'EasyWorship' | 'None';
  setActiveEngine?: (val: 'FreeShow' | 'ProPresenter' | 'EasyWorship' | 'None') => void;
  
  freeShowConnected?: boolean;
  setFreeShowConnected?: (val: boolean) => void;
  freeShowIp?: string;
  setFreeShowIp?: (val: string) => void;
  
  proPresenterConnected?: boolean;
  setProPresenterConnected?: (val: boolean) => void;
  proPresenterIp?: string;
  setProPresenterIp?: (val: string) => void;
  proPropApiEnabled?: boolean;
  
  easyWorshipConnected?: boolean;
  
  outputStatus?: 'live' | 'preview' | 'blackout';
  setOutputStatus?: (val: 'live' | 'preview' | 'blackout') => void;

  stageMics: StageMic[];
  setStageMics: React.Dispatch<React.SetStateAction<StageMic[]>>;
  currentSlideIndex: number;
  setCurrentSlideIndex: (val: any) => void;
}

export default function ProducerDashboard({
  items,
  setItems,
  checklists,
  setChecklists,
  chatMessages,
  setChatMessages,
  slides,
  activeId,
  setActiveId,

  activeEngine = 'FreeShow',
  setActiveEngine,
  freeShowConnected = true,
  setFreeShowConnected,
  freeShowIp = '192.168.1.55',
  setFreeShowIp,
  proPresenterConnected = false,
  setProPresenterConnected,
  proPresenterIp = '192.168.1.12',
  setProPresenterIp,
  proPropApiEnabled = true,
  easyWorshipConnected = false,
  outputStatus = 'live',
  setOutputStatus,

  stageMics,
  setStageMics,
  currentSlideIndex,
  setCurrentSlideIndex
}: ProducerDashboardProps) {
  // Panel toggles for layout editing
  const [enabledPanels, setEnabledPanels] = useState<Record<string, boolean>>({
    slides: true,
    plan: true,
    checklists: true,
    chat: true,
    spl: true,
    notes: true,
    mics: true
  });

  const [activeLayoutPreset, setActiveLayoutPreset] = useState<'Standard' | 'Compact' | 'Special Event'>('Standard');

  // Slide state simulation (lifted to shared state)
  const [autoClearSlides, setAutoClearSlides] = useState(true);
  const [expandedMicId, setExpandedMicId] = useState<string | null>(null);
  const [showConnDetails, setShowConnDetails] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);

  // Drawing Canvas references
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [penColor, setPenColor] = useState('#ef4444'); // default red pen
  const [penWidth, setPenWidth] = useState(3);

  // Chat message input states
  const [activeChannel, setActiveChannel] = useState<'Audio' | 'Video' | 'Lighting' | 'Worship' | 'All-Team' | 'Announcements'>('All-Team');
  const [chatInput, setChatInput] = useState('');

  // SPL decibel state simulation
  const [splLevel, setSplLevel] = useState(82.4);
  const [splPeak, setSplPeak] = useState(89.1);

  // Synchronize Slide Index when active service item changes
  useEffect(() => {
    if (activeId) {
      const activeItem = items.find(item => item.id === activeId);
      if (activeItem && activeItem.slideId) {
        const index = slides.findIndex(s => s.id === activeItem.slideId);
        if (index !== -1) {
          setCurrentSlideIndex(index);
          // If enabled, clear drawing canvas on slide advance
          if (autoClearSlides) {
            clearDrawingCanvas();
          }
        }
      }
    }
  }, [activeId]);

  // Audio simulation: procedural wave for SPL meter
  useEffect(() => {
    const interval = setInterval(() => {
      // Generate realistic SPL readings fluctuating during sermon vs music
      let base = 82;
      if (activeId === 'item-2' || activeId === 'item-3' || activeId === 'item-6') {
        // Worship is louder
        base = 91;
      } else if (activeId === 'item-5') {
        // Sermon is quieter
        base = 79;
      }
      const delta = (Math.random() - 0.5) * 4;
      const next = Math.max(50, Math.min(105, parseFloat((base + delta).toFixed(1))));
      
      setSplLevel(next);
      setSplPeak(currentPeak => Math.max(currentPeak, next));
    }, 800);
    return () => clearInterval(interval);
  }, [activeId]);

  // Drawing canvas logic
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, [canvasRef.current]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Correct for mouse coordinates relative to canvas bounding box
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;

    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.strokeStyle = penColor;
    ctx.lineWidth = penWidth;
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;

    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearDrawingCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  // Slide navigation
  const prevSlide = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(prev => prev - 1);
      if (autoClearSlides) clearDrawingCanvas();
    }
  };

  const nextSlide = () => {
    if (currentSlideIndex < slides.length - 1) {
      setCurrentSlideIndex(prev => prev + 1);
      if (autoClearSlides) clearDrawingCanvas();
    }
  };

  // Chat actions
  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const newMessage: ChatMessage = {
      id: `m-${Date.now()}`,
      author: 'Sarah (Producer)',
      role: 'Producer',
      channel: activeChannel,
      text: chatInput,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, newMessage]);
    setChatInput('');
  };

  // Get active slide info
  const activeSlide = slides[currentSlideIndex] || slides[0];
  const nextSlideObj = slides[currentSlideIndex + 1];

  // Active item for notes
  const activeItem = items.find(item => item.id === activeId) || items.find(i => i.status === 'active') || items[0];

  // Checklists metrics summary
  const completedChecklistsCount = checklists.filter(c => c.completed).length;
  const totalChecklistsCount = checklists.length;

  return (
    <div className="space-y-6" id="dashboard-space">
      {/* Top action header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-neutral-900 border border-neutral-800 rounded-xl p-4 shadow-md" id="dashboard-control-bar">
        <div className="flex items-center gap-3">
          <Grid className="text-amber-500 h-5 w-5" />
          <div>
            <h2 className="text-zinc-100 font-sans tracking-tight font-black uppercase text-xs">Producer Layout Editor</h2>
            <p className="text-[10px] text-zinc-400 font-mono mt-0.5">Preset: <span className="text-amber-500 font-bold">{activeLayoutPreset} Layout</span></p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Preset buttons */}
          <div className="flex bg-neutral-950 p-1 rounded-lg border border-neutral-800 gap-1 text-[11px] font-sans">
            {['Standard', 'Compact', 'Special Event'].map(preset => (
              <button
                key={preset}
                onClick={() => {
                  setActiveLayoutPreset(preset as any);
                  if (preset === 'Compact') {
                    setEnabledPanels({ slides: true, plan: true, checklists: false, chat: true, spl: true, notes: false, mics: false });
                  } else {
                    setEnabledPanels({ slides: true, plan: true, checklists: true, chat: true, spl: true, notes: true, mics: true });
                  }
                }}
                className={`px-3 py-1 rounded-md cursor-pointer transition-all ${
                  activeLayoutPreset === preset ? 'bg-[#18181b] text-amber-500 font-bold border border-white/[0.06]' : 'text-neutral-400 hover:text-white'
                }`}
              >
                {preset}
              </button>
            ))}
          </div>

          {/* Toggle buttons for advanced workspace customizability */}
          <div className="flex items-center gap-1.5 border-l border-neutral-800 pl-3">
            {Object.keys(enabledPanels).map(panel => (
              <button
                key={panel}
                onClick={() => setEnabledPanels(prev => ({ ...prev, [panel]: !prev[panel] }))}
                className={`px-2.5 py-1 text-[10px] rounded border transition-all uppercase font-mono tracking-wider cursor-pointer ${
                  enabledPanels[panel]
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 font-semibold'
                    : 'bg-black border-white/[0.06] text-neutral-500 hover:text-neutral-400'
                }`}
              >
                {panel}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid Layout of panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" id="dashboard-grid">
        {/* Panel 1: Live Presentation Slide View with draw markups */}
        {enabledPanels.slides && (
          <div className="immersive-panel p-5 space-y-4 shadow-2xl relative" id="pnl-slide-preview">
            <div className="flex justify-between items-center bg-black/40 p-2.5 rounded-lg border border-white/[0.04]">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-ping shrink-0" />
                <span className="text-[10px] font-mono text-amber-500 font-bold uppercase select-none">
                  Projection Preview
                </span>
                <span className="text-[8px] font-mono text-zinc-400 bg-white/[0.04] border border-white/[0.06] px-1.5 py-0.2 rounded">
                  {activeEngine}
                </span>
              </div>
              
              {/* Clickable Connection Indicator Badges */}
              <button
                onClick={() => setShowConnDetails(!showConnDetails)}
                className="flex items-center gap-1 bg-black/60 px-2 py-0.5 border border-white/[0.06] rounded-full text-[9px] font-mono transition-all hover:bg-neutral-900 select-none cursor-pointer text-zinc-300"
                title="View socket connection details & Reconnect"
              >
                <span className={`w-1.5 h-1.5 rounded-full ${
                  activeEngine === 'FreeShow' && freeShowConnected
                    ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]'
                    : activeEngine === 'ProPresenter' && proPresenterConnected
                    ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]'
                    : activeEngine === 'EasyWorship' && easyWorshipConnected
                    ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]'
                    : 'bg-zinc-600'
                }`} />
                <span>{
                  activeEngine === 'FreeShow' && freeShowConnected
                    ? 'Live'
                    : activeEngine === 'ProPresenter' && proPresenterConnected
                    ? 'Live'
                    : activeEngine === 'EasyWorship' && easyWorshipConnected
                    ? 'Live'
                    : 'Offline'
                }</span>
              </button>
            </div>

            {/* Connection settings overlay drawer */}
            {showConnDetails && (
              <div className="bg-neutral-950 p-4 border border-zinc-900 rounded-xl space-y-3 font-mono text-[11px] text-zinc-350 select-none animate-fadeIn" id="slide-connection-details">
                <div className="flex justify-between items-center border-b border-white/[0.04] pb-1">
                  <span className="font-bold text-white uppercase text-[9px]">Connection Monitor</span>
                  <span className="text-[8px] bg-neutral-900 text-neutral-400 px-1.5 py-0.2 rounded font-mono">TCP SENSORS</span>
                </div>
                
                <div className="space-y-1 text-left">
                  <div className="flex justify-between">
                    <span>Active Engine:</span>
                    <span className="text-amber-500 font-bold">{activeEngine}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Server IP Host:</span>
                    <span className="text-neutral-300">{activeEngine === 'FreeShow' ? freeShowIp : activeEngine === 'ProPresenter' ? proPresenterIp : 'Local watcher'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Default Port:</span>
                    <span className="text-neutral-400">{activeEngine === 'FreeShow' ? '5505 (REST API)' : activeEngine === 'ProPresenter' ? '60167 (Network API)' : 'N/A (C:\Database)'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Heartbeat link:</span>
                    <span className="text-emerald-400">200 Connection Established</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setIsReconnecting(true);
                      setTimeout(() => {
                        setIsReconnecting(false);
                        if (activeEngine === 'FreeShow' && setFreeShowConnected) setFreeShowConnected(true);
                        if (activeEngine === 'ProPresenter' && setProPresenterConnected) setProPresenterConnected(true);
                      }, 1200);
                    }}
                    disabled={isReconnecting}
                    className="flex-1 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black py-1.5 rounded font-bold font-sans uppercase text-[10px] tracking-wider transition-all cursor-pointer text-center"
                  >
                    {isReconnecting ? 'SYNCING API SOCKET...' : 'RECONNECT'}
                  </button>
                  <button
                    onClick={() => setShowConnDetails(false)}
                    className="bg-neutral-900 hover:bg-neutral-800 border border-white/[0.06] text-white px-3 py-1.5 rounded text-[10px] cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}

            {/* EasyWorship limited API banner */}
            {activeEngine === 'EasyWorship' && (
              <div className="bg-[#18181b]/40 border border-white/[0.04] p-3 rounded-xl flex items-start gap-2.5 text-xs text-amber-300 font-sans" id="ew-api-disclaimer-banner">
                <AlertCircle className="h-5 w-5 shrink-0 text-amber-500 mt-0.5" />
                <div>
                  <p className="font-semibold">Slide Preview Unavailable on EasyWorship API</p>
                  <p className="text-neutral-400 text-[10px] mt-0.5 leading-tight">
                    EasyWorship does not allow remote video frame captures over local API ports. Service plan title alignment remains active.
                  </p>
                </div>
              </div>
            )}

            {/* Simulated projection frame with HTML5 overlay chalkboard */}
            <div className="relative bg-black rounded-lg aspect-video flex flex-col justify-between p-4 overflow-hidden border border-neutral-950 shadow-inner group" id="active-slide-frame">
              {/* Slate gradient background */}
              <div className="absolute inset-0 bg-gradient-to-tr from-neutral-950 via-zinc-900 to-neutral-900 opacity-95 pointer-events-none" />

              {/* Drawing Markup Canvas Overlay */}
              <canvas
                ref={canvasRef}
                height={180}
                width={320}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className="absolute inset-0 z-10 cursor-crosshair h-full w-full"
                id="slide-paint-canvas"
              />

              {/* Lyric Text Lines */}
              <div className="relative z-0 select-none text-center m-auto space-y-2 pointer-events-none" id="slide-lyric-lines">
                {activeSlide.lyricLines.map((line, idx) => (
                  <p key={idx} className="font-sans font-medium text-sm md:text-base text-zinc-100 tracking-tight leading-relaxed max-w-xs md:max-w-md mx-auto">
                    {line}
                  </p>
                ))}
              </div>

              {/* Slide metadata identifier tag */}
              <div className="relative z-0 flex justify-between items-center border-t border-white/5 pt-2 text-[9px] font-mono text-zinc-500 select-none pointer-events-none">
                <span>Preset: {activeSlide.title}</span>
                <span>Altarite Presentation Station</span>
              </div>
            </div>

            {/* ProPresenter Operator Stage monitor */}
            {activeEngine === 'ProPresenter' && proPresenterConnected && (
              <div className="bg-black/60 p-3 flex flex-col gap-1.5 border border-white/[0.04] rounded-xl text-xs font-sans text-neutral-300" id="pp-stage-widget">
                <span className="text-[9px] font-mono text-zinc-500 uppercase block border-b border-white/5 pb-1 flex justify-between">
                  <span>ProPresenter Stage Display Feed</span>
                  <span className="text-emerald-400 font-bold">MONITOR SYNCS ACTIVE</span>
                </span>
                <div>
                  <span className="text-[8px] font-mono text-neutral-500 block uppercase">Cued Operator Notes</span>
                  <p className="text-amber-500 font-medium text-[10px] italic">
                    &quot;Pastor Marcus is moving to center stage on this transition. Tighten focal spotlight beam center.&quot;
                  </p>
                </div>
              </div>
            )}

            {/* Drawing Markup Toolbar matched to Sec 4.7 */}
            <div className="bg-black/60 p-2.5 rounded-xl border border-white/[0.06] flex items-center justify-between flex-wrap gap-2 text-xs" id="drawing-toolbar">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono text-neutral-500 uppercase mr-1">Markup Pen:</span>
                <button
                  onClick={() => setPenColor('#ef4444')}
                  className={`w-5 h-5 rounded-full bg-red-400 border border-white/10 shadow-sm cursor-pointer ${penColor === '#ef4444' ? 'ring-2 ring-amber-500' : ''}`}
                  title="Red pen markup"
                />
                <button
                  onClick={() => setPenColor('#10b981')}
                  className={`w-5 h-5 rounded-full bg-emerald-400 border border-white/10 shadow-sm cursor-pointer ${penColor === '#10b981' ? 'ring-2 ring-amber-500' : ''}`}
                  title="Green pen markup"
                />
                <button
                  onClick={() => setPenColor('#3b82f6')}
                  className={`w-5 h-5 rounded-full bg-blue-450 border border-white/10 shadow-sm cursor-pointer ${penColor === '#3b82f6' ? 'ring-2 ring-amber-500' : ''}`}
                  title="Blue annotation"
                />
                <button
                  onClick={() => setPenColor('#f59e0b')}
                  className={`w-5 h-5 rounded-full bg-amber-400 border border-white/10 shadow-sm cursor-pointer ${penColor === '#f59e0b' ? 'ring-2 ring-amber-500' : ''}`}
                  title="Yellow highlight"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={clearDrawingCanvas}
                  className="bg-neutral-900 hover:bg-neutral-800 text-[10px] font-mono text-red-400 px-2.5 py-1 rounded-lg border border-white/[0.06] transition-all cursor-pointer"
                >
                  Clear Sketch
                </button>
                <label className="flex items-center gap-1.5 text-[10px] font-mono text-neutral-500 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={autoClearSlides}
                    onChange={(e) => setAutoClearSlides(e.target.checked)}
                    className="rounded text-amber-500 bg-black border-white/[0.06] focus:ring-0"
                  />
                  Auto-Clear
                </label>
              </div>
            </div>

            {/* Output status controls */}
            <div className="bg-black/40 border border-white/[0.04] p-2.5 rounded-xl space-y-2 text-xs font-sans">
              <div className="flex justify-between items-center select-none text-[10px] font-mono uppercase text-neutral-500">
                <span>Output status cue</span>
                <span className="text-amber-500 font-bold">{outputStatus}</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5 text-center">
                <button
                  onClick={() => setOutputStatus && setOutputStatus('live')}
                  className={`py-1.5 rounded font-mono text-[9px] uppercase border transition-all cursor-pointer ${outputStatus === 'live' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-bold' : 'bg-black text-neutral-500 border-neutral-900 hover:text-white'}`}
                >
                  Live
                </button>
                <button
                  onClick={() => setOutputStatus && setOutputStatus('preview')}
                  className={`py-1.5 rounded font-mono text-[9px] uppercase border transition-all cursor-pointer ${outputStatus === 'preview' ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 font-bold' : 'bg-black text-neutral-500 border-neutral-900 hover:text-white'}`}
                >
                  Preview
                </button>
                <button
                  onClick={() => setOutputStatus && setOutputStatus('blackout')}
                  className={`py-1.5 rounded font-mono text-[9px] uppercase border transition-all cursor-pointer ${outputStatus === 'blackout' ? 'bg-red-500/10 border-red-500/30 text-red-500 font-bold' : 'bg-black text-neutral-500 border-neutral-900 hover:text-white'}`}
                >
                  Blackout
                </button>
              </div>
            </div>

            {/* Slide Navigation Buttons */}
            <div className="grid grid-cols-2 gap-3" id="slide-navigation-buttons">
              <button
                onClick={prevSlide}
                disabled={currentSlideIndex === 0}
                className="bg-neutral-950 hover:bg-neutral-850 disabled:opacity-20 text-white p-2.5 rounded-lg border border-neutral-800 text-xs font-semibold tracking-tight transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <SkipBack className="h-4 w-4" /> Prev Slide
              </button>
              <button
                onClick={nextSlide}
                disabled={currentSlideIndex === slides.length - 1}
                className="bg-neutral-950 hover:bg-neutral-850 disabled:opacity-20 text-white p-2.5 rounded-lg border border-neutral-800 text-xs font-semibold tracking-tight transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                Next Slide <SkipForward className="h-4 w-4" />
              </button>
            </div>

            {/* Next Slide Preview Banner (Sec 3.2 "cue the team") */}
            {nextSlideObj && (
              <div className="bg-neutral-950/60 p-3 rounded-lg border border-neutral-850 flex items-center justify-between text-xs font-sans">
                <div className="truncate max-w-xs">
                  <span className="text-[10px] font-mono text-neutral-500 block uppercase">Cued Next Slide Preview</span>
                  <span className="text-zinc-300 font-semibold">{nextSlideObj.title}</span>
                  <p className="text-[10px] text-zinc-500 truncate mt-0.5">{nextSlideObj.lyricLines[0]}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-neutral-600 self-center shrink-0" />
              </div>
            )}
          </div>
        )}

        {/* Panel 2: Live Service Plan Quick Summary */}
        {enabledPanels.plan && (
          <div className="immersive-panel p-5 shadow-2xl flex flex-col justify-between gap-4" id="pnl-quick-service-plan">
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-white/[0.06] pb-3">
                <h3 className="text-xs font-black uppercase font-sans text-white tracking-wider flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-2 shrink-0 inline-block" />
                  Service Pacing Log
                </h3>
                <span className="text-[9px] font-mono text-zinc-400 bg-black px-2 py-0.5 rounded border border-white/[0.06]">
                  AUTO-CALCULATED
                </span>
              </div>

              {/* Loop segments */}
              <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1" id="quick-items-stack">
                {items.map((item) => {
                  const isActive = item.id === activeId;
                  const isDone = item.status === 'complete';
                  return (
                    <div
                      key={item.id}
                      onClick={() => setActiveId && setActiveId(item.id)}
                      className={`p-2.5 rounded-lg border flex items-center justify-between gap-3 text-xs cursor-pointer transition-all ${
                        isActive
                          ? 'bg-amber-500/10 border-amber-500/40 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.04)]'
                          : isDone
                          ? 'bg-black/30 border-white/[0.03] opacity-40 hover:opacity-75'
                          : 'bg-black/65 border-white/[0.05] hover:border-white/[0.12]'
                      }`}
                      id={`pnl-plan-row-${item.id}`}
                    >
                      <div className="truncate flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-amber-400 animate-ping' : isDone ? 'bg-zinc-500' : 'bg-neutral-700'}`} />
                        <span className="font-sans font-medium truncate">{item.title}</span>
                      </div>
                      <span className="font-mono text-[10px] text-zinc-500 shrink-0">
                        {Math.floor(item.duration / 60)}m
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Static layout statistics row */}
            <div className="bg-neutral-950 p-3 rounded-lg border border-neutral-850 flex items-center justify-between text-xs">
              <span className="text-zinc-500 font-mono text-[10px]">Active Track Time</span>
              <span className="text-white font-mono font-bold">11:35 AM Local</span>
            </div>
          </div>
        )}

        {/* Panel 3: Live Sound SPL Metre Widget (Section 4.3 Fills) */}
        {enabledPanels.spl && (
          <div className="immersive-panel p-5 shadow-2xl space-y-4" id="pnl-spl-meter">
            <div className="flex justify-between items-center pb-2 border-b border-white/[0.06]">
              <h3 className="text-xs font-black uppercase font-sans text-white tracking-wider flex items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-2 shrink-0 inline-block" />
                Live Acoustic SPL Meter
              </h3>
              <span className="text-[9px] font-mono text-zinc-500 uppercase bg-black px-2 py-0.5 rounded border border-white/[0.06]">
                A-Weighted Leq
              </span>
            </div>

            <div className="bg-black/40 border border-white/[0.05] rounded-xl p-5 text-center space-y-4" id="audio-levels-dashboard">
              <div>
                <span className="text-[44px] md:text-5xl font-mono font-black text-white tracking-widest">{splLevel}</span>
                <span className="text-xs font-mono text-neutral-400 block mt-1">DECIBELS dBA</span>
              </div>

              {/* Progress bar level meter visualIZER */}
              <div className="w-full bg-neutral-950 h-3 rounded-full overflow-hidden border border-white/[0.04] flex">
                <div className="bg-amber-500 h-full" style={{ width: `${Math.min(100, Math.max(0, (splLevel / 110) * 100))}%` }} />
                <div className="bg-orange-500 h-full" style={{ width: `${Math.max(0, Math.min(100, ((splLevel - 80) / 110) * 100))}%` }} />
                <div className="bg-red-500 h-full" style={{ width: `${Math.max(0, Math.min(100, ((splLevel - 90) / 110) * 100))}%` }} />
              </div>

              <div className="flex justify-between text-[11px] font-mono text-zinc-500">
                <span>40 dB quiet</span>
                <span>85 dB threshold</span>
                <span>110 dB high</span>
              </div>

              {/* Warnings and alerts based on Section 4.3 SPL */}
              <div className="grid grid-cols-2 gap-3" id="spl-metrics">
                <div className="bg-black/55 p-2.5 rounded-lg border border-white/[0.04] text-left">
                  <span className="text-[9px] font-mono text-zinc-500 block uppercase">RECORDED PEAK</span>
                  <span className="text-sm font-mono font-black text-rose-400">{splPeak} dBA</span>
                </div>
                <div className="bg-black/55 p-2.5 rounded-lg border border-white/[0.04] text-left">
                  <span className="text-[9px] font-mono text-zinc-500 block uppercase">SAFETY LIMIT</span>
                  <span className="text-sm font-mono font-black text-amber-500">88.0 dBA</span>
                </div>
              </div>

              {splLevel > 88.0 && (
                <div className="bg-amber-950/40 border border-amber-900/60 p-2.5 rounded-lg flex items-center gap-2 text-left justify-center text-amber-300 text-xs" id="level-warning-indicator">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>Warning: Stage volume exceeds safety mix target of 88dB!</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Panel 4: Team Chat Room (Section 4.5 real time communication) */}
        {enabledPanels.chat && (
          <div className="immersive-panel p-5 shadow-2xl flex flex-col h-[400px] justify-between relative overflow-hidden" id="pnl-team-chat">
            <div className="space-y-4 flex-grow overflow-hidden flex flex-col">
              <div className="flex justify-between items-center border-b border-white/[0.06] pb-3 shrink-0">
                <h3 className="text-xs font-black uppercase font-sans text-white tracking-wider flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-2 shrink-0 inline-block" />
                  Live Team Comms
                </h3>
                {/* Channel tabs selector for chat streams */}
                <select
                  value={activeChannel}
                  onChange={(e) => setActiveChannel(e.target.value as any)}
                  className="bg-black text-[10px] border border-white/[0.06] rounded px-2.5 py-1 text-zinc-350 font-mono outline-none focus:border-amber-500/50"
                  id="chat-channel-selector"
                >
                  <option value="All-Team">All-Team Feed</option>
                  <option value="Audio">Audio Comms</option>
                  <option value="Video">Video Comms</option>
                  <option value="Lighting">Lighting Comms</option>
                  <option value="Announcements">Broadcaster Announce</option>
                </select>
              </div>

              {/* Chat timeline feed */}
              <div className="space-y-3 overflow-y-auto flex-grow pr-1 scrollbar-thin py-2" id="chat-timeline">
                {chatMessages
                  .filter(m => activeChannel === 'All-Team' || m.channel === activeChannel)
                  .map((msg) => (
                    <div key={msg.id} className="text-xs space-y-1 block" id={`chat-line-${msg.id}`}>
                      <div className="flex justify-between items-center select-none">
                        <span className="font-sans font-bold text-zinc-100">{msg.author}</span>
                        <div className="flex items-center gap-1 text-[10px] font-mono text-zinc-500">
                          <span>{msg.timestamp}</span>
                          <span className="bg-neutral-950 px-1 py-0.2 rounded border border-neutral-850 uppercase text-[8px]">
                            {msg.channel}
                          </span>
                        </div>
                      </div>
                      <p className="text-zinc-300 leading-tight font-sans bg-neutral-950 p-2 rounded-lg border border-neutral-850">
                        {msg.text}
                      </p>
                    </div>
                  ))}
              </div>
            </div>

            {/* Chat message dispatch form */}
            <form onSubmit={handleSendChat} className="flex gap-2 border-t border-white/[0.06] pt-3 shrink-0" id="chat-send-form">
              <input
                type="text"
                required
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder={`Comms to #${activeChannel}...`}
                className="flex-grow bg-black border border-white/[0.06] rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500/50"
                id="chat-text-input"
              />
              <button
                type="submit"
                className="bg-amber-500 hover:bg-amber-400 text-black font-black rounded-lg p-2 flex items-center justify-center cursor-pointer transition-all shadow-md shadow-amber-500/10"
                id="send-chat-submit"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </form>
          </div>
        )}

        {/* Panel 5: Checklists Progress Summary */}
        {enabledPanels.checklists && (
          <div className="immersive-panel p-5 shadow-2xl flex flex-col justify-between" id="pnl-checklist-status">
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-white/[0.06] pb-3">
                <h3 className="text-xs font-black uppercase font-sans text-white tracking-wider flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-2 shrink-0 inline-block" />
                  Crew Checklist Tracker
                </h3>
                <span className="text-[9px] font-mono text-zinc-400 bg-black px-2 py-0.5 rounded border border-white/[0.06]">
                  LIVE METRICS
                </span>
              </div>

              {/* Progress summaries */}
              <div className="space-y-4" id="crew-progress-stack">
                {['Audio', 'Video', 'Lighting', 'Worship'].map(role => {
                  const roleTasks = checklists.filter(c => c.role === role);
                  const done = roleTasks.filter(c => c.completed).length;
                  const total = roleTasks.length;
                  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

                  return (
                    <div key={role} className="space-y-1.5" id={`summary-role-${role}`}>
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-zinc-350 font-bold">{role} Department Tasks</span>
                        <span className="text-zinc-500">
                          {done}/{total} done
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-neutral-950 border border-white/[0.04] rounded-full overflow-hidden">
                        <div
                           className="bg-amber-500 h-full transition-all duration-300"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-black/40 border border-white/[0.04] p-3 rounded-xl flex items-center justify-between text-xs font-mono mt-4">
              <span className="text-zinc-500">Total Complete checklists</span>
              <span className="text-amber-500 font-black">{completedChecklistsCount} / {totalChecklistsCount} checks</span>
            </div>
          </div>
        )}

        {/* Panel 6: Rich Technical Notes Box matching Sec 4.1 Notes */}
        {enabledPanels.notes && (
          <div className="immersive-panel p-5 shadow-2xl flex flex-col justify-between" id="pnl-item-cue-notes">
            <div className="space-y-3">
              <div className="flex justify-between items-center border-b border-white/[0.06] pb-2">
                <h3 className="text-xs font-black uppercase font-sans text-white tracking-wider flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-2 shrink-0 inline-block" />
                  Sermon & Technical Prompt Cue
                </h3>
                <span className="text-[9px] font-mono uppercase bg-black text-neutral-300 px-2 py-0.5 rounded border border-white/[0.06]">
                  SYNCHRONIZED NOTES
                </span>
              </div>

              {/* Dynamic instruction notes */}
              <div className="bg-black/40 p-4 rounded-xl border border-white/[0.04] text-xs text-zinc-300 space-y-2 font-sans overflow-y-auto max-h-[180px]">
                <p className="font-bold text-sm text-amber-400">{activeItem?.title}</p>
                <p className="leading-relaxed opacity-90 italic">
                  &quot;{activeItem?.notes || 'No custom cues declared for this live segment.'}&quot;
                </p>
              </div>
            </div>

            <div className="bg-black/50 border border-white/[0.04] p-3 rounded-xl flex items-start gap-2.5 text-xs text-neutral-400 mt-4">
              <Info className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
              <p className="font-sans leading-tight">
                Notes are bound to the currently running stage schedule item. Selecting active cells will prompt new scripts automatically.
              </p>
            </div>
          </div>
        )}

        {/* Panel 7: Wireless Stage Mics Manager */}
        {enabledPanels.mics && (
          <div className="immersive-panel p-5 shadow-2xl flex flex-col justify-between" id="pnl-stage-mics-manager">
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-white/[0.06] pb-3">
                <h3 className="text-xs font-black uppercase font-sans text-white tracking-wider flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-2 shrink-0 inline-block animate-pulse" />
                  Stage Microphone Console
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const newId = `mic-${Date.now()}`;
                      const frequencies = ['512.4 MHz', '516.2 MHz', '520.8 MHz', '524.1 MHz', '528.5 MHz', '532.9 MHz', '537.3 MHz'];
                      const currentCount = stageMics.length;
                      const freq = frequencies[currentCount % frequencies.length];
                      const newMic: StageMic = {
                        id: newId,
                        name: `Wireless Mic ${currentCount + 1}`,
                        assignedTo: '',
                        role: 'Vocalist/Speaker',
                        battery: 100,
                        frequency: freq,
                        signal: 'strong',
                        isMuted: false,
                        level: 40,
                        avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
                      };
                      setStageMics(prev => [...prev, newMic]);
                      setExpandedMicId(newId);
                    }}
                    className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-black font-extrabold font-sans text-[10px] uppercase rounded-lg flex items-center gap-1 cursor-pointer transition-all shrink-0"
                    id="btn-add-wireless-mic"
                  >
                    + Add Mic
                  </button>
                  <span className="text-[9px] font-mono text-zinc-400 bg-black px-2 py-0.5 rounded border border-white/[0.06]">
                    RF RECEIVER API
                  </span>
                </div>
              </div>

              <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1" id="mics-management-list">
                {stageMics.length === 0 ? (
                  <div className="text-center py-10 text-zinc-500 text-xs">
                    No microphones registered. Click "+ Add Mic" to configure your first channel.
                  </div>
                ) : (
                  stageMics.map(mic => (
                    <div key={mic.id} className="p-3 bg-black/60 rounded-xl border border-white/[0.04] flex flex-col gap-2.5 transition-all">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img 
                            src={mic.avatarUrl} 
                            alt={mic.name} 
                            referrerPolicy="no-referrer"
                            className={`w-8 h-8 rounded-full object-cover border transition-all ${mic.isMuted ? 'border-zinc-850 opacity-60' : 'border-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.25)]'}`}
                          />
                          <div className="text-left min-w-0 flex-grow">
                            <span className="text-[8px] font-mono text-zinc-500 uppercase block leading-none mb-0.5">
                              {mic.name} &bull; {mic.frequency} &bull; {mic.signal.toUpperCase()} RF
                            </span>
                            {/* Editable Assigned Speaker */}
                            <input 
                              type="text" 
                              value={mic.assignedTo}
                              onChange={(e) => {
                                const nextVal = e.target.value;
                                setStageMics(prev => prev.map(m => m.id === mic.id ? { ...m, assignedTo: nextVal } : m));
                              }}
                              className="bg-transparent border-none text-xs font-bold text-zinc-100 focus:outline-none focus:ring-0 hover:bg-white/[0.02] rounded px-1 -mx-1 py-0.5 w-full truncate cursor-text"
                              placeholder="Type to assign..."
                            />
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {/* Config Expansion trigger toggle button */}
                          <button
                            onClick={() => {
                              setExpandedMicId(prev => prev === mic.id ? null : mic.id);
                            }}
                            className={`p-1.5 rounded-lg border text-xs font-mono cursor-pointer transition-all ${
                              expandedMicId === mic.id 
                                ? 'bg-amber-500/20 border-amber-500/40 text-amber-400 font-bold' 
                                : 'bg-zinc-900 border-white/[0.04] text-zinc-400 hover:text-white'
                            }`}
                            title="Edit Microphone Parameters"
                          >
                            Edit
                          </button>

                          {/* Mute toggle button */}
                          <button
                            onClick={() => {
                              setStageMics(prev => prev.map(m => m.id === mic.id ? { ...m, isMuted: !m.isMuted } : m));
                            }}
                            className={`p-1.5 rounded-lg border text-[10px] font-mono uppercase tracking-wider cursor-pointer transition-all shrink-0 ${
                              mic.isMuted 
                                ? 'bg-rose-500/10 border-rose-500/30 text-rose-400 font-bold' 
                                : 'bg-zinc-900 border-white/[0.04] text-zinc-400 hover:text-white'
                            }`}
                            title={mic.isMuted ? "Unmute Mic" : "Mute Mic"}
                          >
                            {mic.isMuted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
                          </button>
                        </div>
                      </div>

                      {/* Expandable Configuration Details Section (Sec 3.0 & Custom Instructions) */}
                      {expandedMicId === mic.id && (
                        <div className="p-3 bg-zinc-950/80 border border-white/[0.03] rounded-lg space-y-3 text-left animate-in fade-in duration-200">
                          <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-zinc-400">
                            <div className="space-y-1">
                              <span>Mic ID/Label</span>
                              <input 
                                type="text"
                                value={mic.name}
                                onChange={(e) => setStageMics(prev => prev.map(m => m.id === mic.id ? { ...m, name: e.target.value } : m))}
                                className="bg-zinc-900/60 border border-white/[0.06] rounded px-2 py-1 text-zinc-100 text-[10px] w-full focus:outline-none focus:border-amber-500/30"
                              />
                            </div>
                            <div className="space-y-1">
                              <span>Vocal Role/Tag</span>
                              <input 
                                type="text"
                                value={mic.role}
                                onChange={(e) => setStageMics(prev => prev.map(m => m.id === mic.id ? { ...m, role: e.target.value } : m))}
                                className="bg-zinc-900/60 border border-white/[0.06] rounded px-2 py-1 text-zinc-100 text-[10px] w-full focus:outline-none focus:border-amber-500/30"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-zinc-400">
                            <div className="space-y-1">
                              <span>Frequency</span>
                              <input 
                                type="text"
                                value={mic.frequency}
                                onChange={(e) => setStageMics(prev => prev.map(m => m.id === mic.id ? { ...m, frequency: e.target.value } : m))}
                                className="bg-zinc-900/60 border border-white/[0.06] rounded px-2 py-1 text-zinc-100 text-[10px] w-full focus:outline-none focus:border-amber-500/30"
                              />
                            </div>
                            <div className="space-y-1">
                              <span>RF Signal Status</span>
                              <select 
                                value={mic.signal}
                                onChange={(e) => setStageMics(prev => prev.map(m => m.id === mic.id ? { ...m, signal: e.target.value as any } : m))}
                                className="bg-zinc-900/60 border border-white/[0.06] rounded px-2 py-1 text-zinc-100 text-[10px] w-full focus:outline-none focus:border-amber-500/30"
                              >
                                <option value="strong">Strong RF</option>
                                <option value="good">Good RF</option>
                                <option value="weak">Weak RF</option>
                              </select>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-zinc-400">
                            <div className="space-y-1">
                              <span>Battery: {mic.battery}%</span>
                              <input 
                                type="range"
                                min="0"
                                max="100"
                                value={mic.battery}
                                onChange={(e) => setStageMics(prev => prev.map(m => m.id === mic.id ? { ...m, battery: parseInt(e.target.value) } : m))}
                                className="w-full accent-amber-500 h-1 bg-zinc-800 rounded-lg cursor-pointer"
                              />
                            </div>
                            <div className="space-y-1">
                              <span>VU volume base: {mic.level}%</span>
                              <input 
                                type="range"
                                min="0"
                                max="100"
                                value={mic.level}
                                onChange={(e) => setStageMics(prev => prev.map(m => m.id === mic.id ? { ...m, level: parseInt(e.target.value) } : m))}
                                className="w-full accent-amber-500 h-1 bg-zinc-800 rounded-lg cursor-pointer"
                              />
                            </div>
                          </div>

                          {/* Quick Avatar selector */}
                          <div className="space-y-1 text-[9px] font-mono text-zinc-400">
                            <span>Vocalist Avatar Selection</span>
                            <div className="flex gap-2 items-center">
                              {[
                                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
                                'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
                                'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
                                'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150',
                                'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150'
                              ].map((url, i) => (
                                <button
                                  key={i}
                                  onClick={() => setStageMics(prev => prev.map(m => m.id === mic.id ? { ...m, avatarUrl: url } : m))}
                                  className={`w-6 h-6 rounded-full overflow-hidden border cursor-pointer transition-all ${
                                    mic.avatarUrl === url ? 'border-amber-500 scale-110 shadow-md shadow-amber-500/10' : 'border-white/10 hover:border-white/30'
                                  }`}
                                >
                                  <img src={url} className="w-full h-full object-cover pointer-events-none" />
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Delete mic action */}
                          <button
                            onClick={() => {
                              setStageMics(prev => prev.filter(m => m.id !== mic.id));
                              setExpandedMicId(null);
                            }}
                            className="w-full px-2 py-1 bg-rose-500/10 hover:bg-rose-500/25 border border-rose-500/30 text-rose-400 rounded text-[9px] font-mono uppercase font-bold transition-all cursor-pointer"
                          >
                            Delete Microphone Channel
                          </button>
                        </div>
                      )}

                      {/* Audio VU Indicator & Details */}
                      <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500">
                        <div className="flex items-center gap-1.5 w-2/3">
                          <span>VU</span>
                          <div className="flex-grow h-2 bg-neutral-950 border border-white/[0.04] rounded-sm overflow-hidden flex">
                            {!mic.isMuted ? (
                              <div className="bg-amber-500 h-full transition-all duration-300" style={{ width: `${mic.level}%` }} />
                            ) : (
                              <div className="bg-zinc-900 h-full w-full" />
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Battery className="h-3 w-3" />
                          <span className={`${mic.battery <= 20 ? 'text-red-400 animate-pulse font-bold' : ''}`}>{mic.battery}%</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="bg-neutral-950 p-2.5 rounded-lg border border-neutral-850 text-[10px] text-zinc-500 font-mono mt-4 text-left select-none">
              💡 <strong>System Config</strong>: Create or delete channels above. Click "Edit" to configure frequencies, battery status, roles, or swap vocalist avatars. All changes sync dynamically.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
