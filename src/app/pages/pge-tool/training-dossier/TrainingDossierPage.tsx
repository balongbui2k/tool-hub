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

  const addLog = (type: LogLine["type"], text: string) => {
    setLogs((prev) => [...prev, { type, text }]);
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
            { label: "Chứng chỉ tổng", done: false },
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

        {/* ── Step 3: Continue to Cert Suite ── */}
        {hasExported && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-200 p-8 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-300">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-3">
              <Award className="w-5 h-5 text-amber-600" />
              Bước 3: Xuất chứng chỉ tổng
            </h2>
            <p className="text-sm text-gray-600 mb-5 leading-relaxed">
              Hồ sơ đào tạo đã được tạo xong. Tiếp tục sang trang <strong>"Xuất Chứng Chỉ Tổng"</strong> để
              tạo file chứng chỉ Word/PDF cho từng học viên.
              <br />
              <span className="text-gray-500 mt-1 inline-block">
                Tại trang tiếp theo: upload file <code className="bg-gray-200 px-1 rounded text-xs">.xlsx</code> vừa xuất
                + chọn biểu mẫu chứng chỉ Word <code className="bg-gray-200 px-1 rounded text-xs">.docx</code>
              </span>
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => navigate("/pge/cert-suite")}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-amber-600 text-white rounded-xl hover:bg-amber-700 active:scale-[0.99] transition-all font-bold shadow-sm hover:shadow-md cursor-pointer"
              >
                <Award className="w-5 h-5" />
                Tiếp tục xuất chứng chỉ tổng
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-start gap-3 p-3 bg-white/60 rounded-lg border border-amber-100">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-gray-800">File Excel vừa xuất</p>
                  <p className="text-xs text-gray-500">
                    Chứa danh sách học viên (cột Họ tên, Khóa học, Ngày...)
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-white/60 rounded-lg border border-amber-100">
                <FileText className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-gray-800">Biểu mẫu chứng chỉ Word</p>
                  <p className="text-xs text-gray-500">
                    File mẫu .docx có các biến {"{{Họ_và_tên}}"}, {"{{Khóa_học}}"}...
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Log Viewer ── */}
        <LogViewer logs={logs} />
      </div>
    </ToolLayout>
  );
}
