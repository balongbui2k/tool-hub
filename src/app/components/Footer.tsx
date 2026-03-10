import { Link } from "react-router";
import { Microscope, Award } from "lucide-react";

const logo = "/logo-PGL.png";

export function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 mt-24 text-sm font-medium">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-20 h-20 flex items-center justify-center">
                <img src={logo} alt="Phúc Gia Logo" className="w-full h-full object-contain" />
              </div>
              <span className="font-bold text-xl text-[#5FBA31]">Phúc Gia Hub</span>
            </div>
            <p className="text-slate-500 leading-relaxed max-w-sm mb-6">
              Hệ thống công cụ quản trị thông minh, tăng cường hiệu năng và tự động hóa quy trình cho đội ngũ nội bộ.
            </p>
            <div className="flex gap-4">
              {/* Placeholders for social icons */}
              <div className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 cursor-pointer">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>
              </div>
              <div className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 cursor-pointer">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-[#5FBA31] mb-5 flex items-center gap-2"><Microscope className="w-4 h-4 text-[#5FBA31]" /> PGL</h3>
            <ul className="space-y-3">
              <li><Link to="/#" className="text-slate-500 hover:text-[#5FBA31] transition-colors">Kiểm nghiệm sản phẩm</Link></li>
              <li><Link to="/#" className="text-slate-500 hover:text-[#5FBA31] transition-colors">Công bộ chất lượng</Link></li>
              <li><Link to="/#" className="text-slate-500 hover:text-[#5FBA31] transition-colors">Đo lường an toàn</Link></li>
              <li><Link to="/#" className="text-slate-500 hover:text-[#5FBA31] transition-colors">Báo cáo Môi trường</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-blue-600 mb-5 flex items-center gap-2"><Award className="w-4 h-4 text-blue-600" /> PGE</h3>
            <ul className="space-y-3">
              <li><Link to="/pge/cert-suite" className="text-slate-500 hover:text-blue-600 transition-colors">Xuất Chứng Chỉ Tổng</Link></li>
              <li><Link to="/pge/split-pdf" className="text-slate-500 hover:text-blue-600 transition-colors">Tách riêng trang PDF</Link></li>
              <li><Link to="/pge/rename" className="text-slate-500 hover:text-blue-600 transition-colors">Đổi tên PDF hàng loạt</Link></li>
              <li><Link to="/#" className="text-slate-500 hover:text-blue-600 transition-colors">Quản lý đào tạo</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-200 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-slate-400 font-medium">
            © 2026 Phúc Gia. All rights reserved.
          </p>
          <div className="flex gap-6 text-slate-400">
            <Link to="#" className="hover:text-slate-600">Privacy Policy</Link>
            <Link to="#" className="hover:text-slate-600">Terms of Service</Link>
            <Link to="#" className="hover:text-slate-600">IT Support</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
