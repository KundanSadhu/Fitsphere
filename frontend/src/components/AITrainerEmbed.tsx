import { useState, useEffect, useCallback } from 'react';
import { Camera, RefreshCw, Wifi, WifiOff, Dumbbell, Activity, Target, ChevronDown } from 'lucide-react';

const AI_TRAINER_URL = 'http://127.0.0.1:5000';

const DEMO_DATA = {
  squat: {
    exercise: 'Squat',
    reps: 12,
    angle: 85,
    feedback: 'Great depth! Drive through heels on the way up.',
    status: 'Correct',
  },
  pushup: {
    exercise: 'Push-Up',
    reps: 8,
    angle: 78,
    feedback: 'Keep elbows at 45 degrees to your torso.',
    status: 'Correct',
  },
  curl: {
    exercise: 'Bicep Curl',
    reps: 10,
    angle: 35,
    feedback: 'Control the negative — don\'t let gravity do the work.',
    status: 'Correct',
  },
};

const EXERCISE_ICONS = {
  squat: '🦵',
  pushup: '💪',
  curl: '🏋️',
};

export function AITrainerEmbed() {
  const [exercise, setExercise] = useState('squat');
  const [stats, setStats] = useState({
    exercise: 'Squat', reps: 0, angle: 0,
    feedback: 'Connect to AI Trainer server to begin.',
    status: 'Waiting',
  });
  const [connected, setConnected] = useState<boolean | null>(null);
  const [videoKey, setVideoKey] = useState(0);
  const [demoMode, setDemoMode] = useState(false);
  const [expanded, setExpanded] = useState(true);

  const switchExercise = useCallback(async (ex: string) => {
    setExercise(ex);
    if (demoMode) return;
    try {
      await fetch(`${AI_TRAINER_URL}/set_exercise`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ exercise: ex }),
      });
    } catch {}
  }, [demoMode]);

  const animateDemo = useCallback(() => {
    const data = DEMO_DATA[exercise as keyof typeof DEMO_DATA];
    if (!data) return;
    const angleOsc = Math.sin(Date.now() / 400) * 20 + 85;
    const repPhase = Math.sin(Date.now() / 1200);
    setStats({
      ...data,
      angle: Math.round(angleOsc),
      reps: data.reps + (repPhase > 0.8 ? 1 : 0),
    });
  }, [exercise]);

  useEffect(() => {
    if (!demoMode) {
      const check = async () => {
        try {
          const res = await fetch(`${AI_TRAINER_URL}/health`, { signal: AbortSignal.timeout(2000) });
          if (res.ok) {
            setConnected(true);
            setDemoMode(false);
          } else {
            setConnected(false);
            setDemoMode(true);
          }
        } catch {
          setConnected(false);
          setDemoMode(true);
        }
      };
      check();
    }
  }, [demoMode]);

  useEffect(() => {
    if (demoMode) {
      const si = setInterval(animateDemo, 200);
      return () => clearInterval(si);
    }
  }, [demoMode, animateDemo]);

  useEffect(() => {
    if (connected && !demoMode) {
      const si = setInterval(async () => {
        try {
          const res = await fetch(`${AI_TRAINER_URL}/get_stats`);
          if (res.ok) {
            const d = await res.json();
            setStats(d);
            setConnected(true);
          }
        } catch {
          setConnected(false);
          setDemoMode(true);
        }
      }, 500);
      return () => clearInterval(si);
    }
  }, [connected, demoMode]);

  return (
    <div className="rounded-[24px] bg-white border-2 border-[#191A23] shadow-[4px_4px_0px_#191A23] overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between gap-4 p-4 md:p-5 hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            connected ? 'bg-primary/10' : demoMode ? 'bg-amber-50' : 'bg-slate-100'
          }`}>
            <Camera className={`w-5 h-5 ${connected ? 'text-primary' : demoMode ? 'text-amber-500' : 'text-slate-400'}`} />
          </div>
          <div className="text-left">
            <h3 className="font-black text-[#191A23] text-sm flex items-center gap-2">
              AI Trainer
              {connected === true && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-50 text-green-700 text-[9px] font-bold border border-green-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />LIVE
                </span>
              )}
              {connected === false && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[9px] font-bold border border-slate-200">
                  <WifiOff className="w-2.5 h-2.5" />OFFLINE
                </span>
              )}
              {demoMode && connected !== true && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 text-[9px] font-bold border border-amber-200">
                  <Activity className="w-2.5 h-2.5" />DEMO
                </span>
              )}
            </h3>
            <p className="text-[10px] text-slate-500 font-semibold">
              {connected ? 'Real-time pose tracking active' : demoMode ? 'Preview mode — connect server for live tracking' : 'Server not detected'}
            </p>
          </div>
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </button>

      {expanded && (
        <div className="px-4 md:px-5 pb-4 md:pb-5 space-y-4">
          <div className="flex gap-2 flex-wrap">
            {Object.entries(EXERCISE_ICONS).map(([key, icon]) => (
              <button
                key={key}
                onClick={() => switchExercise(key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-black text-[10px] uppercase tracking-wider border-2 transition-all ${
                  exercise === key
                    ? 'bg-primary text-white border-primary shadow-[2px_2px_0px_#191A23]'
                    : 'bg-white text-slate-600 border-slate-300 hover:border-slate-500'
                }`}
              >
                <span className="text-xs">{icon}</span>
                {key === 'squat' ? 'Squat' : key === 'pushup' ? 'Push-Up' : 'Curl'}
              </button>
            ))}
            {connected && (
              <button
                onClick={() => setVideoKey(k => k + 1)}
                className="px-3 py-1.5 rounded-xl font-black text-[10px] uppercase border-2 border-slate-300 text-slate-500 hover:bg-slate-50 flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <div className="rounded-xl bg-black overflow-hidden relative aspect-video border-2 border-slate-800">
                {connected ? (
                  <img
                    key={videoKey}
                    src={`${AI_TRAINER_URL}/video_feed`}
                    alt="AI Trainer Live Feed"
                    className="w-full h-full object-cover"
                    onError={() => { setConnected(false); setDemoMode(true); }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
                    <div className="text-center px-6">
                      <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center mx-auto mb-4">
                        {demoMode ? (
                          <Activity className="w-7 h-7 text-amber-400" />
                        ) : (
                          <WifiOff className="w-7 h-7 text-slate-600" />
                        )}
                      </div>
                      <p className="text-slate-300 font-bold text-sm mb-1">
                        {demoMode ? 'Demo Mode' : 'AI Trainer Offline'}
                      </p>
                      <p className="text-slate-500 text-[11px] max-w-xs mx-auto leading-relaxed">
                        {demoMode
                          ? 'Live camera feed will appear here when the AI Trainer server is running.'
                          : 'Start the Python server to enable real-time pose tracking.'}
                      </p>
                      {!demoMode && (
                        <div className="mt-4 inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800 border border-slate-700">
                          <code className="text-[10px] text-slate-400">cd ai_trainer && python app.py</code>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {connected && (
                  <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-sm px-2.5 py-1 rounded-full text-[10px] font-bold border border-white/10 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-green-400">LIVE</span>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3 rounded-xl bg-gradient-to-br from-slate-50 to-white border border-slate-200">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Dumbbell className="w-3 h-3 text-primary" />
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Exercise</p>
                </div>
                <p className="text-base font-black text-[#191A23]">{stats.exercise}</p>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-br from-slate-50 to-white border border-slate-200">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Target className="w-3 h-3 text-blue-500" />
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Reps</p>
                </div>
                <p className="text-base font-black text-[#191A23]">{stats.reps}</p>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-br from-slate-50 to-white border border-slate-200">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Activity className="w-3 h-3 text-amber-500" />
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Angle</p>
                </div>
                <p className="text-base font-black text-amber-500">{stats.angle}°</p>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-br from-slate-50 to-white border border-slate-200">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Camera className="w-3 h-3 text-emerald-500" />
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Posture</p>
                </div>
                <p className={`text-sm font-black ${stats.status === 'Correct' ? 'text-emerald-600' : 'text-red-500'}`}>
                  {stats.status === 'Correct' ? '✓ Good' : '✗ Fix'}
                </p>
              </div>
              <div className="col-span-2 p-3 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100">
                <p className="text-[9px] font-black text-blue-400 uppercase tracking-wider mb-1">Coach Feedback</p>
                <p className="text-xs font-bold text-slate-800 leading-relaxed">
                  {stats.feedback}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}