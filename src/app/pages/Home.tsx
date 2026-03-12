import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { ToolCard } from "../components/ToolCard";
import {
  Sparkles,
  Microscope,
  ClipboardCheck,
  BarChart3,
  Award,
  Scissors,
  RefreshCw,
  QrCode,
  Wrench,
  FileSearch,
  Image as ImageIcon,
  Type,
  PenTool
} from "lucide-react";
import { useState } from "react";

const pglTools = [
  {
    title: "Phân tích mẫu",
    description: "Quản lý kết quả phân tích phòng thí nghiệm, kiểm định an toàn",
    icon: Microscope,
    href: "/#",
    color: "bg-brand-pgl",
  },
  {
    title: "Chứng nhận",
    description: "Xuất giấy chứng nhận thử nghiệm và công bố hợp quy",
    icon: ClipboardCheck,
    href: "/#",
    color: "bg-brand-pgl",
  },
  {
    title: "Báo cáo thống kê",
    description: "Tổng hợp dữ liệu, báo cáo kết quả định kỳ chuyên sâu",
    icon: BarChart3,
    href: "/#",
    color: "bg-brand-pgl",
  },
];

const pgeTools = [
  {
    title: "Xuất Chứng Chỉ Tổng",
    description: "Tạo file Word chứng chỉ hàng loạt từ danh sách Excel mẫu",
    icon: Award,
    href: "/pge/cert-suite",
    color: "bg-brand-pge",
  },
  {
    title: "Tách PDF",
    description: "Tự động phân tách và tách chứng chỉ PDF lẻ theo tên học viên",
    icon: Scissors,
    href: "/pge/split-pdf",
    color: "bg-brand-pge",
  },
  {
    title: "Đổi Tên Hàng Loạt",
    description: "Scan hàng loạt file PDF và đặt tên tự động theo danh sách",
    icon: RefreshCw,
    href: "/pge/rename",
    color: "bg-brand-pge",
  },
  {
    title: "QR Code Generator",
    description: "Tạo mã QR cho tài liệu Excel/Word, website và danh thiếp",
    icon: QrCode,
    href: "/pge/qr-generator",
    color: "bg-brand-pge",
  },
];

const otherTools = [
  {
    title: "Nén & Ghép PDF",
    description: "Tốc độ cao, giữ nguyên chất lượng hồ sơ quan trọng",
    icon: FileSearch,
    href: "/other/pdf-compress",
    color: "bg-slate-700",
  },
  {
    title: "Xử lý hình ảnh",
    description: "Xoá nền, nén ảnh, resize kích thước chuẩn",
    icon: ImageIcon,
    href: "/other/image-resize",
    color: "bg-slate-700",
  },
  {
    title: "Tiện ích văn bản",
    description: "Đổi font, đếm chữ, tóm tắt nội dung AI",
    icon: Type,
    href: "/other/text-counter",
    color: "bg-slate-700",
  },
  {
    title: "Ký Tên PDF",
    description: "Tạo chữ ký, thêm ngày tháng và đóng dấu văn bản trực tiếp trên PDF",
    icon: PenTool,
    href: "/other/pdf-signer",
    color: "bg-slate-700",
  },
];

