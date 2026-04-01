import { useState } from "react";

export type LogType = "info" | "success" | "error" | "warn";
export type LogLine = { type: LogType; text: string };

type UseBackendToolOptions = {
  endpoint: string;
  onSuccessMessage?: (count?: string) => string;
  defaultErrorMessage?: string;
  downloadFilename: string;
};

export function useBackendTool({
  endpoint,
  onSuccessMessage,
  defaultErrorMessage = "Lỗi từ server.",
  downloadFilename,
}: UseBackendToolOptions) {
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<LogLine[]>([]);

  const addLog = (type: LogType, text: string) => {
    setLogs((prev) => [...prev, { type, text }]);
  };

  const clearLogs = () => setLogs([]);

  const execute = async (
    formData: FormData,
    startMessage: string,
    onBeforeStart?: () => boolean,
    customFilename?: string
  ) => {
    if (onBeforeStart && !onBeforeStart()) {
      return;
    }

    const finalFilename = customFilename || downloadFilename;
    setLoading(true);
    clearLogs();
    addLog("info", startMessage);

    try {
      const backendBase = import.meta.env.VITE_BACKEND_URL
        ? import.meta.env.VITE_BACKEND_URL.replace(/\/api\/upload$/, "")
        : `http://${window.location.hostname}:8000`;
      const res = await fetch(`${backendBase}${endpoint}`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        let errorData: any = {};
        try {
          errorData = await res.json();
        } catch (_) {
          errorData.error = "Lỗi kết nối server (Hãy đảm bảo backend.py đang chạy).";
        }

        if (errorData.logs) {
          setLogs((prev) => [...prev, ...errorData.logs]);
        }
        addLog("error", errorData.error || defaultErrorMessage);
      } else {
        const count = res.headers.get("x-file-count") || undefined;
        const msg = onSuccessMessage ? onSuccessMessage(count) : "✅ Hoàn tất!";
        addLog("success", msg);

        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        
        // Kiểm tra thực tế kiểu file trả về để tránh đặt tên sai đuôi nếu backend bị lỗi chuyển đổi
        let downloadName = finalFilename;
        if (blob.type === "application/pdf" && !downloadName.toLowerCase().endsWith(".pdf")) {
            downloadName = downloadName.replace(/\.docx$/i, "") + ".pdf";
        } else if (blob.type.includes("wordprocessingml") && downloadName.toLowerCase().endsWith(".pdf")) {
            downloadName = downloadName.replace(/\.pdf$/i, "") + ".docx";
        }

        a.download = downloadName;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (e: any) {
      addLog("error", `Lỗi kết nối tới backend. Vui lòng bật terminal chạy "python backend.py" trước. Chi tiết: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  return { loading, logs, execute, addLog, clearLogs };
}
