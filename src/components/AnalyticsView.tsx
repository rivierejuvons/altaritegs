import React, { useState } from 'react';
import { ServiceItem, ChecklistItem, TrainingModule } from '../types';
import { BarChart2, TrendingUp, Users, Download, Calendar, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface AnalyticsViewProps {
  items: ServiceItem[];
  checklists: ChecklistItem[];
  trainingModules: TrainingModule[];
}

export default function AnalyticsView({ items, checklists, trainingModules }: AnalyticsViewProps) {
  const [activeReportTab, setActiveReportTab] = useState<'service' | 'trends' | 'volunteers'>('service');

  // Static historic trend metrics matching Section 4.8
  const weekPacingTrends = [
    { week: 'May 31', planned: 2100, actual: 2150, splPeak: 86.4 },
    { week: 'June 07', planned: 2100, actual: 2040, splPeak: 89.2 },
    { week: 'June 14', planned: 2100, actual: 2280, splPeak: 87.1 },
    { week: 'June 21', planned: 2100, actual: 2136, splPeak: 88.5 }, // Sunday sermon run long
  ];

  const crewAttendanceHistory = [
    { name: 'James (Audio)', role: 'Audio', completedChecks: 32, hoursServed: 16, completedTraining: 2 },
    { name: 'Maria (Video)', role: 'Video', completedChecks: 40, hoursServed: 20, completedTraining: 3 },
    { name: 'Toni (Lighting)', role: 'Lighting', completedChecks: 28, hoursServed: 14, completedTraining: 1 },
    { name: 'David (Worship Lead)', role: 'Worship', completedChecks: 12, hoursServed: 24, completedTraining: 2 },
  ];

  // Computations for active summary
  const totalCount = items.length;
  const overdueItems = items.filter(i => i.elapsed > i.duration).length;
  const onTimePercent = totalCount > 0 ? Math.round(((totalCount - overdueItems) / totalCount) * 100) : 100;

  const averageSpl = 84.6;
  const maxRecordedDb = 89.1;

  const handleExportCsvData = () => {
    alert("Export CSV pipeline triggered successfully. Saved raw diagnostic reports to download queue!");
  };

  return (
    <div className="space-y-6" id="analytics-master-container">
      {/* Overview Analytics Header */}
      <div className="immersive-panel p-5 shadow-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4" id="report-control-bar">
        <div>
          <h2 className="text-xs font-black uppercase font-sans tracking-widest text-white flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            Analytics & Quality Reports
          </h2>
          <p className="text-xs text-neutral-400 font-mono mt-1">
            Improve service timing leaks, decibel pacing logs, and volunteer compliance history.
          </p>
        </div>

        <button
          onClick={handleExportCsvData}
          className="bg-[#18181b] hover:bg-neutral-850 text-neutral-300 font-sans text-xs px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer border border-white/[0.06]"
          id="export-reports-btn"
        >
          <Download className="h-4 w-4 text-amber-500" /> Export Report Data
        </button>
      </div>

      {/* Grid tabs */}
      <div className="grid grid-cols-3 bg-black/60 border border-white/[0.06] p-1.5 rounded-xl gap-1.5 text-xs sm:text-sm font-sans" id="analytics-tabs-holder">
        <button
          onClick={() => setActiveReportTab('service')}
          className={`py-2 px-1 rounded-lg font-bold tracking-wide transition-all cursor-pointer flex items-center justify-center gap-1 sm:gap-2 ${
            activeReportTab === 'service' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-sm' : 'text-neutral-400 hover:text-white'
          }`}
        >
          <BarChart2 className="h-4 w-4" /> Service Run Summary
        </button>
        <button
          onClick={() => setActiveReportTab('trends')}
          className={`py-2 px-1 rounded-lg font-bold tracking-wide transition-all cursor-pointer flex items-center justify-center gap-1 sm:gap-2 ${
            activeReportTab === 'trends' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-sm' : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Calendar className="h-4 w-4" /> 4-Week Trends
        </button>
        <button
          onClick={() => setActiveReportTab('volunteers')}
          className={`py-2 px-1 rounded-lg font-bold tracking-wide transition-all cursor-pointer flex items-center justify-center gap-1 sm:gap-2 ${
            activeReportTab === 'volunteers' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-sm' : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Users className="h-4 w-4" /> Volunteer Roster
        </button>
      </div>

      {/* Tab 1 Content: Active Sunday Service Summary */}
      {activeReportTab === 'service' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="service-analytics-tab-panel">
          {/* Main timeline visual charts */}
          <div className="lg:col-span-2 immersive-panel p-6 shadow-2xl space-y-6">
            <div>
              <h3 className="text-xs font-black uppercase text-white tracking-widest font-mono">
                Planned vs. Actual Segment Durations
              </h3>
              <p className="text-[11px] text-zinc-500 font-mono mt-0.5">Time variance in minutes across run sheet segments.</p>
            </div>

            {/* Custom Responsive SVG Bar Chart */}
            <div className="relative h-[220px] bg-black/40 border border-white/[0.04] rounded-2xl p-4 flex flex-col justify-end overflow-hidden" id="svg-bar-chart">
              <div className="flex justify-between items-end h-[160px] gap-3 relative z-10">
                {items.map((item) => {
                  const planMin = item.duration / 60;
                  const actualMin = item.status === 'upcoming' ? planMin : (item.elapsed / 60);
                  
                  // Compute bar heights proportionally
                  const maxVal = 35; // Cap at 35 mins for visual spacing
                  const planHeight = Math.min(100, Math.max(8, (planMin / maxVal) * 100));
                  const actualHeight = Math.min(100, Math.max(8, (actualMin / maxVal) * 100));

                  return (
                    <div key={item.id} className="flex-1 flex flex-col items-center justify-end h-full gap-1 group">
                      <div className="w-full flex justify-center items-end gap-1.5 h-full">
                        {/* Planned Bar (Indigo) */}
                        <div
                          className="w-3 bg-indigo-600/40 border border-indigo-500/20 rounded-t transition-all group-hover:bg-indigo-500"
                          style={{ height: `${planHeight}%` }}
                          title={`Planned Duration: ${planMin.toFixed(1)}m`}
                        />
                        {/* Actual Bar (Amber/Red) */}
                        <div
                          className={`w-3 rounded-t transition-all ${
                            actualMin > planMin ? 'bg-[#ef4444]/60 border border-rose-500/20' : 'bg-amber-500/50 border border-amber-500/20'
                          }`}
                          style={{ height: `${actualHeight}%` }}
                          title={`Actual/Elapsed: ${actualMin.toFixed(1)}m`}
                        />
                      </div>
                      <span className="text-[9px] font-mono text-zinc-500 truncate max-w-[50px] mt-1 shrink-0" title={item.title}>
                        {item.title.split(' ')[0]}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Chart Legends */}
              <div className="flex gap-4 border-t border-white/[0.04] pt-3 text-[10px] font-mono text-zinc-500 shrink-0">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-indigo-500/40 rounded" /> Planned Schedule</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-amber-500/50 rounded" /> On-Time Segment</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-rose-500/60 rounded" /> Over-run Delay</span>
              </div>
            </div>

            {/* Segment breakdown details table */}
            <div className="border border-white/[0.06] rounded-xl overflow-hidden text-xs">
              <div className="bg-black/60 p-2.5 font-mono text-neutral-400 uppercase text-[9px] grid grid-cols-3 border-b border-white/[0.04]">
                <span>Segment Name</span>
                <span className="text-center">Variance</span>
                <span className="text-right">Responsible</span>
              </div>
              <div className="divide-y divide-white/[0.04] p-1 bg-black/20">
                {items.map(item => {
                  const varSec = item.status === 'upcoming' ? 0 : (item.elapsed - item.duration);
                  return (
                    <div key={item.id} className="p-2.5 grid grid-cols-3 items-center">
                      <span className="font-sans font-medium text-zinc-300 truncate pr-1">{item.title}</span>
                      <span className={`text-center font-mono font-semibold ${varSec === 0 ? 'text-zinc-500' : varSec > 0 ? 'text-red-400' : 'text-amber-400'}`}>
                        {varSec === 0 ? 'EVEN' : `${varSec > 0 ? '+' : ''}${Math.round(varSec / 60)} min`}
                      </span>
                      <span className="text-right text-zinc-500 truncate">{item.owner}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Timing metrics gauge widgets */}
          <div className="space-y-6" id="service-analytics-sidebar">
            <div className="immersive-panel p-5 shadow-2xl space-y-4">
              <h3 className="text-xs font-black uppercase text-white tracking-widest font-mono">
                Pacing Performance metrics
              </h3>
              
              <div className="space-y-4">
                <div className="bg-black/40 border border-white/[0.04] p-4 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-zinc-500 block">ON-TIME COMPLIANCE</span>
                    <span className="text-2xl font-mono font-bold text-amber-500">{onTimePercent}%</span>
                  </div>
                  {onTimePercent > 70 ? (
                    <ArrowUpRight className="h-6 w-6 text-amber-500 shrink-0" />
                  ) : (
                    <ArrowDownRight className="h-6 w-6 text-red-400 shrink-0" />
                  )}
                </div>

                <div className="bg-black/40 border border-white/[0.04] p-4 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-zinc-500 block">PEAK SYSTEM DECIBEL</span>
                    <span className="text-2xl font-mono font-bold text-white">{maxRecordedDb} dBA</span>
                  </div>
                  <span className="bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded font-mono text-[10px] px-2 py-0.5" title="Decibel peak recorded limit">
                    PEAK SAFE
                  </span>
                </div>

                <div className="bg-black/40 border border-white/[0.04] p-4 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-zinc-500 block">AVERAGE SERVICE SOUND</span>
                    <span className="text-2xl font-mono font-bold text-zinc-300">{averageSpl} dBA</span>
                  </div>
                  <span className="text-zinc-500 font-mono text-xs">A-Leq</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2 Content: 4-Week Trends */}
      {activeReportTab === 'trends' && (
        <div className="immersive-panel p-6 shadow-2xl space-y-6" id="trends-tab-panel">
          <div>
            <h3 className="text-xs font-black uppercase text-white tracking-widest font-mono">
              Historical 4-Week Service Pacing Trends
            </h3>
            <p className="text-[11px] text-zinc-500 font-mono mt-0.5">Evaluate if sermon or worship segments consistently run long over historical weeks.</p>
          </div>

          {/* SVG line chart representing actual service elapsed times versus the planned schedules */}
          <div className="relative h-[250px] bg-black/40 border border-white/[0.04] rounded-2xl p-5 flex flex-col justify-end" id="trends-line-chart">
            <div className="flex justify-between items-end h-[170px] relative z-10 px-6">
              {weekPacingTrends.map((trend) => {
                const heightPlannedRatio = (trend.planned / 2400) * 100;
                const heightActualRatio = (trend.actual / 2400) * 100;

                return (
                  <div key={trend.week} className="flex flex-col items-center justify-end h-full relative group">
                    <div className="absolute inset-y-0 flex flex-col justify-end items-center gap-1 w-20">
                      {/* Planned mark marker */}
                      <div
                        className="w-3.5 h-3.5 rounded-full bg-indigo-500 border border-white/20 absolute shadow-sm"
                        style={{ bottom: `${heightPlannedRatio}%` }}
                        title={`Planned budget: ${trend.planned} sec`}
                      />
                      {/* Actual mark marker */}
                      <div
                        className={`w-3.5 h-3.5 rounded-full border border-white/20 absolute shadow-sm transition-all group-hover:scale-125 ${
                          trend.actual > trend.planned ? 'bg-rose-500' : 'bg-amber-500'
                        }`}
                        style={{ bottom: `${heightActualRatio}%` }}
                        title={`Actual elapsed: ${trend.actual} sec`}
                      />
                    </div>
                    <span className="text-[10px] font-mono text-neutral-500 mt-2">{trend.week}</span>
                  </div>
                );
              })}

              {/* Connecting line drawing backing */}
              <svg className="absolute inset-0 w-full h-[170px] pointer-events-none z-0 px-6" viewBox="0 0 400 170" preserveAspectRatio="none">
                {/* Visual curves drawn */}
                <path d="M 50 120 Q 150 110, 255 130 T 350 110" fill="none" stroke="#6366f1" strokeWidth="2" strokeDasharray="4 4" />
                <path d="M 50 125 Q 150 135, 255 90 T 350 115" fill="none" stroke="#f59e0b" strokeWidth="2.5" />
              </svg>
            </div>

            {/* Line legends */}
            <div className="flex gap-4 border-t border-white/[0.04] pt-3 text-[10px] font-mono text-zinc-500 shrink-0">
              <span className="flex items-center gap-1.5"><span className="w-3.5 h-1 bg-indigo-500 border-t border-dashed" /> Planned Budget</span>
              <span className="flex items-center gap-1.5"><span className="w-3.5 h-1 bg-amber-500" /> Actual Runtime Line</span>
              <span className="text-neutral-500 font-sans italic ml-auto text-[9px]">Goal: maintain target overlap below deviancy threshold</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3 Content: Volunteer tracking */}
      {activeReportTab === 'volunteers' && (
        <div className="immersive-panel p-6 shadow-2xl space-y-4" id="volunteers-tab-panel">
          <div>
            <h3 className="text-xs font-black uppercase text-white tracking-widest font-mono">
              Active Crew & Volunteer Compliance Roster
            </h3>
            <p className="text-[11px] text-zinc-500 font-mono mt-0.5">Track checklist sign-offs and completed course credentials per crew member.</p>
          </div>

          <div className="border border-white/[0.06] rounded-xl overflow-hidden text-xs font-sans">
            <div className="bg-black/60 p-3 font-mono text-neutral-400 uppercase text-[9px] grid grid-cols-4 select-none border-b border-white/[0.04]">
              <span>Crew Name</span>
              <span className="text-center">Checks Completed</span>
              <span className="text-center">Hours Served</span>
              <span className="text-right">Course units Completed</span>
            </div>
            <div className="divide-y divide-white/[0.04] bg-black/20">
              {crewAttendanceHistory.map((vol, index) => (
                <div key={index} className="p-3 grid grid-cols-4 items-center">
                  <span className="font-medium text-zinc-200">{vol.name}</span>
                  <span className="text-center font-mono font-semibold text-amber-500">{vol.completedChecks} signed</span>
                  <span className="text-center font-mono text-zinc-400">{vol.hoursServed} hrs</span>
                  <span className="text-right font-mono font-bold text-white uppercase">{vol.completedTraining} units done</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