export function Home() {
  const [isDisableFuction] = useState(true);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-indigo-50 via-white to-white py-20 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 rounded-full bg-indigo-100 text-indigo-700 text-sm font-semibold border border-indigo-200 shadow-sm transition-all hover:bg-indigo-200">
            <Sparkles className="w-4 h-4 text-indigo-500" />
            <span className="tracking-wide">Hệ thống công cụ nội bộ thông minh</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 mb-6 tracking-tight leading-tight">
            Phúc Gia <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-pge to-brand-pgl">Hub</span>
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto font-medium leading-relaxed">
            Không gian làm việc số tập trung chuyên nghiệp cho <span className="font-bold text-brand-pgl">PGL</span> và <span className="font-bold text-brand-pge">PGE</span>. Trải nghiệm giải pháp lưu trữ và quản lý chứng chỉ tốc độ cao.
          </p>
        </div>
      </section>

      {/* Tools Sections */}
      <main className="max-w-7xl mx-auto px-6 py-16 flex-1">

        {/* PGL */}
        <section className="mb-20" aria-labelledby="pgl-heading">
          <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4 border-b border-slate-200 pb-4">
            <div>
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-brand-pgl/10 rounded-xl shadow-sm border border-brand-pgl/20">
                  <Microscope className="w-6 h-6 text-brand-pgl" />
                </div>
                <div>
                  <h2 id="pgl-heading" className="text-3xl font-bold text-slate-900 tracking-tight">PGL</h2>
                  <p className="text-sm font-semibold text-brand-pgl uppercase tracking-widest mt-1">Công ty Cổ phần Phòng thử nghiệm</p>
                </div>
              </div>
            </div>
            <p className="text-slate-500 text-right text-sm font-medium w-full sm:w-auto">Quản lý mẫu phân tích hiệu suất cao</p>
          </div>
          {isDisableFuction ? (
            <div className="w-full"><p className="text-center text-slate-800">Các công cụ đang trong quá trình phát triển!</p></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {pglTools.map((tool) => (
                <ToolCard key={tool.title} {...tool} />
              ))}
            </div>
          )}
        </section>

        {/* PGE */}
        <section className="mb-16" aria-labelledby="pge-heading">
          <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4 border-b border-slate-200 pb-4">
            <div>
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-brand-pge/10 rounded-xl shadow-sm border border-brand-pge/20">
                  <Award className="w-6 h-6 text-brand-pge" />
                </div>
                <div>
                  <h2 id="pge-heading" className="text-3xl font-bold text-slate-900 tracking-tight">PGE</h2>
                  <p className="text-sm font-semibold text-brand-pge uppercase tracking-widest mt-1">Công ty Cổ phần Giáo dục</p>
                </div>
              </div>
            </div>
            <p className="text-slate-500 text-right text-sm font-medium w-full sm:w-auto">Quản lý và xuất chứng chỉ hàng loạt</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {pgeTools.map((tool) => (
              <ToolCard key={tool.title} {...tool} />
            ))}
          </div>
        </section>

        {/* Other Tools */}
        <section className="mb-20" aria-labelledby="other-heading">
          <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4 border-b border-slate-200 pb-4">
            <div>
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-slate-900/10 rounded-xl shadow-sm border border-slate-900/20">
                  <Wrench className="w-6 h-6 text-slate-900" />
                </div>
                <div>
                  <h2 id="other-heading" className="text-3xl font-bold text-slate-900 tracking-tight">Công cụ đa năng</h2>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest mt-1">Xử lý tài liệu & media nhanh gọn</p>
                </div>
              </div>
            </div>
            <p className="text-slate-500 text-right text-sm font-medium w-full sm:w-auto">Tiện ích hỗ trợ văn phòng hàng ngày</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {otherTools.map((tool) => (
              <ToolCard key={tool.title} {...tool} />
            ))}
          </div>
        </section>

        {/* Info Cards */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
          <article className="bg-white rounded-3xl p-10 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-2xl font-bold text-slate-900 mb-3">Hệ thống bảo mật cao</h3>
            <p className="text-slate-600 leading-relaxed mb-6">Dữ liệu thử nghiệm và chứng chỉ chứng nhận được mã hóa, chỉ xử lý tạm thời trên trình duyệt hoặc server nội bộ.</p>
            <div className="flex items-center gap-4 text-sm font-bold text-slate-800">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-brand-pgl" /> API nội bộ</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-brand-pgl" /> Không lưu file</span>
            </div>
          </article>

          <article className="bg-slate-900 rounded-3xl p-10 border border-slate-800 shadow-lg relative overflow-hidden text-white">
            <div className="relative z-10">
              <h3 className="text-2xl font-bold mb-3">Trải nghiệm vượt trội</h3>
              <p className="text-slate-300 leading-relaxed mb-6">Mọi thao tác đều thiết kế tối giản, loại bỏ hoàn toàn các bước thừa cho hiệu suất nhanh nhất.</p>
              <button className="px-6 py-2.5 bg-white text-slate-900 rounded-xl font-bold text-sm tracking-wide hover:bg-slate-100 transition-colors shadow-sm focus:ring-4 focus:ring-white/20">
                Tìm hiểu thêm
              </button>
            </div>
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Sparkles className="w-32 h-32" />
            </div>
          </article>
        </section>

      </main>

      <Footer />
    </div>
  );
}

function CheckCircle2(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <path d="m9 11 3 3L22 4" />
    </svg>
  );
}
