import React from 'react';
import { CheckCircle2, Clock, ArrowRight } from 'lucide-react';

const STEPS = [
  'Order Received',
  'Planning',
  'Designing',
  'Development',
  'Review',
  'Completed',
  'Delivered'
];

export default function OrderTimeline({ currentStatus, onStatusChange, isUpdating }) {
  const currentStepIndex = STEPS.indexOf(currentStatus);

  return (
    <div className="w-full py-4">
      <div className="flex items-center justify-between relative">
        {/* Progress Connecting Line */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-800 rounded-full z-0" />
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-gradient-to-r from-indigo-500 via-violet-500 to-emerald-400 rounded-full z-0 transition-all duration-500"
          style={{
            width: `${(Math.max(0, currentStepIndex) / (STEPS.length - 1)) * 100}%`
          }}
        />

        {/* Step Nodes */}
        {STEPS.map((step, idx) => {
          const isCompleted = idx <= currentStepIndex;
          const isCurrent = idx === currentStepIndex;

          return (
            <div key={step} className="relative z-10 flex flex-col items-center group">
              <button
                disabled={isUpdating}
                onClick={() => onStatusChange(step)}
                title={`Change status to: ${step}`}
                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 ${
                  isCurrent
                    ? 'bg-indigo-600 text-white ring-4 ring-indigo-500/30 scale-110 shadow-lg shadow-indigo-500/50'
                    : isCompleted
                    ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                    : 'bg-slate-900 border border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-200'
                }`}
              >
                {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
              </button>

              <span
                className={`text-[11px] font-semibold mt-2 text-center transition-colors ${
                  isCurrent
                    ? 'text-indigo-400'
                    : isCompleted
                    ? 'text-slate-200'
                    : 'text-slate-500'
                }`}
              >
                {step}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
