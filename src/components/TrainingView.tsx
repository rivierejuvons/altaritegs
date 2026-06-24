import React, { useState } from 'react';
import { TrainingModule } from '../types';
import { Play, Pause, GraduationCap, Clock, CheckCircle2, ChevronRight, Video, FileText, Sparkles } from 'lucide-react';

interface TrainingViewProps {
  modules: TrainingModule[];
  setModules: React.Dispatch<React.SetStateAction<TrainingModule[]>>;
}

export default function TrainingView({ modules, setModules }: TrainingViewProps) {
  const [selectedModuleId, setSelectedModuleId] = useState(modules[0]?.id || '');
  const [filterCategory, setFilterCategory] = useState<string>('All');

  // Video controller simulation state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0); // in seconds
  const [quizAnswer, setQuizAnswer] = useState<string>('');
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const activeModule = modules.find(m => m.id === selectedModuleId) || modules[0];

  const categories = ['All', 'Audio Fundamentals', 'Running the Mix', 'Video Engineering', 'Camera Work'];

  const filteredModules = filterCategory === 'All'
    ? modules
    : modules.filter(m => m.category === filterCategory);

  // Math metrics for progress tracking
  const totalPathsCount = modules.length;
  const completedPathsCount = modules.filter(m => m.completed).length;
  const overallPercentage = Math.round((completedPathsCount / totalPathsCount) * 100);

  const handleTogglePlayVideo = () => {
    setIsPlaying(!isPlaying);
  };

  const handleRestartVideo = () => {
    setCurrentTime(0);
    setIsPlaying(true);
  };

  const handleAcknowledgeAndSignOff = () => {
    if (!quizAnswer) {
      setToastMessage("Please pick an assessment quiz answer first to register compliance.");
      return;
    }

    setModules(prev =>
      prev.map(mod =>
        mod.id === selectedModuleId
          ? {
              ...mod,
              completed: true,
              acknowledgedAt: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
          : mod
      )
    );
    setQuizSubmitted(true);
    setToastMessage("Compliance logs saved successfully! Your producer has been flagged.");
    setTimeout(() => setToastMessage(null), 3500);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="training-paths-wrapper">
      {/* Course curriculum sidebar selection */}
      <div className="lg:col-span-1 space-y-4" id="curriculum-sidebar">
        <div className="immersive-panel p-5 shadow-2xl" id="academy-syllabus">
          <div>
            <h2 className="text-xs font-black uppercase font-sans tracking-widest text-white flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              Training Academy
            </h2>
            <p className="text-xs text-neutral-400 font-mono mt-1">
              Develop your volunteers on-site without internet buffers.
            </p>
          </div>

          {/* Progress Tracker bar */}
          <div className="bg-black/40 border border-white/[0.04] p-3.5 my-4 rounded-xl" id="syllabus-progress-tracker">
            <div className="flex justify-between items-center text-[10px] font-mono mb-1.5">
              <span className="text-zinc-500">Vol Unit Compliance:</span>
              <span className="text-amber-400 font-bold">{overallPercentage}% ({completedPathsCount}/{totalPathsCount})</span>
            </div>
            <div className="w-full h-1.5 bg-neutral-900 rounded-full overflow-hidden">
              <div
                className="bg-amber-500 h-full transition-all duration-300"
                style={{ width: `${overallPercentage}%` }}
              />
            </div>
          </div>

          {/* Category drop drawer filters */}
          <div className="space-y-2 mb-4">
            <label className="block text-[9px] font-mono text-neutral-500 uppercase">Category Subject Filter</label>
            <div className="flex flex-wrap gap-1.5 font-mono text-[9px]">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer ${
                    filterCategory === cat
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 font-bold'
                      : 'bg-black border-white/[0.06] text-neutral-400 hover:text-white'
                  }`}
                >
                  {cat.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Modules selector list */}
          <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1" id="curriculum-list">
            {filteredModules.map(mod => {
              const isSelected = mod.id === selectedModuleId;
              return (
                <div
                  key={mod.id}
                  onClick={() => {
                    setSelectedModuleId(mod.id);
                    setQuizSubmitted(false);
                    setQuizAnswer('');
                    setIsPlaying(false);
                  }}
                  className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-amber-500/[0.03] border-amber-500/40 text-amber-400 shadow-sm shadow-amber-500/5'
                      : 'bg-black/40 border-white/[0.05] hover:border-white/[0.12]'
                  }`}
                  id={`course-select-${mod.id}`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-[9px] font-mono text-zinc-500 uppercase">{mod.category}</span>
                    {mod.completed && <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0" />}
                  </div>
                  <h4 className="text-zinc-100 font-semibold font-sans mt-1 leading-tight truncate">{mod.title}</h4>
                  <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 mt-2 font-mono">
                    <Clock className="h-3.5 w-3.5 text-neutral-500" />
                    <span>Duration: {mod.duration}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Course Player Frame and steps */}
      {activeModule && (
        <div className="lg:col-span-2 space-y-4" id="main-player-panel">
          <div className="immersive-panel p-6 shadow-2xl space-y-5" id="academy-player-card">
            <div className="flex justify-between items-start border-b border-white/[0.04] pb-3">
              <div>
                <span className="text-[9px] font-mono uppercase bg-black border border-white/[0.06] px-2.5 py-1 rounded text-amber-505">
                  {activeModule.category} Training Path
                </span>
                <h3 className="text-lg font-sans tracking-tight font-medium text-white mt-1.5 leading-snug">
                  {activeModule.title}
                </h3>
              </div>
              <div className="text-right flex flex-col items-end shrink-0 select-none">
                <span className="text-[10px] font-mono text-neutral-500 uppercase">Track Compliance Unit:</span>
                {activeModule.completed ? (
                  <span className="text-xs text-amber-400 font-bold bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 rounded-full inline-block mt-1">
                    SIGNED AT {activeModule.acknowledgedAt?.split(' ')[1] || '09:00 AM'}
                  </span>
                ) : (
                  <span className="text-xs text-amber-400 font-bold bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full inline-block mt-1 animate-pulse">
                    COMPLIANCE REQUIRED
                  </span>
                )}
              </div>
            </div>

            {/* Video Canvas Presentation Frame */}
            <div className="relative bg-black rounded-xl aspect-video overflow-hidden border border-neutral-950 shadow-inner group" id="video-frame">
              {/* Photo backdrop */}
              <img
                src={activeModule.videoUrl}
                alt="Active lesson course preview frame"
                className="absolute inset-0 h-full w-full object-cover opacity-60"
                referrerPolicy="no-referrer"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-neutral-950/40 pointer-events-none" />

              {/* Player play overlays */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                {!isPlaying ? (
                  <button
                    onClick={handleTogglePlayVideo}
                    className="w-16 h-16 rounded-full bg-amber-500 text-black flex items-center justify-center transition-all shadow-lg scale-100 hover:scale-105 cursor-pointer pointer-events-auto shadow-amber-500/25"
                    id="video-play-mid-btn"
                  >
                    <Play className="h-8 w-8 ml-1 fill-black" />
                  </button>
                ) : (
                  <button
                    onClick={handleTogglePlayVideo}
                    className="w-16 h-16 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 text-white flex items-center justify-center transition-all cursor-pointer pointer-events-auto"
                  >
                    <Pause className="h-8 w-8 text-white fill-white" />
                  </button>
                )}
              </div>

              {/* Bottom media timeline bar */}
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 to-black/30 p-4 flex flex-col gap-2 pointer-events-auto" id="media-timeline-bar">
                {/* Timeline slide progress */}
                <div className="w-full h-1.5 bg-neutral-700 rounded-full overflow-hidden cursor-pointer">
                  <div className="bg-amber-500 h-full w-1/3" />
                </div>

                <div className="flex justify-between items-center text-[10px] font-mono text-zinc-300">
                  <div className="flex items-center gap-2">
                    <button onClick={handleTogglePlayVideo} className="hover:text-amber-400 cursor-pointer">
                      {isPlaying ? 'PAUSE' : 'PLAY'}
                    </button>
                    <button onClick={handleRestartVideo} className="hover:text-amber-400 cursor-pointer">RESTART</button>
                    <span>| Local mini-PC stream active</span>
                  </div>
                  <span>04:12 / {activeModule.duration}</span>
                </div>
              </div>
            </div>

            {/* Step text guidelines description */}
            <div className="space-y-3" id="course-step-summary">
              <h4 className="text-xs font-sans uppercase font-semibold text-neutral-400 tracking-wider font-mono flex items-center gap-1">
                <FileText className="h-4 w-4 text-amber-500" />
                Lesson Outline & Syllabus Guides
              </h4>
              <p className="text-zinc-300 font-sans text-xs md:text-sm leading-relaxed">
                {activeModule.description}
              </p>
            </div>

            {/* Self assessment checklist quiz module */}
            <div className="bg-black/60 p-5 rounded-2xl border border-white/[0.04] space-y-4" id="assessment-block">
              <div>
                <h4 className="text-xs font-mono font-bold text-zinc-100 flex items-center gap-1 uppercase">
                  <Sparkles className="text-amber-500 h-4 w-4" />
                  Syllabus Compliance Quiz Box
                </h4>
                <p className="text-[10px] text-zinc-500 mt-1">Select critical response to complete sign-off</p>
              </div>

              <div className="space-y-2.5 text-xs text-zinc-300 font-sans" id="quiz-question-pane">
                <p className="font-semibold text-zinc-200">How do you verify if monitor loops have clipping overheads during lead keys?</p>
                
                <div className="space-y-2" id="quiz-choices">
                  <label className="flex items-start gap-2.5 bg-black border border-white/[0.06] p-3 rounded-xl hover:border-amber-500/20 cursor-pointer block select-none transition-all">
                    <input
                      type="radio"
                      name="quiz"
                      value="a"
                      checked={quizAnswer === 'a'}
                      onChange={(e) => setQuizAnswer(e.target.value)}
                      disabled={activeModule.completed}
                      className="mt-0.5 accent-amber-500"
                    />
                    <span>Open terminal parameters on monitor workstations and trigger global resets.</span>
                  </label>
                  <label className="flex items-start gap-2.5 bg-black border border-white/[0.06] p-3 rounded-xl hover:border-amber-500/20 cursor-pointer block select-none transition-all">
                    <input
                      type="radio"
                      name="quiz"
                      value="b"
                      checked={quizAnswer === 'b'}
                      onChange={(e) => setQuizAnswer(e.target.value)}
                      disabled={activeModule.completed}
                      className="mt-0.5 accent-amber-500"
                    />
                    <span>Gradually scale line gain trim sliders and observe the peak meter levels below clip target.</span>
                  </label>
                </div>
              </div>

              {toastMessage && (
                <div className="text-xs font-sans text-amber-400 bg-amber-500/10 p-3 rounded-xl border border-amber-500/20">
                  {toastMessage}
                </div>
              )}

              <div className="flex justify-end gap-2 text-xs">
                {!activeModule.completed && (
                  <button
                    type="button"
                    onClick={handleAcknowledgeAndSignOff}
                    className="bg-amber-500 hover:bg-amber-400 text-black font-extrabold uppercase tracking-wide px-4 py-2.5 rounded-xl cursor-pointer transition-all shadow-md shadow-amber-500/10"
                    id="quiz-submit-btn"
                  >
                    I Completed & Understand This Lesson
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
