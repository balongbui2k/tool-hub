import { useState } from "react";
import { ToolLayout } from "../../../components/ToolLayout";
import { FileUploader } from "../../../components/FileUploader";
import { LogViewer } from "../../../components/LogViewer";
import { useBackendTool } from "../../../hooks/useBackendTool";
import { RefreshCw, Loader2, CheckCircle2, Download } from "lucide-react";

export function PgeRename() {
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [driveLink, setDriveLink] = useState("");

  const { loading, logs, execute, addLog } = useBackendTool({
    endpoint: "/api/rename",
    downloadFilename: "Chung_Chi_DaDoiTen.zip",
    onSuccessMessage: (count) => `✅ Xong! Đã đổi tên ${count || "?"} file PDF.`,
  });

  const handleRun = async () => {
    if (!excelFile || !zipFile) {
      addLog("error", "Vui lòng chọn đủ File Excel và File ZIP!");
      return;
    }

    const formData = new FormData();
    formData.append("excel", excelFile);
    formData.append("zip", zipFile);
    if (driveLink) formData.append("drive_link", driveLink);

    await execute(formData, "🏷️ Bắt đầu quét ZIP, kiểm tra và đổi tên...");
  };

  return (
    <ToolLayout
      title="Đổi Tên Hàng Loạt"
      description="Biến thư mục ZIP chứa PDF đánh số (file-1.pdf, file-2.pdf) thành tên học viên tự động (Nguyen_Van_A.pdf)"
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
                  description={
                    <div className="flex flex-col items-center gap-2">
                      <span>Cột 'Họ và tên' để đặt tên</span>
                      <a 
                        href="/samples/Danh_Sach_Tham_Gia-Mau.xlsx" 
                        download 
                        className="text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-1 bg-emerald-50 px-3 py-1 rounded-full text-xs"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Download className="w-3 h-3" /> Tải file mẫu
                      </a>
                    </div>
                  }
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
                2. File ZIP chứa PDF (Cũ)
              </label>
              {!zipFile ? (
                <FileUploader
                  accept=".zip"
                  onFileSelect={setZipFile}
                  title="Upload ZIP"
                  description="Nén tất cả các file cần đổi tên"
                />
              ) : (
                <div className="flex items-center justify-between p-4 bg-purple-50 border border-purple-100 rounded-xl">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="text-purple-500 w-5 h-5 shrink-0" />
                    <span className="text-sm font-medium text-purple-900 truncate">
                      {zipFile.name}
                    </span>
                  </div>
                  <button
                    onClick={() => setZipFile(null)}
                    className="text-sm text-purple-600 hover:text-purple-800 font-bold shrink-0"
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
            disabled={loading || !excelFile || !zipFile}
            className="w-full px-6 py-4 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 active:scale-[0.99] transition-all flex items-center justify-center gap-2 font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <RefreshCw className="w-6 h-6" />}
            {loading ? "Đang xử lý đổi tên..." : "Đổi Tên & Tải ZIP Mới"}
          </button>
        </div>

        <LogViewer logs={logs} />
      </div>
    </ToolLayout>
  );
}
