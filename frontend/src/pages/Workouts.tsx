import { WorkoutPlan } from '../types';
import { ExerciseCard } from '../components/ExerciseCard';
import { Calendar, CheckSquare } from 'lucide-react';
import { addWorkoutToCalendarAndTasks } from '../lib/googleApi';
import { useState } from 'react';

interface WorkoutsProps {
  workoutPlans: WorkoutPlan[];
  selectedPlanId: string;
  setSelectedPlanId: (id: string) => void;
  selectedDayIndex: number;
  setSelectedDayIndex: (idx: number) => void;
  onCompleteExercise: (exerciseName: string) => void;
}

export function Workouts({
  workoutPlans,
  selectedPlanId,
  setSelectedPlanId,
  selectedDayIndex,
  setSelectedDayIndex,
  onCompleteExercise
}: WorkoutsProps) {
  const [isExporting, setIsExporting] = useState(false);
  const currentPlan = workoutPlans.find((wp) => wp.id === selectedPlanId);
  const currentDay = currentPlan?.days[selectedDayIndex];

  const handleExport = async () => {
    if (!currentPlan || !currentDay) return;
    const confirmed = window.confirm(
      `Export "${currentPlan.name} - ${currentDay.dayName}" to your Google Calendar & Tasks?\n\nThis will add an event for today and a task list of the exercises.`
    );
    if (!confirmed) return;

    try {
      setIsExporting(true);
      await addWorkoutToCalendarAndTasks(currentPlan.name, currentDay.dayName, currentDay.exercises);
      alert('Successfully exported to Google Calendar & Google Tasks!');
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Failed to export');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6 bg-white p-2 text-left">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-[#191A23] tracking-tight">
            Workout Regime Splits
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-semibold">
            Track advanced hypertrophic motion sets, progressive workloads, and detailed anatomical instructions.
          </p>
        </div>
        
        {/* Plan Selectors */}
        <div className="flex flex-wrap gap-2">
          {workoutPlans.map((wp) => (
            <button
              key={wp.id}
              id={`btn-regime-select-${wp.id}`}
              onClick={() => {
                setSelectedPlanId(wp.id);
                setSelectedDayIndex(0);
              }}
              className={`px-4 py-2 text-xs font-black rounded-xl border-2 border-[#191A23] transition-all cursor-pointer shadow-[2px_2px_0px_#191A23] active:translate-y-0.5 active:shadow-none ${
                selectedPlanId === wp.id
                  ? 'bg-[#B9FF66] text-[#191A23]'
                  : 'bg-white text-[#191A23] hover:bg-[#F3F3F3]'
              }`}
            >
              {wp.name}
            </button>
          ))}
        </div>
      </div>

      {/* Splits Selection Switcher */}
      <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-thin items-center">
        {currentPlan?.days.map((day, idx) => (
          <button
            key={idx}
            id={`btn-split-day-${idx}`}
            onClick={() => setSelectedDayIndex(idx)}
            className={`px-5 py-3 text-xs font-black rounded-2xl border-2 border-[#191A23] transition-all shrink-0 cursor-pointer shadow-[2px_2px_0px_#191A23] active:translate-y-0.5 active:shadow-none ${
              selectedDayIndex === idx
                ? 'bg-[#B9FF66] text-[#191A23]'
                : 'bg-white text-slate-500 hover:text-[#191A23] hover:bg-slate-50'
            }`}
          >
            {day.dayName}
          </button>
        ))}
        {/* Export Button */}
        <button
          onClick={handleExport}
          disabled={isExporting}
          className="ml-auto flex items-center gap-2 px-4 py-2 text-xs font-black rounded-xl border-2 border-[#191A23] bg-indigo-100 text-indigo-900 transition-all cursor-pointer shadow-[2px_2px_0px_#191A23] hover:bg-indigo-200 active:translate-y-0.5 active:shadow-none shrink-0"
        >
          {isExporting ? (
             <span className="w-4 h-4 border-2 border-indigo-900 border-t-transparent rounded-full animate-spin"></span>
          ) : (
            <>
              <Calendar className="w-4 h-4" />
              <CheckSquare className="w-4 h-4" />
              Calendar & Tasks Sync
            </>
           )}
        </button>
      </div>

      {/* Exercises detailed render list */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {currentPlan?.days[selectedDayIndex]?.exercises.map((ex, i) => (
          <ExerciseCard
            key={i}
            index={i}
            exercise={ex}
            onComplete={onCompleteExercise}
          />
        ))}
      </div>
    </div>
  );
}
