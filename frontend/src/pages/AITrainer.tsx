import { useState, useEffect } from 'react';
import { Camera, Activity, RefreshCw, AlertTriangle } from 'lucide-react';

const AI_TRAINER_URL = 'http://127.0.0.1:5000';

export function AITrainer() {
  const [exercise, setExercise] = useState('squat');
  const [stats, setStats] = useState({ exercise: 'Squat', reps: 0, angle: 0, feedback: 'Stand by...', status: '✅ Waiting' });
  const [connected, setConnected] = useState(false);
  const [videoKey, setVideoKey] = useState(0);

  const switchExercise = async (ex: string) => {
    setExercise(ex);
    try {
      await fetch(`${AI_TRAINER_URL}/set_exercise`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ exercise: ex }),
      });
    } catch {}
  };

  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch(`${AI_TRAINER_URL}/get_stats`);
        if (res.ok) setConnected(true);
      } catch {
        setConnected(false);
      }
    };
    check();
    const checkInterval = setInterval(check, 5000);

    const statsInterval = setInterval(async () => {
      try {
        const res = await fetch(`${AI_TRAINER_URL}/get_stats`);
        if (res.ok) {
          const data = await res.json();
          setStats(data);
          setConnected(true);
        }
      } catch {
        setConnected(false);
      }
    }, 500);

    return () => { clearInterval(checkInterval); clearInterval(statsInterval); };
  }, []);

  const reloadFeed = () => setVideoKey(k => k + 1);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-theme tracking-tight leading-none">AI Trainer</h1>
          <p className="text-xs text-theme-muted mt-1 font-semibold">Real-time posture correction and rep counting</p>
        </div>
        {!connected && (
          <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border-2 border-amber-300 rounded-xl text-amber-700 text-xs font-black">
            <AlertTriangle className="w-4 h-4" />
            <span>AI Trainer server not running — start with: <code className="bg-amber-100 px-1.5 py-0.5 rounded">cd ai_trainer && python app.py</code></span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-4">
          <div className="rounded-[24px] bg-black border-2 border-theme overflow-hidden relative">
            {connected ? (
              <img
                key={videoKey}
                src={`${AI_TRAINER_URL}/video_feed`}
                alt="AI Trainer Feed"
                className="w-full aspect-video object-cover"
                onError={() => setConnected(false)}
              />
            ) : (
              <div className="w-full aspect-video bg-slate-900 flex items-center justify-center">
                <div className="text-center">
                  <Camera className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-500 font-bold text-sm">AI Trainer Offline</p>
                  <p className="text-slate-600 text-xs mt-1">Start the Python server to enable camera</p>
                </div>
              </div>
            )}
            {connected && (
              <div className="absolute bottom-3 right-3 bg-black/70 text-[#00E5FF] px-3 py-1 rounded-full text-xs font-bold border border-[#00E5FF]/30 backdrop-blur-sm flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                LIVE
              </div>
            )}
          </div>

          <div className="flex gap-3 flex-wrap">
            {['squat', 'pushup', 'curl'].map(ex => (
              <button
                key={ex}
                onClick={() => switchExercise(ex)}
                className={`px-6 py-3 rounded-xl font-black text-sm uppercase tracking-wider border-2 transition-all ${
                  exercise === ex
                    ? 'bg-primary text-white border-primary shadow-[3px_3px_0px_var(--color-secondary)]'
                    : 'bg-card text-theme border-theme hover:bg-theme-secondary'
                }`}
              >
                {ex === 'squat' ? '🦵 Squat' : ex === 'pushup' ? '💪 Push-up' : '🏋️ Bicep Curl'}
              </button>
            ))}
            <button
              onClick={reloadFeed}
              className="px-4 py-3 rounded-xl font-black text-xs uppercase tracking-wider border-2 border-theme bg-card text-theme hover:bg-theme-secondary transition-all flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" /> Refresh
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="p-6 rounded-[24px] bg-card border-2 border-theme shadow-brutal">
            <h3 className="font-black text-theme text-sm uppercase tracking-wider mb-4">Live Stats</h3>

            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-theme-secondary border border-theme">
                <p className="text-[10px] font-black text-theme-dim uppercase tracking-widest mb-1">Exercise</p>
                <p className="text-xl font-black text-primary">{stats.exercise}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-xl bg-theme-secondary border border-theme">
                  <p className="text-[10px] font-black text-theme-dim uppercase tracking-widest mb-1">Reps</p>
                  <p className="text-2xl font-black text-theme">{stats.reps}</p>
                </div>
                <div className="p-4 rounded-xl bg-theme-secondary border border-theme">
                  <p className="text-[10px] font-black text-theme-dim uppercase tracking-widest mb-1">Angle</p>
                  <p className="text-2xl font-black text-amber-400">{stats.angle}°</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-theme-secondary border border-theme">
                <p className="text-[10px] font-black text-theme-dim uppercase tracking-widest mb-1">Posture</p>
                <p className={`text-lg font-black ${stats.status.includes('✅') ? 'text-green-500' : 'text-red-500'}`}>
                  {stats.status.includes('✅') ? 'Correct Form' : 'Needs Correction'}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-theme-secondary border-l-4 border-primary">
                <p className="text-[10px] font-black text-theme-dim uppercase tracking-widest mb-1">Feedback</p>
                <p className="text-sm font-bold text-theme">{stats.feedback}</p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-amber-50 border-2 border-amber-200 text-amber-800 text-xs">
            <p className="font-black mb-1">⚠️ Setup Required</p>
            <p className="font-semibold">Install Python deps and run the AI Trainer server:</p>
            <code className="block mt-2 bg-amber-100 p-2 rounded-lg text-[10px] font-mono">
              cd ai_trainer<br />
              pip install flask opencv-python mediapipe numpy<br />
              python app.py
            </code>
          </div>
        </div>
      </div>
    </div>
  );
}