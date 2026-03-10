import { useState } from "react";
import { ToolLayout } from "../../components/ToolLayout";
import { FileUploader } from "../../components/FileUploader";
import { LogViewer } from "../../components/LogViewer";
import { useBackendTool } from "../../hooks/useBackendTool";
import { Scissors, Loader2, CheckCircle2 } from "lucide-react";

export function PgeSplitPdf() {
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [driveLink, setDriveLink] = useState("");

  const { loading, logs, execute, addLog } = useBackendTool({
    endpoint: "/api/split-pdf",
    downloadFilename: "Chung_Chi_PDF.zip",
    onSuccessMessage: (count) => `✅ Xong! Tải ZIP chứa ${count || "?"} file PDF...`,
  });

  const handleRun = async () => {
    if (!excelFile || !pdfFile) {
      addLog("error", "Vui lòng chọn đủ File Excel và File PDF tổng!");
      return;
    }

    const formData = new FormData();
    formData.append("excel", excelFile);
    formData.append("pdf", pdfFile);
    if (driveLink) formData.append("drive_link", driveLink);

    await execute(formData, "✂️ Bắt đầu tách PDF theo danh sách...");
  };

  return (
    <ToolLayout
      title="Tách Trang PDF"
      description="Tự động phân tách PDF chứa nhiều chứng chỉ, trả về file ZIP với tên đặt theo Excel."
    >
      <div className="space-y-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-900">
                1. Excel Danh sách
              </label>
              {!excelFile ? (
                <FileUploader
                  accept=".xlsx,.xls"
                  onFileSelect={setExcelFile}
                  title="Upload Excel"
                  description="Cột 'Họ và tên' để đặt tên"
                />
              ) : (
                <div className="flex items-center justify-between p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="text-emerald-500 w-5 h-5 shrink-0" />
                    <span className="text-sm font-medium text-emerald-900 truncate">
                      {excelFile.name}
                    </span>
                  </div>
                  <button
                    onClick={() => setExcelFile(null)}
                    className="text-sm text-emerald-600 hover:text-emerald-800 font-bold shrink-0"
                  >
                    Thay đổi
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-900">
                2. PDF Tổng
              </label>
              {!pdfFile ? (
                <FileUploader
                  accept=".pdf"
                  onFileSelect={setPdfFile}
                  title="Upload PDF Tổng"
                  description="Mỗi trang là 1 chứng chỉ"
                />
              ) : (
                <div className="flex items-center justify-between p-4 bg-red-50 border border-red-100 rounded-xl">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="text-red-500 w-5 h-5 shrink-0" />
                    <span className="text-sm font-medium text-red-900 truncate">
                      {pdfFile.name}
                    </span>
                  </div>
                  <button
                    onClick={() => setPdfFile(null)}
                    className="text-sm text-red-600 hover:text-red-800 font-bold shrink-0"
                  >
                    Thay đổi
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="mb-8">
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              3. Google Drive (Tùy chọn ghi chú)
            </label>
            <input
              type="text"
              value={driveLink}
              onChange={(e) => setDriveLink(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow text-slate-700"
              placeholder="https://drive.google.com/..."
            />
          </div>

          <button
            onClick={handleRun}
            disabled={loading || !excelFile || !pdfFile}
            className="w-full px-6 py-4 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 active:scale-[0.99] transition-all flex items-center justify-center gap-2 font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Scissors className="w-6 h-6" />}
            {loading ? "Đang xử lý tách PDF..." : "Tách PDF & Tải ZIP"}
          </button>
        </div>

        <LogViewer logs={logs} />
      </div>
    </ToolLayout>
  );
}
