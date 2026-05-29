import { useState } from 'react';
import { ChatInterface } from '../components/ChatInterface';
import { ChamberTelemetry } from '../components/ChamberTelemetry';
import { Layout } from 'lucide-react';

export function AICoach() {
  const [showTelemetry, setShowTelemetry] = useState(true);

  return (
    <div className="bg-white space-y-6 py-2 pb-12 text-left" id="ai-coach-page-root">
      {/* Visual Title Header with accurate alignments and pairings */}
      <div className="border-b border-slate-100 pb-5 flex flex-col md:flex-row md:items-start md:justify-between gap-4" id="ai-coach-header-block">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-black text-[#191A23] tracking-tight leading-tight">
            AI Coach Chamber
          </h1>
          <p className="text-xs md:text-sm text-slate-500 font-semibold max-w-2xl leading-relaxed">
            Converse in secure, ultra-low-latency channels directly with <span className="text-indigo-600 font-extrabold">Coach Sphere</span>. Query physical range models, biomechanical motions, macros, or custom splits instantly.
          </p>
        </div>
        <button
          onClick={() => setShowTelemetry(!showTelemetry)}
          className="shrink-0 group flex items-center gap-2 px-3.5 py-2 text-xs font-black text-[#191A23] bg-[#B9FF66] border-2 border-[#191A23] rounded-xl hover:bg-opacity-95 shadow-[2px_2px_0px_#191A23] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
          title={showTelemetry ? "Hide telemetry side logs" : "Show telemetry side logs"}
        >
          <Layout className="w-4 h-4 shrink-0 transition-transform group-hover:rotate-12" />
          <span>{showTelemetry ? "Hide Engine Logs" : "Show Engine Logs"}</span>
        </button>
      </div>

      {/* Main Dual Grid Layout - Adaptive columns based on telemetry state */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start" id="ai-coach-grid">
        {/* Chat System interface wrapper - spans full 4 columns when telemetry sidebar is hidden */}
        <div className={showTelemetry ? "lg:col-span-3" : "lg:col-span-4"} id="ai-coach-chat-column">
          <ChatInterface />
        </div>

        {/* Real-time telemetry logs sidebar - hidden when state is false */}
        {showTelemetry && (
          <div className="lg:col-span-1 animate-slide-up" id="ai-coach-telemetry-column">
            <ChamberTelemetry onClose={() => setShowTelemetry(false)} />
          </div>
        )}
      </div>
    </div>
  );
}
