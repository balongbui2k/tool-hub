import { useState, useRef } from "react";
import { ToolLayout } from "../../components/ToolLayout";
import {
  QrCode,
  Upload,
  Link as LinkIcon,
  User,
  Download,
  FileText,
  Globe,
  Youtube,
  Smartphone,
  Mail,
  MapPin,
  Trash2,
  Loader2
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

const logo = "/logo-PGL.png";

export function QrGenerator() {
  const [activeTab, setActiveTab] = useState<"link" | "file" | "profile">("link");
  const [link, setLink] = useState("");
  const [profile, setProfile] = useState({
    name: "",
    phone: "",
    email: "",
    website: "",
    address: ""
  });
  const [file, setFile] = useState<File | null>(null);
  const [qrValue, setQrValue] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

  const generateLinkQr = () => {
    if (!link) return;
    setQrValue(link.startsWith("http") ? link : `https://${link}`);
  };

  const generateProfileQr = () => {
    const vcard = `BEGIN:VCARD
VERSION:3.0
FN:${profile.name}
TEL:${profile.phone}
EMAIL:${profile.email}
URL:${profile.website}
ADR:${profile.address}
END:VCARD`;
    setQrValue(vcard);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      setQrValue(""); // clear previous
    }
  };

  const submitFileForQr = async () => {
    if (!file) return;
    setIsUploading(true);
    setQrValue("");
    try {
      const formData = new FormData();
      formData.append("file", file);

      // Use environment variable for backend URL, fallback to current window host for dev
      const backendUrl = import.meta.env.VITE_BACKEND_URL || `http://${window.location.hostname}:8000/api/upload`;
      const res = await fetch(backendUrl, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Server response was not ok");

      const data = await res.json();
      if (data.url) {
        setQrValue(data.url);
      } else {
        throw new Error(data.detail || "Không nhận được URL từ server");
      }
    } catch (err) {
      console.error(err);
      alert("❌ Không thể kết nối đến máy chủ. Vui lòng đảm bảo backend đang chạy ở port 8000 (Chạy lệnh `python backend.py` ở terminal).");
    } finally {
      setIsUploading(false);
    }
  };

  const downloadQr = async () => {
    if (!qrValue) return;

    const qrSize = 500;
    const padding = 20;
    const fullSize = qrSize + padding * 2;

    const qrSvg = qrRef.current?.querySelector("svg");
    if (!qrSvg) return;

    // Create a Blob from the SVG
    const svgData = new XMLSerializer().serializeToString(qrSvg);
    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);

    try {
      const canvas = document.createElement("canvas");
      canvas.width = fullSize;
      canvas.height = fullSize;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Fill white background for padding
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, fullSize, fullSize);

      // Load QR Code Image from SVG Blob
      const qrImg = new Image();
      await new Promise((resolve, reject) => {
        qrImg.onload = resolve;
        qrImg.onerror = reject;
        qrImg.src = url;
      });

      // Draw QR Code onto canvas
      ctx.drawImage(qrImg, padding, padding, qrSize, qrSize);
      URL.revokeObjectURL(url); // Clean up

      // Load Logo Image
      const logoImg = new Image();
      logoImg.crossOrigin = "Anonymous";
      await new Promise((resolve, reject) => {
        logoImg.onload = resolve;
        logoImg.onerror = reject;
        logoImg.src = logo;
      });

      // Kích thước khung chứa logo = 20% mã QR (để khớp với preview w-10/200px)
      const logoFull = qrSize * 0.20;
      // Kích thước hình ảnh logo bên trong = 12% mã QR
      const logoSize = qrSize * 0.12;
      const x = padding + (qrSize - logoFull) / 2;
      const y = padding + (qrSize - logoFull) / 2;

      // Đổ bóng (shadow)
      ctx.shadowColor = "rgba(0,0,0,0.15)";
      ctx.shadowBlur = 10;
      ctx.shadowOffsetY = 4;
      ctx.fillStyle = "white";
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(x, y, logoFull, logoFull, 16);
      } else {
        ctx.rect(x, y, logoFull, logoFull);
      }
      ctx.fill();

      // Reset shadow để không áp dụng lên các phần sau
      ctx.shadowColor = "transparent";
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;

      // Vẽ viền nhạt
      ctx.strokeStyle = "#f1f5f9"; // màu slate-100
      ctx.lineWidth = 2;
      ctx.stroke();

      // Vẽ logo vào chính giữa khung
      const imgX = x + (logoFull - logoSize) / 2;
      const imgY = y + (logoFull - logoSize) / 2;
      ctx.drawImage(logoImg, imgX, imgY, logoSize, logoSize);

      // Export Canvas to PNG
      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = `PGL_QR_${Date.now()}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    } catch (err) {
      console.error("Lỗi khi tải mã QR:", err);
      alert("Có lỗi xảy ra khi tạo file ảnh. Vui lòng thử lại.");
    }
  };

  return (
    <ToolLayout
      title="QR Code Generator"
      description="Tạo mã QR chuyên nghiệp cho liên kết, tài liệu và thông tin cá nhân"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Tabs */}
          <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm">
            <button
              onClick={() => setActiveTab("link")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === "link"
                ? "bg-slate-900 text-white shadow-md"
                : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                }`}
            >
              <LinkIcon className="w-4 h-4" /> Link & Website
            </button>
            <button
              onClick={() => setActiveTab("file")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === "file"
                ? "bg-slate-900 text-white shadow-md"
                : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                }`}
            >
              <Upload className="w-4 h-4" /> Tài liệu (Excel/Word)
            </button>
            <button
              onClick={() => setActiveTab("profile")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === "profile"
                ? "bg-slate-900 text-white shadow-md"
                : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                }`}
            >
              <User className="w-4 h-4" /> Cá nhân (vCard)
            </button>
          </div>

          {/* Form Content */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
            {activeTab === "link" && (
              <div className="space-y-4">
                <label className="block text-sm font-bold text-slate-700">Liên kết URL</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Globe className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                    placeholder="https://youtube.com/c/phucgia..."
                    className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setLink("https://www.youtube.com")}
                    className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-bold flex items-center gap-1.5 hover:bg-red-100 transition-colors"
                  >
                    <Youtube className="w-3.5 h-3.5" /> Youtube
                  </button>
                  <button
                    onClick={() => setLink("https://www.facebook.com")}
                    className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold flex items-center gap-1.5 hover:bg-blue-100 transition-colors"
                  >
                    <Smartphone className="w-3.5 h-3.5" /> Facebook
                  </button>
                </div>
                <button
                  onClick={generateLinkQr}
                  className="w-full mt-4 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
                >
                  Tạo mã QR
                </button>
              </div>
            )}

            {activeTab === "file" && (
              <div className="space-y-6">
                {!file ? (
                  <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl p-12 hover:bg-slate-50 hover:border-slate-300 transition-all cursor-pointer group">
                    <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Upload className="w-8 h-8 text-blue-600" />
                    </div>
                    <span className="text-lg font-bold text-slate-900">Tải lên tài liệu</span>
                    <span className="text-sm text-slate-500 mt-1">Excel, Word, PowerPoint, PDF (.max 10MB)</span>
                    <input type="file" className="hidden" onChange={handleFileUpload} accept=".doc,.docx,.xls,.xlsx,.ppt,.pptx,.pdf" />
                  </label>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                      <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm border border-slate-100">
                        <FileText className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-900 truncate">{file.name}</p>
                        <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB</p>
                      </div>
                      <button onClick={() => setFile(null)} className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg transition-colors">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                    <p className="text-xs text-orange-600 font-medium px-2 italic">
                      * Tài liệu sẽ được lưu trữ an toàn và tạo mã QR để truy cập nhanh.
                    </p>
                    <button
                      onClick={submitFileForQr}
                      disabled={isUploading}
                      className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Đang tải lên báo cáo...
                        </>
                      ) : (
                        "Xác nhận & Tạo mã"
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === "profile" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5" /> Họ và tên
                    </label>
                    <input
                      type="text"
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      placeholder="Nguyễn Văn A"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5">
                      <Smartphone className="w-3.5 h-3.5" /> Số điện thoại
                    </label>
                    <input
                      type="text"
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      placeholder="0987xxx..."
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5" /> Email cá nhân
                  </label>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    placeholder="example@gmail.com"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" /> Địa chỉ công tác
                  </label>
                  <input
                    type="text"
                    value={profile.address}
                    onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                    placeholder="Tầng X, Toà nhà Y..."
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  />
                </div>

                <button
                  onClick={generateProfileQr}
                  className="w-full mt-4 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg"
                >
                  Tạo mã Danh thiếp
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Preview */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm sticky top-24">
            <h3 className="text-lg font-bold text-slate-900 mb-6 text-center">Xem trước mã QR</h3>

            <div className="flex flex-col items-center">
              <div
                ref={qrRef}
                className="p-6 bg-white rounded-2xl border-4 border-slate-50 shadow-inner flex items-center justify-center mb-6 relative"
              >
                {qrValue ? (
                  <div className="relative">
                    <QRCodeSVG
                      value={qrValue}
                      size={200}
                      level="H"
                      includeMargin={false}
                      imageSettings={{
                        src: logo,
                        x: undefined,
                        y: undefined,
                        height: 40,
                        width: 40,
                        excavate: true,
                      }}
                    />
                  </div>
                ) : (
                  <div className="w-[200px] h-[200px] bg-slate-50 rounded-lg flex flex-col items-center justify-center text-slate-400 gap-3">
                    <QrCode className="w-12 h-12 opacity-20" />
                    <p className="text-xs font-medium px-6 text-center">Vui lòng nhập thông tin để tạo mã QR</p>
                  </div>
                )}
              </div>

              {qrValue && (
                <div className="w-full space-y-3">
                  <button
                    onClick={downloadQr}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-md"
                  >
                    <Download className="w-4 h-4" /> Tải mã QR (.png)
                  </button>
                  <p className="text-[10px] text-slate-400 text-center uppercase tracking-widest font-bold">
                    Phúc Gia Hub Premium Tool
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-brand-pge/5 rounded-2xl p-6 border border-brand-pge/10">
            <h4 className="text-sm font-bold text-brand-pge mb-2">Mẹo nhỏ & Debug</h4>
            <ul className="text-xs text-slate-600 space-y-3 leading-relaxed">
              <li className="flex gap-2">
                <div className="w-1.5 h-1.5 bg-brand-pge rounded-full mt-1.5 flex-shrink-0" />
                <span>
                  <strong>Để quét bằng điện thoại:</strong> Bạn phải truy cập Web này bằng địa chỉ IP (ví dụ: http://192.168.x.x:5173) thay vì localhost.
                </span>
              </li>
              <li className="flex gap-2">
                <div className="w-1.5 h-1.5 bg-brand-pge rounded-full mt-1.5 flex-shrink-0" />
                <span>QR Code cho danh thiếp (vCard) có thể tự động lưu vào danh bạ điện thoại khi quét.</span>
              </li>
              {qrValue && (
                <li className="p-2 bg-white rounded border border-slate-200 break-all font-mono text-[10px]">
                  <span className="font-bold text-brand-pge">URL Mã hoá:</span> {qrValue}
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
