import { useState } from "react";
import { ToolLayout } from "../../../components/ToolLayout";
import { FileUploader } from "../../../components/FileUploader";
import { LogViewer } from "../../../components/LogViewer";
import { useBackendTool } from "../../../hooks/useBackendTool";
import { Award, Loader2, CheckCircle2, Download } from "lucide-react";

export function PgeCertSuite() {
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [docxFile, setDocxFile] = useState<File | null>(null);
  const [outputName, setOutputName] = useState("Tong_Hop_Chung_Chi.docx");

  const { loading, logs, execute, addLog } = useBackendTool({
    endpoint: "/api/cert-suite",
    downloadFilename: outputName,
    onSuccessMessage: () => "✅ Xong! Quá trình tạo chứng chỉ tông hoàn tất, đang tải file về...",
    defaultErrorMessage: "Lỗi server backend (cần chạy python backend.py)",
  });

  const handleRun = async () => {
    if (!excelFile || !docxFile) {
      addLog("error", "Vui lòng chọn đủ File Excel và Mẫu Word!");
      return;
    }

    const formData = new FormData();
    formData.append("excel", excelFile);
    formData.append("docx", docxFile);
    formData.append("output_name", outputName);

    await execute(formData, "📚 Đang đọc dữ liệu từ Excel...");
  };

  return (
    <ToolLayout
      title="Xuất Chứng Chỉ Tổng"
      description="Điền dữ liệu từ danh sách Excel vào biểu mẫu cấp chứng chỉ Word"
    >
      <div className="space-y-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm transition-all">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Box Upload 1 */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-900">
                1. Danh sách Excel
              </label>
              {!excelFile ? (
                <FileUploader
                  accept=".xlsx,.xls"
                  onFileSelect={setExcelFile}
                  title="Upload Excel"
                  description={
                    <div className="flex flex-col items-center gap-2">
                      <span>Cột cần có: Họ và tên, Khóa học...</span>
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
                <div className="flex items-center justify-between p-4 bg-emerald-50 border border-emerald-100 rounded-xl transition-all">
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

            {/* Box Upload 2 */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-900">
                2. Biểu mẫu Word (DOCX)
              </label>
              {!docxFile ? (
                <FileUploader
                  accept=".docx"
                  onFileSelect={setDocxFile}
                  title="Upload Word"
                  description={
                    <div className="flex flex-col items-center gap-2">
                      <span>Các biến: {"{{Họ_và_tên}}"}...</span>
                      <a 
                        href="/samples/PGE-Mau_Giay-Mau.docx" 
                        download 
                        className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1 bg-blue-50 px-3 py-1 rounded-full text-xs"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Download className="w-3 h-3" /> Tải file mẫu
                      </a>
                    </div>
                  }
                />
              ) : (
                <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-100 rounded-xl transition-all">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="text-blue-500 w-5 h-5 shrink-0" />
                    <span className="text-sm font-medium text-blue-900 truncate">
                      {docxFile.name}
                    </span>
                  </div>
                  <button
                    onClick={() => setDocxFile(null)}
                    className="text-sm text-blue-600 hover:text-blue-800 font-bold shrink-0"
                  >
                    Thay đổi
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="mb-8">
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              3. Tên file kết quả tải về
            </label>
            <input
              type="text"
              value={outputName}
              onChange={(e) => setOutputName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm transition-all text-slate-700"
              placeholder="Tong_Hop_Chung_Chi.docx"
            />
          </div>

          <button
            onClick={handleRun}
            disabled={loading || !excelFile || !docxFile}
            className="w-full px-6 py-4 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 active:scale-[0.99] transition-all flex items-center justify-center gap-2 font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
          >
            {loading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <Award className="w-6 h-6" />
            )}
            {loading ? "Đang xử lý xuất chứng chỉ..." : "Chạy Xuất Chứng Chỉ"}
          </button>
        </div>

        <LogViewer logs={logs} />
      </div>
    </ToolLayout>
  );
}
