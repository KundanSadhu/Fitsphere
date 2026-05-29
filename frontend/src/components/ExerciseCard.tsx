import React, { useState, useEffect } from 'react';
import { Play, Check, Clock, Eye, EyeOff, ShieldAlert } from 'lucide-react';
import { ExerciseVideo } from './ExerciseVideo';
import { Exercise } from '../types';

interface ExerciseCardProps {
  exercise: Exercise;
  onComplete?: (exerciseName: string) => void;
  index: number;
  key?: any;
}

export const ExerciseCard = ({ exercise, onComplete, index }: ExerciseCardProps) => {
  const [showVideo, setShowVideo] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [setsCompleted, setSetsCompleted] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [restTime, setRestTime] = useState(exercise.restSeconds);

  const handleSetComplete = () => {
    const next = setsCompleted + 1;
    setSetsCompleted(next);
    if (next >= exercise.sets) {
      setCompleted(true);
      onComplete?.(exercise.name);
    } else {
      startRest();
    }
  };

  const startRest = () => {
    setIsResting(true);
    setRestTime(exercise.restSeconds);
  };

  useEffect(() => {
    let timerId: NodeJS.Timeout;
    if (isResting) {
      timerId = setInterval(() => {
        setRestTime((prev) => {
          if (prev <= 1) {
            clearInterval(timerId);
            setIsResting(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerId) clearInterval(timerId);
    };
  }, [isResting]);

  const progressPct = (setsCompleted / exercise.sets) * 100;

  return (
    <div className={`p-5 rounded-[24px] border-2 border-[#191A23] shadow-[4px_4px_0px_#191A23] transition-all duration-300 text-left ${
      completed ? 'bg-[#B9FF66]' : 'bg-white'
    }`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className={`w-8 h-8 rounded-lg font-mono flex items-center justify-center text-xs font-black border-2 border-[#191A23] ${
              completed ? 'bg-[#191A23] text-[#B9FF66]' : 'bg-[#F3F3F3] text-[#191A23]'
            }`}>
              {index + 1}
            </span>
            <h3 className="font-black text-[#191A23] leading-tight text-base">{exercise.name}</h3>
            {completed && <Check className="w-5 h-5 text-[#191A23] stroke-[3px]" />}
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs font-black text-[#191A23] mt-2">
            <span className="bg-white border border-[#191A23] px-2 py-0.5 rounded-md shadow-[1px_1px_0px_#191A23]">{exercise.sets} Sets</span>
            <span className="bg-white border border-[#191A23] px-2 py-0.5 rounded-md shadow-[1px_1px_0px_#191A23]">{exercise.reps} Reps</span>
            <span className="flex items-center gap-1 bg-white border border-[#191A23] px-2 py-0.5 rounded-md shadow-[1px_1px_0px_#191A23]">
              <Clock className="w-3.5 h-3.5" /> {exercise.restSeconds}s Rest
            </span>
            <span className="text-[10px] bg-[#191A23] text-white px-2 py-0.5 rounded-md uppercase tracking-wider">
              {exercise.muscleGroup}
            </span>
          </div>
          {exercise.notes && (
            <p className="text-xs text-[#191A23] mt-3 font-semibold italic border-l-2 pl-2 border-[#191A23]/50">
              💡 {exercise.notes}
            </p>
          )}

          {showVideo && (
            <div className="mt-4 space-y-3">
              {exercise.steps && exercise.steps.length > 0 && (
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <h4 className="font-black text-xs uppercase mb-2 tracking-wider text-[#191A23]">Steps</h4>
                  <ol className="list-decimal list-inside text-xs font-medium space-y-1 text-slate-700">
                    {exercise.steps.map((step, i) => <li key={i}>{step}</li>)}
                  </ol>
                </div>
              )}
              {exercise.tips && exercise.tips.length > 0 && (
                <div className="bg-blue-50 p-3 rounded-xl border border-blue-100">
                  <h4 className="font-black text-xs uppercase mb-2 tracking-wider text-blue-900 border-b border-blue-900 pb-1">Tips & Form Tricks</h4>
                  <ul className="list-disc list-inside text-xs font-medium space-y-1 text-blue-800">
                    {exercise.tips.map((tip, i) => <li key={i}>{tip}</li>)}
                  </ul>
                </div>
              )}
              {exercise.precautions && exercise.precautions.length > 0 && (
                <div className="bg-red-50 p-3 rounded-xl border border-red-100">
                  <h4 className="font-black text-xs uppercase mb-2 tracking-wider text-red-900 flex items-center gap-1 border-b border-red-900 pb-1">
                    <ShieldAlert className="w-3.5 h-3.5" /> Precautions
                  </h4>
                  <ul className="list-disc list-inside text-xs font-medium space-y-1 text-red-800">
                    {exercise.precautions.map((precaution, i) => <li key={i}>{precaution}</li>)}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        <button
          onClick={() => setShowVideo(!showVideo)}
          className={`flex-shrink-0 w-10 h-10 rounded-xl border-2 border-[#191A23] flex items-center justify-center transition-all cursor-pointer shadow-[2px_2px_0px_#191A23] active:translate-y-0.5 active:shadow-none ${
            showVideo
              ? 'bg-[#191A23] text-white'
              : 'bg-white text-[#191A23] hover:bg-[#F3F3F3]'
          }`}
          title={showVideo ? 'Hide video demo' : 'Watch video demo'}
        >
          {showVideo ? <EyeOff className="w-4 h-4" /> : <Play className="w-4 h-4 fill-[#191A23]" />}
        </button>
      </div>

      {/* Video Iframe View */}
      {showVideo && exercise.videoUrl && (
        <div className="mt-4 rounded-xl overflow-hidden border-2 border-[#191A23] shadow-inner">
          <ExerciseVideo url={exercise.videoUrl} title={exercise.name} />
        </div>
      )}

      {/* Progress slider bar & actions */}
      <div className="mt-5 pt-4 border-t-2 border-[#191A23]/20 flex items-center justify-between gap-4">
        <div className="flex-1">
          <div className="flex justify-between items-center mb-1 text-[10px] font-black text-[#191A23] tracking-wider font-mono">
            <span>SET TRAINING PROGRESS</span>
            <span>{setsCompleted} / {exercise.sets}</span>
          </div>
          <div className="w-full h-3 rounded-full bg-white border-2 border-[#191A23] overflow-hidden relative">
            <div
              className={`h-full border-r-2 border-[#191A23] transition-all duration-300 ${completed ? 'bg-white' : 'bg-[#B9FF66]'}`}
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {!completed && (
          <button
            onClick={handleSetComplete}
            disabled={isResting}
            className={`px-4 py-2.5 rounded-xl text-xs font-black shadow-[2.5px_2.5px_0px_#191A23] active:translate-y-0.5 active:shadow-none transition-all flex items-center gap-1.5 cursor-pointer border-2 border-[#191A23] ${
              isResting
                ? 'bg-amber-400 text-[#191A23] animate-pulse font-mono'
                : 'bg-[#B9FF66] text-[#191A23] hover:bg-[#a5e65a]'
            }`}
          >
            {isResting ? (
              <>
                <Clock className="w-4 h-4 animate-spin" />
                <span>Rest: {restTime}s</span>
              </>
            ) : (
              <span>Complete Set {setsCompleted + 1}</span>
            )}
          </button>
        )}
      </div>
    </div>
  );
};
