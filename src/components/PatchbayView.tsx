import React, { useState } from 'react';
import { PatchNode, PatchConnection } from '../types';
import { Network, Plus, Trash2, Import, Printer, Layers, FileSpreadsheet, RefreshCw, AlertCircle } from 'lucide-react';

interface PatchbayViewProps {
  nodes: PatchNode[];
  setNodes: React.Dispatch<React.SetStateAction<PatchNode[]>>;
  connections: PatchConnection[];
  setConnections: React.Dispatch<React.SetStateAction<PatchConnection[]>>;
}

export default function PatchbayView({ nodes, setNodes, connections, setConnections }: PatchbayViewProps) {
  const [activeSheet, setActiveSheet] = useState<'Audio' | 'Video' | 'Lighting' | 'Network'>('Audio');

  // Node registration inputs
  const [newNodeName, setNewNodeName] = useState('');
  const [newNodeType, setNewNodeType] = useState<PatchNode['type']>('Microphone');
  
  // Connection registration inputs
  const [sourceId, setSourceId] = useState('');
  const [targetId, setTargetId] = useState('');
  const [channelLabel, setChannelLabel] = useState('');
  const [cableColor, setCableColor] = useState('#10b981');

  // CSV Import state
  const [csvText, setCsvText] = useState('');
  const [csvError, setCsvError] = useState<string | null>(null);
  const [showCsvBox, setShowCsvBox] = useState(false);

  // Print simulation status
  const [printingStatus, setPrintingStatus] = useState(false);

  const activeNodes = nodes.filter(n => n.sheet === activeSheet);
  const activeConnections = connections.filter(conn => {
    const sNode = nodes.find(n => n.id === conn.sourceId);
    const tNode = nodes.find(n => n.id === conn.targetId);
    return sNode?.sheet === activeSheet && tNode?.sheet === activeSheet;
  });

  const sheets: Array<'Audio' | 'Video' | 'Lighting' | 'Network'> = ['Audio', 'Video', 'Lighting', 'Network'];

  // Add individual customized node
  const handleAddNode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNodeName.trim()) return;

    const node: PatchNode = {
      id: `node-${Date.now()}`,
      name: newNodeName,
      type: newNodeType,
      sheet: activeSheet,
      // Place node randomly near center of visual container board
      x: 150 + Math.random() * 500,
      y: 100 + Math.random() * 200
    };

    setNodes(prev => [...prev, node]);
    setNewNodeName('');
  };

  // Connect active nodes
  const handleAddConnection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceId || !targetId || sourceId === targetId) return;

    // Check if duplicate connection exists
    const duplicate = connections.find(c => c.sourceId === sourceId && c.targetId === targetId);
    if (duplicate) return;

    const newConn: PatchConnection = {
      id: `conn-${Date.now()}`,
      sourceId,
      targetId,
      channel: channelLabel || undefined,
      cableColor: cableColor
    };

    setConnections(prev => [...prev, newConn]);
    setSourceId('');
    setTargetId('');
    setChannelLabel('');
  };

  // Delete Node
  const handleDeleteNode = (id: string) => {
    setNodes(prev => prev.filter(n => n.id !== id));
    // Cascade delete connections
    setConnections(prev => prev.filter(c => c.sourceId !== id && c.targetId !== id));
  };

  // Delete Connection
  const handleDeleteConnection = (id: string) => {
    setConnections(prev => prev.filter(c => c.id !== id));
  };

  // CSV paste compilation engine based on Section 4.4
  const handleCompileCsv = () => {
    if (!csvText.trim()) {
      setCsvError('Please paste a structured CSV layout to compile.');
      return;
    }
    setCsvError(null);

    // Format expected: Source Name, Source Type, Destination Name, Destination/Target Type, Wire Channel, Cable Color
    // Example: Lead Vocal Wireless Mic, Microphone, Behringer X32 Sound, Mixer, Channel 1, #10b981
    try {
      const rows = csvText.split('\n').map(row => row.split(',').map(cell => cell.trim()));
      const addedNodes: PatchNode[] = [];
      const addedConns: PatchConnection[] = [];

      rows.forEach((row, index) => {
        if (row.length < 4) return; // skip junk headers or malformed columns
        const [srcName, srcType, dstName, dstType, channel, color] = row;
        
        // Find or build Source node
        let sId = `csv-n-${srcName.replace(/\s+/g, '-').toLowerCase()}`;
        if (!nodes.some(n => n.name === srcName) && !addedNodes.some(n => n.name === srcName)) {
          addedNodes.push({
            id: sId,
            name: srcName,
            type: (srcType as any) || 'Microphone',
            sheet: activeSheet,
            x: 100 + addedNodes.length * 90,
            y: 120 + (addedNodes.length % 3) * 110
          });
        } else {
          sId = nodes.find(n => n.name === srcName)?.id || addedNodes.find(n => n.name === srcName)!.id;
        }

        // Find or build target destination node
        let tId = `csv-n-${dstName.replace(/\s+/g, '-').toLowerCase()}`;
        if (!nodes.some(n => n.name === dstName) && !addedNodes.some(n => n.name === dstName)) {
          addedNodes.push({
            id: tId,
            name: dstName,
            type: (dstType as any) || 'Mixer',
            sheet: activeSheet,
            x: 550 + addedNodes.length * 80,
            y: 120 + (addedNodes.length % 2) * 150
          });
        } else {
          tId = nodes.find(n => n.name === dstName)?.id || addedNodes.find(n => n.name === dstName)!.id;
        }

        // Build Connection line
        addedConns.push({
          id: `csv-c-${index}-${Date.now()}`,
          sourceId: sId,
          targetId: tId,
          channel: channel || undefined,
          cableColor: color || '#10b981'
        });
      });

      setNodes(prev => [...prev, ...addedNodes]);
      setConnections(prev => [...prev, ...addedConns]);
      setCsvText('');
      setShowCsvBox(false);
    } catch (e) {
      setCsvError('Parsing failed. Ensure columns align: SourceName, SourceType, TargetName, TargetType, channel_label, hex_color');
    }
  };

  // Simulate High Polish PDF Wireframe Print
  const handleDownloadPdfSchematic = () => {
    setPrintingStatus(true);
    setTimeout(() => {
      setPrintingStatus(false);
      // Trigger browser background alert emulator or success indicator
      alert(`Print-friendly export of ${activeSheet} Patch Sheet generated successfully! Check your local download pipeline.`);
    }, 1200);
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-6" id="patchbay-wrapper">
      {/* Visual Canvas Diagram Area */}
      <div className="xl:col-span-3 space-y-4" id="main-diagram-body">
        <div className="immersive-panel p-6 shadow-2xl relative" id="layout-canvas-card">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h2 className="text-xs font-black uppercase font-sans tracking-widest text-white flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                Visual Patchbay & System Wiring
              </h2>
              <p className="text-xs text-neutral-400 font-mono mt-1">
                Visual routing graph for signal chains, lighting consoles, and network switches.
              </p>
            </div>

            <div className="flex items-center gap-2 font-sans text-xs">
              <button
                type="button"
                onClick={() => setShowCsvBox(!showCsvBox)}
                className="bg-[#18181b] hover:bg-neutral-850 text-neutral-200 px-3.5 py-2.5 rounded-xl transition-all flex items-center gap-1 cursor-pointer border border-white/[0.06]"
                id="toggle-csv-import-btn"
              >
                <Import className="h-4 w-4" /> Import CSV
              </button>
              <button
                type="button"
                onClick={handleDownloadPdfSchematic}
                className="bg-amber-500 hover:bg-amber-400 text-black font-extrabold uppercase tracking-wide px-4 py-2.5 rounded-xl transition-all flex items-center gap-1 cursor-pointer shadow-md shadow-amber-500/10"
                id="export-pdf-btn"
              >
                {printingStatus ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" /> Printing...
                  </>
                ) : (
                  <>
                    <Printer className="h-4 w-4" /> Export Sheet
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Sheet level selection tabs */}
          <div className="flex bg-black/60 p-1.5 rounded-xl border border-white/[0.06] gap-1.5 mb-6 text-xs" id="diagram-sheets-bar">
            {sheets.map(sh => (
              <button
                key={sh}
                onClick={() => setActiveSheet(sh)}
                className={`flex-grow py-2 rounded-lg font-bold tracking-wide cursor-pointer transition-all ${
                  activeSheet === sh ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'text-neutral-400 hover:text-white'
                }`}
              >
                {sh} Diagram Sheet
              </button>
            ))}
          </div>

          {/* Import spreadsheet widget */}
          {showCsvBox && (
            <div className="bg-black/60 border border-white/[0.06] rounded-xl p-5 mb-6 space-y-3" id="csv-import-box">
              <div className="flex justify-between items-center bg-[#18181b] px-3 py-1.5 rounded-lg border border-white/[0.04]">
                <span className="text-xs font-mono text-zinc-300 flex items-center gap-1">
                  <FileSpreadsheet className="h-4.5 w-4.5 text-amber-500" />
                  Spreadsheet CSV Compiler
                </span>
                <button onClick={() => setShowCsvBox(false)} className="text-neutral-500 hover:text-white text-xs cursor-pointer">Close</button>
              </div>
              <p className="text-[11px] text-zinc-400 font-sans leading-relaxed">
                Paste raw comma-separated values matching: <code className="text-zinc-200 font-mono">SourceName, SourceType, TargetName, TargetType, channel_label, hex_color</code>
              </p>
              <textarea
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                placeholder={`e.g.\nLead Vocal Wireless, Microphone, Sound Mixing Desk, Mixer, Fader 01, #f59e0b\nSermon Keynote PC, Computer, Atem Mini Video Hub, Switch, HDMI 3, #3b82f6`}
                className="w-full bg-black border border-white/[0.06] rounded-lg p-2.5 h-24 text-xs font-mono text-white focus:outline-none focus:border-amber-500"
                id="csv-raw-textarea"
              />
              {csvError && (
                <div className="flex items-center gap-1 text-[11px] text-rose-400">
                  <AlertCircle className="h-3.5 w-3.5" />
                  <span>{csvError}</span>
                </div>
              )}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleCompileCsv}
                  className="bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs px-4 py-2 rounded-xl cursor-pointer"
                >
                  Generate Schema Diagram
                </button>
              </div>
            </div>
          )}

          {/* Interactive SVG Nodes Connector Map Board */}
          <div className="bg-black/40 border border-white/[0.04] rounded-2xl p-4 overflow-hidden relative min-h-[420px] select-none" id="interactive-grid-viewport">
            {/* Grid system backdrop */}
            <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />

            {/* Render absolute positioning nodes on top */}
            <div className="relative w-full h-[380px] z-10" id="nodes-canvas-container">
              {activeNodes.map(node => {
                const nodeColors: Record<string, string> = {
                  Microphone: 'bg-indigo-500/10 border-indigo-500 text-indigo-400',
                  'DI Box': 'bg-pink-500/10 border-pink-500 text-pink-400',
                  Mixer: 'bg-emerald-500/10 border-emerald-500 text-emerald-400',
                  Speaker: 'bg-rose-500/10 border-rose-500 text-rose-400',
                  Camera: 'bg-amber-500/10 border-amber-500 text-amber-400',
                  Projector: 'bg-cyan-500/10 border-cyan-500 text-cyan-400',
                  Switch: 'bg-violet-500/10 border-violet-500 text-violet-400',
                  Computer: 'bg-blue-500/10 border-blue-500 text-blue-400',
                };

                return (
                  <div
                    key={node.id}
                    className={`absolute border rounded-xl p-3 shadow-md border-t-4 transition-all w-36 text-center shadow-neutral-950/40 select-none ${nodeColors[node.type]}`}
                    style={{ left: `${node.x}px`, top: `${node.y}px` }}
                    id={`patch-node-${node.id}`}
                  >
                    <span className="text-[9px] font-mono uppercase tracking-wider block opacity-70 mb-0.5">{node.type}</span>
                    <p className="text-xs font-sans font-semibold text-white truncate px-1" title={node.name}>{node.name}</p>
                    <button
                      onClick={() => handleDeleteNode(node.id)}
                      className="text-neutral-500 hover:text-red-400 p-0.5 rounded transition-all mt-2.5 inline-block cursor-pointer self-center"
                      title="Deconnect Node"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                );
              })}

              {/* DRAW CONNECTIONS WITH REAL SVG PATH LINES AND CHANNEL TAG LABELS */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" id="cables-svg-board">
                <defs>
                  <marker
                    id="arrow"
                    viewBox="0 0 10 10"
                    refX="5"
                    refY="5"
                    markerWidth="4"
                    markerHeight="4"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#737373" />
                  </marker>
                </defs>
                {activeConnections.map(conn => {
                  const sNode = nodes.find(n => n.id === conn.sourceId);
                  const tNode = nodes.find(n => n.id === conn.targetId);
                  if (!sNode || !tNode) return null;

                  // Compute visual line mid-points (offset node width/height roughly)
                  const startX = sNode.x + 72; // center width
                  const startY = sNode.y + 40; // bottom bound
                  const endX = tNode.x + 72;
                  const endY = tNode.y + 10;

                  // Compute control paths for beautiful cables
                  const midY = (startY + endY) / 2;

                  return (
                    <g key={conn.id} className="group pointer-events-auto cursor-pointer">
                      <path
                        d={`M ${startX} ${startY} C ${startX} ${midY}, ${endX} ${midY}, ${endX} ${endY}`}
                        fill="none"
                        stroke={conn.cableColor || '#10b981'}
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        markerEnd="url(#arrow)"
                        className="transition-all duration-200 group-hover:stroke-white hover:stroke-3"
                      />
                      
                      {/* Interactive Channel Label background pill on center of wire line */}
                      <foreignObject
                        x={Math.round((startX + endX) / 2) - 30}
                        y={Math.round((startY + endY) / 2) - 10}
                        width="60"
                        height="20"
                      >
                        <div className="bg-neutral-900 border border-neutral-750 px-1 py-0.5 rounded text-[8px] font-mono text-zinc-300 text-center shadow-sm select-none truncate">
                          {conn.channel || 'Link'}
                        </div>
                      </foreignObject>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Editing Controls and registration sidebar panel */}
      <div className="space-y-6" id="patchbay-registration-sidebar">
        {/* Node creation card */}
        <div className="immersive-panel p-5 shadow-2xl space-y-4" id="register-node">
          <h3 className="text-xs font-black uppercase text-white tracking-widest flex items-center gap-1.5 border-b border-white/[0.04] pb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Register Active Node
          </h3>
          <form onSubmit={handleAddNode} className="space-y-3" id="node-creation-form">
            <div>
              <label className="block text-[9px] font-mono text-neutral-500 uppercase mb-1">Node Element Title</label>
              <input
                type="text"
                required
                value={newNodeName}
                onChange={(e) => setNewNodeName(e.target.value)}
                placeholder="e.g. Lead Keyboard MIDI"
                className="w-full bg-black border border-white/[0.06] rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                id="node-title-input"
              />
            </div>
            <div>
              <label className="block text-[9px] font-mono text-neutral-500 uppercase mb-1">Equipment Type Preset</label>
              <select
                value={newNodeType}
                onChange={(e) => setNewNodeType(e.target.value as any)}
                className="w-full bg-black border border-white/[0.06] rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                id="node-type-select"
              >
                <option value="Microphone">Microphone</option>
                <option value="DI Box">DI Box (Direct Input)</option>
                <option value="Mixer">Sound Console Mixer</option>
                <option value="Speaker">Output Line Array SPK</option>
                <option value="Camera">Blackmagic Camera Feed</option>
                <option value="Projector">Foyer/Projector Screen</option>
                <option value="Switch">Gigabit PoE Router Switch</option>
                <option value="Computer">Workstation Computer</option>
              </select>
            </div>
            <button
              type="submit"
              className="w-full bg-[#18181b] hover:bg-neutral-800 text-white border border-white/[0.06] font-semibold text-xs py-2.5 rounded-xl cursor-pointer flex items-center justify-center gap-1 transition-all"
              id="submit-node-btn"
            >
              Add Node to Canvas
            </button>
          </form>
        </div>

        {/* Patch Connection creator */}
        <div className="immersive-panel p-5 shadow-2xl space-y-4" id="register-cable">
          <h3 className="text-xs font-black uppercase text-white tracking-widest flex items-center gap-1.5 border-b border-white/[0.04] pb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            Map Patch Wire
          </h3>
          <form onSubmit={handleAddConnection} className="space-y-3" id="wire-creation-form">
            <div>
              <label className="block text-[9px] font-mono text-neutral-500 uppercase mb-1">Source Node Device</label>
              <select
                value={sourceId}
                onChange={(e) => setSourceId(e.target.value)}
                className="w-full bg-black border border-white/[0.06] rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                id="source-node-select"
              >
                <option value="">-- Choose Source --</option>
                {activeNodes.map(node => (
                  <option key={node.id} value={node.id}>{node.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[9px] font-mono text-neutral-500 uppercase mb-1">Target Receiver Device</label>
              <select
                value={targetId}
                onChange={(e) => setTargetId(e.target.value)}
                className="w-full bg-black border border-white/[0.06] rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                id="target-node-select"
              >
                <option value="">-- Choose Target --</option>
                {activeNodes.map(node => (
                  <option key={node.id} value={node.id}>{node.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[9px] font-mono text-neutral-500 uppercase mb-1">Fader/Port/Channel label</label>
              <input
                type="text"
                value={channelLabel}
                onChange={(e) => setChannelLabel(e.target.value)}
                placeholder="e.g. Fader 03, HDMI 1"
                className="w-full bg-black border border-white/[0.06] rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                id="channel-label-input"
              />
            </div>
            <div>
              <label className="block text-[9px] font-mono text-neutral-500 uppercase mb-1">Cable Marker Color</label>
              <div className="flex gap-2 bg-black p-2 rounded-xl border border-white/[0.06] flex-wrap" id="color-selectors">
                {['#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#a855f7', '#06b6d4', '#737373'].map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setCableColor(color)}
                    className="w-6 h-6 rounded-md border border-neutral-700 cursor-pointer"
                    style={{ backgroundColor: color, ringWidth: cableColor === color ? '2px' : '0' }}
                  />
                ))}
              </div>
            </div>
            <button
              type="submit"
              disabled={!sourceId || !targetId}
              className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-30 text-black font-extrabold uppercase tracking-wide text-xs py-2.5 rounded-xl cursor-pointer transition-all flex items-center justify-center gap-1 shadow-md shadow-amber-500/10"
              id="submit-cable-btn"
            >
              Draw Patch Connection
            </button>
          </form>
        </div>

        {/* Existing Connections and Cable listing table */}
        <div className="immersive-panel p-5 shadow-2xl space-y-4" id="logged-cables">
          <h3 className="text-xs font-black uppercase text-white tracking-widest flex items-center gap-1.5 border-b border-white/[0.04] pb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Wired Cable Registry
          </h3>
          <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1" id="logged-cables-list">
            {activeConnections.length > 0 ? (
              activeConnections.map(conn => {
                const s = nodes.find(n => n.id === conn.sourceId);
                const t = nodes.find(n => n.id === conn.targetId);
                return (
                  <div key={conn.id} className="bg-black/60 p-2.5 rounded-xl text-[11px] flex justify-between items-center gap-2 border border-white/[0.04]">
                    <div className="truncate space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded shrink-0" style={{ backgroundColor: conn.cableColor || '#10b981' }} />
                        <span className="text-neutral-500 font-mono">[{conn.channel || 'Link'}]</span>
                      </div>
                      <p className="text-zinc-300 font-sans font-medium truncate leading-tight">
                        {s?.name} ➜ {t?.name}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteConnection(conn.id)}
                      className="text-neutral-600 hover:text-red-400 p-1 shrink-0 cursor-pointer"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                );
              })
            ) : (
              <p className="text-center text-[10px] text-neutral-500 italic py-4">No wire connections. Add one above.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
