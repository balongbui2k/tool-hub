import { useState, useEffect } from "react";
import { Loader2, Zap, ShieldCheck } from "lucide-react";

interface BackendLoaderProps {
  children: React.ReactNode;
}

export function BackendLoader({ children }: BackendLoaderProps) {
  const [isReady, setIsReady] = useState(false);
  const [isWakingUp, setIsWakingUp] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkHealth = async () => {
      const backendBaseUrl = import.meta.env.VITE_BACKEND_URL 
        ? import.meta.env.VITE_BACKEND_URL.replace("/api/upload", "")
        : `http://${window.location.hostname}:8000`;
      
      const healthUrl = `${backendBaseUrl}/health`;

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
            setIsWakingUp(true); // If it takes more than 1s, it's probably waking up
        }, 1000);

        const response = await fetch(healthUrl, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (response.ok) {
          setIsReady(true);
        } else {
          throw new Error("Backend service not responding correctly.");
        }
      } catch (err) {
        console.error("Health check failed, retrying in 3s...", err);
        setIsWakingUp(true);
        // Wait 3 seconds and try again
        setTimeout(checkHealth, 3000);
      }
    };

    checkHealth();
  }, []);

  if (!isReady) {
    return (
      <div className="fixed inset-0 bg-slate-50 flex flex-col items-center justify-center z-[9999]">
        <div className="max-w-md w-full px-6 text-center space-y-8 animate-in fade-in duration-700">
          {/* Logo / Brand Icons */}
          <div className="flex justify-center items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-brand-pgl rounded-2xl flex items-center justify-center shadow-lg shadow-brand-pgl/20">
               <Zap className="w-8 h-8 text-white animate-pulse" />
            </div>
            <div className="w-16 h-16 bg-brand-pge rounded-2xl flex items-center justify-center shadow-lg shadow-brand-pge/20">
               <ShieldCheck className="w-8 h-8 text-white" />
            </div>
          </div>

          <div className="space-y-3">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Phúc Gia Hub đang khởi động...
            </h1>
            <p className="text-slate-500 text-sm leading-relaxed max-w-sm mx-auto">
              Hệ thống đang đánh thức máy chủ Cloud. Quá trình này có thể mất tới 30-60 giây trong lần truy cập đầu tiên.
            </p>
          </div>

          {/* Loading Indicator */}
          <div className="flex flex-col items-center gap-4">
            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden max-w-[200px]">
              <div className="bg-brand-pgl h-full animate-progress-loading shadow-[0_0_10px_rgba(95,186,49,0.5)]" />
            </div>
            <div className="flex items-center gap-2 text-brand-pge font-medium text-xs">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Đang kết nối tới Server...</span>
            </div>
          </div>

          {/* Tips */}
          <div className="pt-8 border-t border-slate-200 flex flex-col gap-2">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Mẹo vặt</span>
            <p className="text-xs text-slate-400 italic">
               "Sử dụng QR Code để chia sẻ tài liệu nội bộ PGL & PGE một cách nhanh chóng và bảo mật nhất."
            </p>
          </div>
        </div>

        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes progress-loading {
            0% { width: 0%; transform: translateX(-100%); }
            50% { width: 40%; transform: translateX(100%); }
            100% { width: 0%; transform: translateX(250%); }
          }
          .animate-progress-loading {
            animation: progress-loading 2s infinite ease-in-out;
          }
        ` }} />
      </div>
    );
  }

  return <>{children}</>;
}
