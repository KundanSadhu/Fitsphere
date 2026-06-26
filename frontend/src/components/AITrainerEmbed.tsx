import { useState, useEffect } from 'react';
import { Camera, RefreshCw } from 'lucide-react';

const AI_TRAINER_URL = 'http://127.0.0.1:5000';

export function AITrainerEmbed() {
  const [exercise, setExercise] = useState('squat');
  const [stats, setStats] = useState({ exercise: 'Squat', reps: 0, angle: 0, feedback: 'Stand by...', status: 'Waiting' });
  const [connected, setConnected] = useState(false);
  const [videoKey, setVideoKey] = useState(0);

  const switchExercise = async (ex: string) => {
    setExercise(ex);
    try {
      await fetch(`${AI_TRAINER_URL}/set_exercise`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ exercise: ex }),
      });
    } catch {}
  };

  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch(`${AI_TRAINER_URL}/get_stats`);
        if (res.ok) setConnected(true);
      } catch { setConnected(false); }
    };
    check();
    const ci = setInterval(check, 5000);
    const si = setInterval(async () => {
      try {
        const res = await fetch(`${AI_TRAINER_URL}/get_stats`);
        if (res.ok) { const d = await res.json(); setStats(d); setConnected(true); }
      } catch { setConnected(false); }
    }, 500);
    return () => { clearInterval(ci); clearInterval(si); };
  }, []);

  return (
    <div className="rounded-[24px] bg-white border-2 border-[#191A23] shadow-[4px_4px_0px_#191A23] p-4 md:p-6">
      <div className="flex items-center justify-between gap-4 flex-wrap mb-4">
        <div>
          <h3 className="font-black text-[#191A23] text-base flex items-center gap-2">
            <Camera className="w-5 h-5 text-primary" /> AI Trainer
          </h3>
          <p className="text-xs text-slate-700 font-semibold">Real-time posture correction & rep counting</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {['squat', 'pushup', 'curl'].map(ex => (
            <button key={ex} onClick={() => switchExercise(ex)}
              className={`px-3 py-1.5 rounded-xl font-black text-[10px] uppercase tracking-wider border-2 transition-all ${
                exercise === ex ? 'bg-primary text-white border-primary' : 'bg-white text-slate-600 border-slate-300 hover:border-slate-500'
              }`}
            >{ex === 'squat' ? 'Squat' : ex === 'pushup' ? 'Push-up' : 'Curl'}</button>
          ))}
          <button onClick={() => setVideoKey(k => k + 1)} className="px-3 py-1.5 rounded-xl font-black text-[10px] uppercase border-2 border-slate-300 text-slate-500 hover:bg-slate-50 flex items-center gap-1"><RefreshCw className="w-3 h-3" /></button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2">
          <div className="rounded-xl bg-black overflow-hidden relative aspect-video">
            {connected ? (
              <img key={videoKey} src={`${AI_TRAINER_URL}/video_feed`} alt="AI Trainer"
                className="w-full h-full object-cover" onError={() => setConnected(false)} />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-slate-900">
                <div className="text-center">
                  <Camera className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                  <p className="text-slate-500 font-bold text-xs">AI Trainer Offline</p>
                  <p className="text-slate-600 text-[10px]">Start Python server on port 5000</p>
                </div>
              </div>
            )}
            {connected && (
              <div className="absolute bottom-2 right-2 bg-black/70 text-emerald-400 px-2 py-0.5 rounded-full text-[10px] font-bold border border-emerald-400/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />LIVE
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-wider mb-0.5">Exercise</p>
            <p className="text-lg font-black text-primary">{stats.exercise}</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-wider mb-0.5">Reps</p>
            <p className="text-lg font-black text-[#191A23]">{stats.reps}</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-wider mb-0.5">Angle</p>
            <p className="text-lg font-black text-amber-500">{stats.angle}°</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-wider mb-0.5">Posture</p>
            <p className={`text-sm font-black ${stats.status === 'Correct' ? 'text-green-600' : 'text-red-500'}`}>
              {stats.status === 'Correct' ? 'Good' : 'Fix'}
            </p>
          </div>
          <div className="col-span-2 p-3 rounded-xl border-l-4 border-primary bg-slate-50 border border-slate-200">
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-wider mb-0.5">Feedback</p>
            <p className="text-sm font-bold text-slate-800">{stats.feedback}</p>
          </div>
        </div>
      </div>
    </div>
  );
}