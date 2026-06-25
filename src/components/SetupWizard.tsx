import React, { useState } from 'react';
import { ArrowRight, Check, Monitor, QrCode, Wifi } from 'lucide-react';

interface SetupWizardProps {
  onComplete: (data: { loadDemo: boolean, pcoToken: string }) => void;
}

export default function SetupWizard({ onComplete }: SetupWizardProps) {
  const [step, setStep] = useState(1);
  const [pcoToken, setPcoToken] = useState('');
  const [loadDemo, setLoadDemo] = useState(false);

  const handleNext = () => {
    if (step < 5) {
      setStep(step + 1);
    } else {
      onComplete({ loadDemo, pcoToken });
    }
  };

  return (
    <div className="fixed inset-0 bg-neutral-950 text-white flex items-center justify-center p-4 z-[100] font-sans">
      <div className="max-w-xl w-full bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header / Progress */}
        <div className="h-1 bg-white/5 w-full">
          <div 
            className="h-full bg-amber-500 transition-all duration-500"
            style={{ width: `${(step / 5) * 100}%` }}
          />
        </div>
        
        <div className="p-8 flex-grow">
          {step === 1 && (
            <div className="text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="mx-auto w-16 h-16 bg-amber-500/10 rounded-2xl border border-amber-500/20 flex items-center justify-center mb-6">
                <Monitor className="w-8 h-8 text-amber-500" />
              </div>
              <h1 className="text-3xl font-black tracking-tight">Altarite is ready.</h1>
              <p className="text-zinc-400 text-lg">Let's connect your team and get your environment set up.</p>
              
              <div className="pt-8">
                <button 
                  onClick={handleNext}
                  className="bg-amber-500 hover:bg-amber-600 text-black font-bold py-3 px-8 rounded-xl text-lg flex items-center justify-center w-full transition-all"
                >
                  Get Started <ArrowRight className="ml-2 w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="text-center space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="mx-auto w-16 h-16 bg-teal-500/10 rounded-2xl border border-teal-500/20 flex items-center justify-center mb-6">
                <Wifi className="w-8 h-8 text-teal-500" />
              </div>
              <h1 className="text-2xl font-black tracking-tight">Network & Access</h1>
              <p className="text-zinc-400">Share this with your team to connect to the system.</p>
              
              <div className="bg-black/50 border border-white/10 p-6 rounded-xl flex items-center gap-6 justify-center">
                <div className="w-32 h-32 bg-white rounded-lg flex items-center justify-center p-2">
                  <QrCode className="w-full h-full text-black" />
                </div>
                <div className="text-left space-y-2">
                  <span className="text-[10px] font-mono uppercase text-zinc-500 font-bold block">Local Network IP</span>
                  <div className="text-2xl font-mono text-white tracking-wider">192.168.1.105</div>
                  <button className="text-teal-400 text-sm font-bold hover:underline">Test Connection</button>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button 
                  onClick={handleNext}
                  className="bg-white hover:bg-zinc-200 text-black font-bold py-2.5 px-6 rounded-lg flex items-center transition-all"
                >
                  Next Step <ArrowRight className="ml-2 w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 text-center">
              <h1 className="text-2xl font-black tracking-tight">Connect Planning Center</h1>
              <p className="text-zinc-400 max-w-md mx-auto">Connect to Planning Center to import your service plans automatically.</p>
              
              <div className="text-left space-y-2 max-w-sm mx-auto">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">API Token (Optional)</label>
                <input 
                  type="password"
                  value={pcoToken}
                  onChange={(e) => setPcoToken(e.target.value)}
                  placeholder="Paste your Personal Access Token"
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500/50"
                />
              </div>

              <div className="pt-8 flex items-center justify-between">
                <button 
                  onClick={handleNext}
                  className="text-zinc-500 hover:text-white font-medium transition-colors"
                >
                  Skip for now
                </button>
                <button 
                  onClick={handleNext}
                  className="bg-white hover:bg-zinc-200 text-black font-bold py-2.5 px-6 rounded-lg flex items-center transition-all"
                >
                  Continue <ArrowRight className="ml-2 w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="text-center space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <h1 className="text-2xl font-black tracking-tight">Presentation Software</h1>
              <p className="text-zinc-400">What presentation software do you use? We will auto-discover it on the network.</p>
              
              <div className="grid grid-cols-1 gap-3 max-w-sm mx-auto">
                {['FreeShow', 'ProPresenter', 'EasyWorship'].map((software) => (
                  <button key={software} className="bg-black/40 hover:bg-white/5 border border-white/10 hover:border-amber-500/50 p-4 rounded-xl text-left font-bold transition-all flex justify-between items-center group">
                    {software}
                    <span className="w-5 h-5 rounded-full border border-white/20 group-hover:border-amber-500 flex items-center justify-center">
                    </span>
                  </button>
                ))}
              </div>

              <div className="pt-6 flex items-center justify-between">
                <button 
                  onClick={handleNext}
                  className="text-zinc-500 hover:text-white font-medium transition-colors"
                >
                  Skip
                </button>
                <button 
                  onClick={handleNext}
                  className="bg-white hover:bg-zinc-200 text-black font-bold py-2.5 px-6 rounded-lg flex items-center transition-all"
                >
                  Continue <ArrowRight className="ml-2 w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="text-center space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="mx-auto w-16 h-16 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 flex items-center justify-center mb-6">
                <Check className="w-8 h-8 text-emerald-500" />
              </div>
              <h1 className="text-3xl font-black tracking-tight">You're Ready.</h1>
              <p className="text-zinc-400">Altarite is set up. Your team can connect using the QR code.</p>
              
              {/* Optional Demo Data Load */}
              <div className="bg-black/30 border border-white/5 p-4 rounded-xl max-w-sm mx-auto text-left flex items-start gap-3 mt-4">
                <input 
                  type="checkbox" 
                  id="load-demo" 
                  checked={loadDemo} 
                  onChange={(e) => setLoadDemo(e.target.checked)}
                  className="mt-1 w-4 h-4 accent-amber-500 rounded cursor-pointer"
                />
                <label htmlFor="load-demo" className="text-sm text-zinc-300 cursor-pointer select-none">
                  <span className="block text-white font-bold mb-0.5">Load Demo Data</span>
                  Populate the workspace with mock service items, checklists, and patch bays to explore the app.
                </label>
              </div>

              <div className="pt-8">
                <button 
                  onClick={handleNext}
                  className="bg-amber-500 hover:bg-amber-600 text-black font-bold py-3 px-8 rounded-xl text-lg flex items-center justify-center w-full transition-all"
                >
                  Open Dashboard
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
