import { AlertCircle } from "lucide-react";
import type { LogLine } from "../hooks/useBackendTool";

interface LogViewerProps {
  logs: LogLine[];
}

export function LogViewer({ logs }: LogViewerProps) {
  if (logs.length === 0) return null;

  return (
    <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-inner mt-6">
      <h3 className="text-slate-300 text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
        <AlertCircle className="w-4 h-4" /> Nhật ký hoạt động
      </h3>
      <div className="space-y-2 h-48 overflow-y-auto font-mono text-sm pr-2 scrollbar-thin scrollbar-thumb-slate-700">
        {logs.map((log, i) => (
          <div
            key={i}
            className={`flex items-start gap-2 ${
              log.type === "error"
                ? "text-red-400"
                : log.type === "success"
                ? "text-emerald-400"
                : log.type === "warn"
                ? "text-amber-400"
                : "text-slate-300"
            }`}
          >
            <span className="opacity-50 shrink-0">
              [{new Date().toLocaleTimeString()}]
            </span>
            <span className="break-words font-medium">{log.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
