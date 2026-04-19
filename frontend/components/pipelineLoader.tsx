"use client";

import { useEffect, useState } from "react";

const steps = [
  "Uploading CSV files",
  "Merging datasets",
  "Feature Engineering",
  "Applying Risk Rules",
  "Running ML Model",
  "Finalizing Results",
];

export default function PipelineLoader({ onComplete }: { onComplete: () => void }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (current >= steps.length) {
      onComplete();
      return;
    }

    const timer = setTimeout(() => {
      setCurrent((prev) => prev + 1);
    }, 1000); // slightly smoother timing

    return () => clearTimeout(timer);
  }, [current, onComplete]);

  const progress = (current / steps.length) * 100;

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      
      {/* Title */}
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">
        Processing Student Data
      </h2>

      {/* Progress Bar */}
      <div className="w-full max-w-md mb-6">
        <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-right text-xs text-gray-500 mt-1">
          {Math.min(current, steps.length)} / {steps.length}
        </p>
      </div>

      {/* Steps */}
      <div className="space-y-3 w-full max-w-md">
        {steps.map((step, index) => {
          const isDone = index < current;
          const isActive = index === current;

          return (
            <div
              key={index}
              className={`flex items-center gap-3 p-4 rounded-xl border transition-all duration-300 shadow-sm
                ${
                  isDone
                    ? "bg-green-50 border-green-300"
                    : isActive
                    ? "bg-white border-indigo-400 shadow-md scale-[1.02]"
                    : "bg-gray-50 border-gray-200"
                }`}
            >
              {/* Icon */}
              <div className="text-lg">
                {isDone ? "✅" : isActive ? "⏳" : "⬜"}
              </div>

              {/* Text */}
              <div className="flex-1">
                <p
                  className={`text-sm font-medium ${
                    isDone || isActive ? "text-gray-800" : "text-gray-500"
                  }`}
                >
                  {step}
                </p>

                {isActive && (
                  <p className="text-xs text-gray-500 mt-1 animate-pulse">
                    Processing...
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <p className="mt-6 text-sm text-gray-500">
        {current >= steps.length
          ? "Completed successfully ✓"
          : "Please wait while we process your data..."}
      </p>
    </div>
  );
}