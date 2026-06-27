import { useState, useCallback } from "react";
import { ToolLayout } from "../../../components/ToolLayout";
import { FileUploader } from "../../../components/FileUploader";
import { LogViewer } from "../../../components/LogViewer";
import {
  FolderOpen,
  Loader2,
  CheckCircle2,
  Download,
  Users,
  Calendar,
  GraduationCap,
  ArrowRight,
  FileSpreadsheet,
  FileText,
  PackageCheck,
  Award,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import { useNavigate } from "react-router";

type LogLine = { type: "info" | "success" | "error" | "warn"; text: string };

interface Course {
  ten_lop: string;
  ngay_bd: string;
  ngay_kt: string;
  giang_vien: string;
  count: number;
}

export function TrainingDossier() {
  const navigate = useNavigate();
  const [excelFile, setExcelFile] = useState<File | null>(null);

  // Step 1: Scan courses
  const [courses, setCourses] = useState<Course[]>([]);
  const [scanning, setScanning] = useState(false);
  const [scanned, setScanned] = useState(false);

  // Step 2: Export
  const [exportingCourse, setExportingCourse] = useState<string | null>(null);
  const [exportedCourses, setExportedCourses] = useState<Set<string>>(new Set());
  const [logs, setLogs] = useState<LogLine[]>([]);

  // Step 3: Certificate export
  const [certDocxFile, setCertDocxFile] = useState<File | null>(null);
  const [certOutputFormat, setCertOutputFormat] = useState<"docx" | "pdf">("docx");
  const [certLoading, setCertLoading] = useState(false);
  const [certLogs, setCertLogs] = useState<LogLine[]>([]);
  const [certExported, setCertExported] = useState(false);

  const addLog = (type: LogLine["type"], text: string) => {
    setLogs((prev) => [...prev, { type, text }]);
  };

  const addCertLog = (type: LogLine["type"], text: string) => {
    setCertLogs((prev) => [...prev, { type, text }]);
  };

  const backendBase =
    (import.meta.env.VITE_BACKEND_URL || "").replace(/\/api\/upload$/, "") ||
    `http://${window.location.hostname}:8000`;

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      return `${parts[2].padStart(2, "0")}/${parts[1].padStart(2, "0")}/${parts[0]}`;
    }
    return dateStr;
  };

  // ── Step 1: Scan courses from Excel ──
  const handleScanCourses = useCallback(async () => {
    if (!excelFile) return;

    setScanning(true);
    setCourses([]);
    setScanned(false);
    setLogs([]);
    addLog("info", "📚 Đang quét danh sách khóa học từ Excel...");

    try {
      const formData = new FormData();
      formData.append("excel", excelFile);

      const res = await fetch(`${backendBase}/api/training-dossier/courses`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        addLog("error", err.detail || "Lỗi khi quét file Excel.");
        return;
      }

      const data: Course[] = await res.json();
      setCourses(data);
      setScanned(true);
      addLog(
        "success",
        `✅ Tìm thấy ${data.length} khóa học, tổng cộng ${data.reduce((a, c) => a + c.count, 0)} học viên.`
      );
    } catch (e: any) {
      addLog(
        "error",
        `Lỗi kết nối backend. Hãy chạy "python backend.py" trước. Chi tiết: ${e.message}`
      );
    } finally {
      setScanning(false);
    }
  }, [excelFile, backendBase]);

  // ── Step 2: Export dossier for a course ──
  const handleExportCourse = useCallback(
    async (course: Course) => {
      if (!excelFile) return;

      const courseKey = `${course.ten_lop}-${course.ngay_bd}`;
      setExportingCourse(courseKey);
      setLogs([]);
      addLog("info", `📋 Đang xuất hồ sơ: ${course.ten_lop}...`);

      try {
        // Fetch template files from /samples/
        addLog("info", "📥 Đang tải file mẫu...");
        const [xlsxRes, docxRes] = await Promise.all([
          fetch("/samples/yyyy.mm.dd-Ten_Khoa_Hoc.xlsx"),
          fetch("/samples/yyyy.mm.dd-PGE-TT11-BM03-Ten_Khoa_Hoc.docx"),
        ]);

        if (!xlsxRes.ok || !docxRes.ok) {
          addLog("error", "Không tìm thấy file mẫu trong /samples/. Hãy kiểm tra thư mục public/samples/.");
          return;
        }

        const xlsxBlob = await xlsxRes.blob();
        const docxBlob = await docxRes.blob();

        const formData = new FormData();
        formData.append("excel", excelFile);
        formData.append(
          "template_xlsx",
          new File([xlsxBlob], "template.xlsx", {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          })
        );
        formData.append(
          "template_docx",
          new File([docxBlob], "template.docx", {
            type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          })
        );
        formData.append("course_json", JSON.stringify(course));

        addLog("info", "⚙️ Đang xử lý tạo hồ sơ...");

        const res = await fetch(`${backendBase}/api/training-dossier/export`, {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          let errorData: any = {};
          try {
            errorData = await res.json();
          } catch {
            errorData.error = "Lỗi server.";
          }
          if (errorData.logs) {
            setLogs((prev) => [...prev, ...errorData.logs]);
          }
          addLog("error", errorData.error || "Lỗi khi xuất hồ sơ.");
          return;
        }

        addLog("success", "✅ Hoàn tất! Đang tải file ZIP về...");

        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;

        // Extract filename from Content-Disposition or build one
        const disposition = res.headers.get("Content-Disposition");
        let filename = "Ho_So_Dao_Tao.zip";
        if (disposition) {
          const match = disposition.match(/filename="?(.+?)"?$/);
          if (match) filename = match[1];
        }
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);

        setExportedCourses((prev) => new Set(prev).add(courseKey));
      } catch (e: any) {
        addLog(
          "error",
          `Lỗi kết nối backend: ${e.message}`
        );
      } finally {
        setExportingCourse(null);
      }
    },
    [excelFile, backendBase]
  );

  // ── Step 3: Export certificates directly ──
  const handleExportCerts = useCallback(async () => {
    if (!excelFile) return;

    setCertLoading(true);
    setCertLogs([]);
    addCertLog("info", "📚 Đang chuẩn bị xuất chứng chỉ tổng...");

    try {
      // Get the Word template - either user-uploaded or default
      let docxBlob: Blob;
      if (certDocxFile) {
        docxBlob = certDocxFile;
        addCertLog("info", `📄 Sử dụng biểu mẫu: ${certDocxFile.name}`);
      } else {
        addCertLog("info", "📥 Đang tải biểu mẫu chứng chỉ mặc định...");
        const docxRes = await fetch("/samples/PGE-Mau_Giay-Mau.docx");
        if (!docxRes.ok) {
          addCertLog("error", "Không tìm thấy file mẫu PGE-Mau_Giay-Mau.docx trong /samples/.");
          return;
        }
        docxBlob = await docxRes.blob();
      }

      const baseName = excelFile.name.replace(/\.[^/.]+$/, "");
      const outputName = `${baseName}.${certOutputFormat}`;

      const formData = new FormData();
      formData.append("excel", excelFile);
      formData.append(
        "docx",
        new File([docxBlob], "template.docx", {
          type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        })
      );
      formData.append("output_name", outputName);
      formData.append("output_format", certOutputFormat);

      addCertLog("info", "⚙️ Đang tạo chứng chỉ cho tất cả học viên...");

      const res = await fetch(`${backendBase}/api/cert-suite`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        let errorData: any = {};
        try {
          errorData = await res.json();
        } catch {
          errorData.error = "Lỗi server.";
        }
        if (errorData.logs) {
          setCertLogs((prev) => [...prev, ...errorData.logs]);
        }
        addCertLog("error", errorData.error || "Lỗi khi xuất chứng chỉ.");
        return;
      }

      addCertLog("success", "✅ Xong! Đang tải file chứng chỉ tổng về...");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;

      // Determine correct filename based on actual response type
      let downloadName = outputName;
      const disposition = res.headers.get("Content-Disposition");
      if (disposition) {
        const match = disposition.match(/filename="?(.+?)"?$/);
        if (match) downloadName = match[1];
      }

      if (blob.type === "application/pdf" && !downloadName.toLowerCase().endsWith(".pdf")) {
        downloadName = downloadName.replace(/\.docx$/i, "") + ".pdf";
      } else if (blob.type.includes("wordprocessingml") && downloadName.toLowerCase().endsWith(".pdf")) {
        downloadName = downloadName.replace(/\.pdf$/i, "") + ".docx";
      }

      a.download = downloadName;
      a.click();
      URL.revokeObjectURL(url);
      setCertExported(true);
    } catch (e: any) {
      addCertLog("error", `Lỗi kết nối backend: ${e.message}`);
    } finally {
      setCertLoading(false);
    }
  }, [excelFile, certDocxFile, certOutputFormat, backendBase]);

  const totalParticipants = courses.reduce((a, c) => a + c.count, 0);
  const hasExported = exportedCourses.size > 0;

  return (
    <ToolLayout
      title="Tạo Hồ Sơ Đào Tạo"
      description="Quét danh sách học viên → Xuất hồ sơ BM03 + Danh sách điểm danh → Xuất chứng chỉ tổng"
    >
      <div className="space-y-6">
        {/* ── Step Indicator ── */}
        <div className="flex items-center justify-center gap-2 mb-2">
          {[
            { label: "Upload Excel", done: !!excelFile },
            { label: "Chọn & Xuất", done: hasExported },
            { label: "Chứng chỉ tổng", done: certExported },
          ].map((step, i) => (
            <div key={i} className="flex items-center gap-2">
              <div
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                  step.done
                    ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                    : i === 0 && !excelFile
                    ? "bg-indigo-100 text-indigo-700 border border-indigo-200 shadow-sm"
                    : i === 1 && excelFile && !hasExported
                    ? "bg-indigo-100 text-indigo-700 border border-indigo-200 shadow-sm"
                    : i === 2 && hasExported
                    ? "bg-indigo-100 text-indigo-700 border border-indigo-200 shadow-sm"
                    : "bg-gray-100 text-gray-400 border border-gray-200"
                }`}
              >
                {step.done ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <span className="w-5 h-5 rounded-full bg-current/10 flex items-center justify-center text-xs font-bold">
                    {i + 1}
                  </span>
                )}
                {step.label}
              </div>
              {i < 2 && <ChevronRight className="w-4 h-4 text-gray-300" />}
            </div>
          ))}
        </div>

        {/* ── Step 1: Upload Excel ── */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
            Bước 1: Upload danh sách học viên
          </h2>

          {!excelFile ? (
            <FileUploader
              accept=".xlsx,.xls"
              onFileSelect={(file) => {
                setExcelFile(file);
                setCourses([]);
                setScanned(false);
                setExportedCourses(new Set());
                setCertExported(false);
                setCertLogs([]);
              }}
              title="Upload file Danh Sách Tham Gia"
              description={
                <div className="flex flex-col items-center gap-2">
                  <span>File Danh_Sach_Tham_Gia-Mau.xlsx</span>
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
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
                <div className="flex items-center gap-3 min-w-0">
                  <CheckCircle2 className="text-emerald-500 w-5 h-5 shrink-0" />
                  <span className="text-sm font-medium text-emerald-900 truncate">
                    {excelFile.name}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setExcelFile(null);
                    setCourses([]);
                    setScanned(false);
                    setExportedCourses(new Set());
                    setCertExported(false);
                    setCertLogs([]);
                  }}
                  className="text-sm text-emerald-600 hover:text-emerald-800 font-bold shrink-0 cursor-pointer"
                >
                  Thay đổi
                </button>
              </div>

              <button
                onClick={handleScanCourses}
                disabled={scanning}
                className="w-full px-6 py-3.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 active:scale-[0.99] transition-all flex items-center justify-center gap-2 font-bold disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
              >
                {scanning ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <RefreshCw className="w-5 h-5" />
                )}
                {scanning ? "Đang quét..." : scanned ? "Quét lại" : "Quét danh sách khóa học"}
              </button>
            </div>
          )}
        </div>

        {/* ── Step 2: Course List & Export ── */}
        {scanned && (
          <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <FolderOpen className="w-5 h-5 text-blue-600" />
                Bước 2: Chọn khóa học để xuất hồ sơ
              </h2>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <GraduationCap className="w-4 h-4" /> {courses.length} khóa
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" /> {totalParticipants} học viên
                </span>
              </div>
            </div>

            {courses.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                Không tìm thấy khóa học nào trong file Excel.
              </div>
            ) : (
              <div className="space-y-3">
                {courses.map((course) => {
                  const key = `${course.ten_lop}-${course.ngay_bd}`;
                  const isExporting = exportingCourse === key;
                  const isExported = exportedCourses.has(key);

                  return (
                    <div
                      key={key}
                      className={`group flex items-center justify-between p-5 rounded-xl border transition-all ${
                        isExported
                          ? "bg-emerald-50 border-emerald-200"
                          : "bg-gray-50 border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/50"
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-semibold text-gray-900 truncate">
                          {course.ten_lop}
                        </h3>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {formatDate(course.ngay_bd)}
                            {course.ngay_kt && ` — ${formatDate(course.ngay_kt)}`}
                          </span>
                          <span className="flex items-center gap-1">
                            <GraduationCap className="w-3.5 h-3.5" />
                            GV: {course.giang_vien}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 ml-4 shrink-0">
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700 border border-indigo-200">
                          {course.count} HV
                        </span>

                        <button
                          onClick={() => handleExportCourse(course)}
                          disabled={isExporting}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer ${
                            isExported
                              ? "bg-emerald-600 text-white hover:bg-emerald-700"
                              : "bg-indigo-600 text-white hover:bg-indigo-700"
                          } disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md active:scale-95`}
                        >
                          {isExporting ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : isExported ? (
                            <CheckCircle2 className="w-4 h-4" />
                          ) : (
                            <PackageCheck className="w-4 h-4" />
                          )}
                          {isExporting
                            ? "Đang xuất..."
                            : isExported
                            ? "Xuất lại"
                            : "Xuất hồ sơ"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── Step 3: Export Certificates (Integrated) ── */}
        {hasExported && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-200 p-8 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-300">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-3">
              <Award className="w-5 h-5 text-amber-600" />
              Bước 3: Xuất chứng chỉ tổng
            </h2>
            <p className="text-sm text-gray-600 mb-5 leading-relaxed">
              Tự động sử dụng file <strong>{excelFile?.name}</strong> đã upload ở Bước 1 để xuất chứng chỉ.
              Chứng chỉ sẽ chứa <strong>đầy đủ tất cả học viên</strong> (không tách theo đơn vị).
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Word template selection */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-800">
                  Biểu mẫu chứng chỉ Word
                </label>
                {!certDocxFile ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 p-3 bg-white/70 border border-amber-200 rounded-xl">
                      <FileText className="w-5 h-5 text-blue-500 shrink-0" />
                      <span className="text-sm text-gray-700 flex-1">
                        Mặc định: <strong>PGE-Mau_Giay-Mau.docx</strong>
                      </span>
                    </div>
                    <label className="flex items-center gap-2 text-xs text-amber-700 hover:text-amber-900 cursor-pointer font-semibold">
                      <input
                        type="file"
                        accept=".docx"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files?.[0]) setCertDocxFile(e.target.files[0]);
                        }}
                      />
                      <FileText className="w-3.5 h-3.5" />
                      Hoặc chọn biểu mẫu khác...
                    </label>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-xl">
                    <div className="flex items-center gap-2 min-w-0">
                      <CheckCircle2 className="text-blue-500 w-4 h-4 shrink-0" />
                      <span className="text-sm font-medium text-blue-900 truncate">
                        {certDocxFile.name}
                      </span>
                    </div>
                    <button
                      onClick={() => setCertDocxFile(null)}
                      className="text-xs text-blue-600 hover:text-blue-800 font-bold shrink-0 cursor-pointer"
                    >
                      Dùng mặc định
                    </button>
                  </div>
                )}
              </div>

              {/* Output format */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-800">
                  Định dạng đầu ra
                </label>
                <div className="flex bg-white/70 p-1 rounded-xl w-full border border-amber-200">
                  <button
                    onClick={() => setCertOutputFormat("docx")}
                    className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all cursor-pointer ${
                      certOutputFormat === "docx"
                        ? "bg-white text-amber-700 shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Word (.docx)
                  </button>
                  <button
                    onClick={() => setCertOutputFormat("pdf")}
                    className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all cursor-pointer ${
                      certOutputFormat === "pdf"
                        ? "bg-white text-blue-600 shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    PDF (.pdf)
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={handleExportCerts}
              disabled={certLoading}
              className={`w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-bold text-lg transition-all shadow-sm hover:shadow-md active:scale-[0.99] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                certExported
                  ? "bg-emerald-600 text-white hover:bg-emerald-700"
                  : "bg-amber-600 text-white hover:bg-amber-700"
              }`}
            >
              {certLoading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : certExported ? (
                <CheckCircle2 className="w-6 h-6" />
              ) : (
                <Award className="w-6 h-6" />
              )}
              {certLoading
                ? "Đang xuất chứng chỉ..."
                : certExported
                ? "Xuất lại chứng chỉ tổng"
                : "Xuất chứng chỉ tổng"}
            </button>

            {/* Link to full cert-suite page for advanced options */}
            <div className="mt-4 flex items-center justify-center">
              <button
                onClick={() => navigate("/pge/cert-suite")}
                className="text-sm text-amber-700 hover:text-amber-900 font-semibold flex items-center gap-1 cursor-pointer"
              >
                Hoặc mở trang Xuất Chứng Chỉ để tùy chỉnh thêm
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Cert Logs */}
            {certLogs.length > 0 && (
              <div className="mt-4">
                <LogViewer logs={certLogs} />
              </div>
            )}
          </div>
        )}

        {/* ── Log Viewer (Step 2) ── */}
        <LogViewer logs={logs} />
      </div>
    </ToolLayout>
  );
}
