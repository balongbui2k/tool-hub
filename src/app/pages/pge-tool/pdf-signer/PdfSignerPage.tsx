import { useState, useRef, useEffect } from "react";
import { ToolLayout } from "../../../components/ToolLayout";
import { FileUploader } from "../../../components/FileUploader";
import { 
  PenTool, Upload, Calendar as CalendarIcon, X, Trash2,
  Hand, Pointer, ZoomIn, ZoomOut, Bold, Italic, Underline, ChevronDown, Eraser,
  Type as LucideType
} from "lucide-react";
import SignatureCanvas from "react-signature-canvas";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import * as pdfjsLib from "pdfjs-dist";
import { toast } from "sonner";
import { PdfPageRender } from "./components/PdfPageRender";

const PDFJS_VERSION = '5.5.207';

interface Signature {
  id: string;
  type: "draw" | "image" | "text" | "date";
  data: string;
  x: number;
  y: number;
  width: number;
  height: number;
  page: number;
  font: string;
  fontSize: number;
  color: string;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  opacity: number;
}

const FONT_OPTIONS = [
  { label: "Helvetica", value: "Helvetica" },
  { label: "Times New Roman", value: "Times-Roman" },
  { label: "Courier", value: "Courier" },
];

export function PgePdfSigner() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [numPages, setNumPages] = useState(0);
  const [signatures, setSignatures] = useState<Signature[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [scale, setScale] = useState(1.2);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<"draw" | "image">("draw");
  const [toolMode, setToolMode] = useState<"hand" | "select">("select");
  const [activePage, setActivePage] = useState(1);
  
  const [globalStyle, setGlobalStyle] = useState({
    font: "Helvetica",
    fontSize: 18,
    color: "#000000",
    bold: false,
    italic: false,
    underline: false
  });

  const sigPad = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${PDFJS_VERSION}/build/pdf.worker.min.mjs`;
    if (pdfFile) {
      const loadPdf = async () => {
        try {
          const arrayBuffer = await pdfFile.arrayBuffer();
          const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer, useSystemFonts: true });
          const pdf = await loadingTask.promise;
          setPdfDoc(pdf);
          setNumPages(pdf.numPages);
        } catch (error: any) {
          toast.error("Lỗi nạp PDF");
        }
      };
      loadPdf();
    }
  }, [pdfFile]);

  useEffect(() => {
    let scrollTimeout: any;
    const handleScroll = () => {
      if (!containerRef.current) return;
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        const pages = containerRef.current?.querySelectorAll('.pdf-page-container');
        if (!pages) return;
        let currentVisiblePage = 1;
        let minDiff = Infinity;
        pages.forEach((page: any) => {
          const rect = page.getBoundingClientRect();
          const diff = Math.abs(rect.top - 150);
          if (diff < minDiff) {
            minDiff = diff;
            currentVisiblePage = parseInt(page.dataset.pagenum);
          }
        });
        if (currentVisiblePage !== activePage) setActivePage(currentVisiblePage);
      }, 50);
    };
    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [activePage]);

  const selectedSig = signatures.find(s => s.id === selectedId);

  useEffect(() => {
    if (selectedSig && (selectedSig.type === 'text' || selectedSig.type === 'date')) {
      setGlobalStyle({
        font: selectedSig.font,
        fontSize: selectedSig.fontSize,
        color: selectedSig.color,
        bold: selectedSig.bold,
        italic: selectedSig.italic,
        underline: selectedSig.underline
      });
    }
  }, [selectedId]);

  const updateSelectedOrGlobal = (key: string, value: any) => {
    setGlobalStyle(prev => ({ ...prev, [key]: value }));
    if (selectedId) {
      setSignatures(prev => prev.map(s => s.id === selectedId ? { ...s, [key]: value } : s));
    }
  };

  const addSignatureToList = (data: string, type: any, w = 200, h = 60) => {
    const newSig: Signature = {
      id: Date.now().toString(),
      type,
      data,
      x: 100,
      y: 100,
      width: w,
      height: h,
      page: activePage,
      fontSize: type === "text" || type === "date" ? globalStyle.fontSize : 100,
      font: globalStyle.font,
      color: globalStyle.color,
      opacity: 1,
      bold: globalStyle.bold,
      italic: globalStyle.italic,
      underline: globalStyle.underline
    };
    setSignatures(prev => [...prev, newSig]);
    setSelectedId(newSig.id);
    setIsModalOpen(false);
    toast.success(`Đã thêm vào trang ${activePage}`);
  };

  const trimCanvas = (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return canvas;
    const { width, height } = canvas;
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    let t: any = null, b: any = null, l: any = null, r: any = null;
    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] > 0) {
        const x = (i / 4) % width, y = Math.floor((i / 4) / width);
        if (t === null || y < t) t = y; if (b === null || y > b) b = y;
        if (l === null || x < l) l = x; if (r === null || x > r) r = x;
      }
    }
    if (t === null) return canvas;
    const tw = r - l + 1, th = b - t + 1;
    const tc = document.createElement('canvas');
    tc.width = tw; tc.height = th;
    tc.getContext('2d')?.putImageData(ctx.getImageData(l, t, tw, th), 0, 0);
    return tc;
  };

  const saveDrawing = () => {
    const pad = sigPad.current;
    if (!pad || pad.isEmpty()) return toast.error("Vui lòng vẽ chữ ký!");
    const tc = trimCanvas(pad.getCanvas());
    addSignatureToList(tc.toDataURL("image/png"), "draw", 150, 150 / (tc.width / tc.height));
    pad.clear();
  };

  const downloadPdf = async () => {
    if (!pdfFile) return;
    try {
      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdfLibDoc = await PDFDocument.load(arrayBuffer);
      for (const sig of signatures) {
        const page = pdfLibDoc.getPage(sig.page - 1);
        const { width, height } = page.getSize();
        const pdfPage = await pdfDoc.getPage(sig.page);
        const viewport = pdfPage.getViewport({ scale: 1 });
        const sX = width / viewport.width, sY = height / viewport.height;
        const pX = (sig.x / scale) * sX, pY = height - (((sig.y + sig.height) / scale) * sY);
        const pW = (sig.width / scale) * sX, pH = (sig.height / scale) * sY;
        if (sig.type === "draw" || sig.type === "image") {
          page.drawImage(await pdfLibDoc.embedPng(sig.data), { x: pX, y: pY, width: pW, height: pH, opacity: sig.opacity });
        } else {
          let font;
          const isBold = sig.bold;
          const isItalic = sig.italic;
          if (sig.font === "Courier") {
            if (isBold && isItalic) font = await pdfLibDoc.embedFont(StandardFonts.CourierBoldOblique);
            else if (isBold) font = await pdfLibDoc.embedFont(StandardFonts.CourierBold);
            else if (isItalic) font = await pdfLibDoc.embedFont(StandardFonts.CourierOblique);
            else font = await pdfLibDoc.embedFont(StandardFonts.Courier);
          } else if (sig.font === "Times-Roman") {
            if (isBold && isItalic) font = await pdfLibDoc.embedFont(StandardFonts.TimesRomanBoldItalic);
            else if (isBold) font = await pdfLibDoc.embedFont(StandardFonts.TimesRomanBold);
            else if (isItalic) font = await pdfLibDoc.embedFont(StandardFonts.TimesRomanItalic);
            else font = await pdfLibDoc.embedFont(StandardFonts.TimesRoman);
          } else {
            if (isBold && isItalic) font = await pdfLibDoc.embedFont(StandardFonts.HelveticaBoldOblique);
            else if (isBold) font = await pdfLibDoc.embedFont(StandardFonts.HelveticaBold);
            else if (isItalic) font = await pdfLibDoc.embedFont(StandardFonts.HelveticaOblique);
            else font = await pdfLibDoc.embedFont(StandardFonts.Helvetica);
          }
          
          const hex = sig.color || "#000000";
          const r = parseInt(hex.slice(1,3), 16) / 255, g = parseInt(hex.slice(3,5), 16) / 255, b = parseInt(hex.slice(5,7), 16) / 255;
          const textSize = (sig.fontSize / scale) * sX;
          
          page.drawText(sig.data, { x: pX, y: pY + (pH * 0.2), size: textSize, font, color: rgb(r, g, b), opacity: sig.opacity });
          
          if (sig.underline) {
            const textWidth = font.widthOfTextAtSize(sig.data, textSize);
            page.drawLine({
              start: { x: pX, y: pY + (pH * 0.1) },
              end: { x: pX + textWidth, y: pY + (pH * 0.1) },
              thickness: textSize / 15,
              color: rgb(r, g, b),
              opacity: sig.opacity
            });
          }
        }
      }
      const bytes = await pdfLibDoc.save();
      const blob = new Blob([bytes as any], { type: "application/pdf" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `Signed_${pdfFile.name}`;
      link.click();
      toast.success("Đã hoàn tất lưu file!");
    } catch (e) { toast.error("Lỗi xuất PDF: " + e); }
  };

  return (
    <ToolLayout title="Ký tên PDF" description="Đầy đủ tính năng: In đậm, In nghiêng, Gạch chân văn bản chuyên nghiệp.">
      <div className="flex flex-col h-[calc(100vh-160px)] bg-[#f3f4f6] rounded-3xl border shadow-2xl relative overflow-hidden">
        
        <div className="bg-white border-b z-30 shadow-sm flex flex-col p-3 gap-3">
          <div className="flex items-center justify-between">
             <div className="flex items-center gap-1.5 p-1 bg-gray-50 border rounded-xl border-gray-100 h-10">
                <button onClick={() => setToolMode("hand")} className={`p-1.5 px-3 rounded-lg transition-colors ${toolMode === 'hand' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}><Hand className="w-4 h-4" /></button>
                <button onClick={() => setToolMode("select")} className={`p-1.5 px-3 rounded-lg transition-colors ${toolMode === 'select' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}><Pointer className="w-4 h-4" /></button>
                <div className="w-px h-6 bg-gray-200 mx-1" />
                <button onClick={() => { setModalTab("draw"); setIsModalOpen(true); }} className="px-4 h-8 hover:bg-white rounded-lg text-xs font-black text-gray-700 flex items-center gap-2 transition-all"><PenTool className="w-3.5 h-3.5 text-blue-500" /> CHỮ KÝ</button>
                <button onClick={() => addSignatureToList("Nhập văn bản", "text", 200, 40)} className="p-2 hover:bg-white rounded-lg text-orange-500 transition-colors"><LucideType className="w-5 h-5" /></button>
                <button onClick={() => addSignatureToList(new Date().toLocaleDateString("vi-VN"), "date", 120, 30)} className="p-2 hover:bg-white rounded-lg text-gray-400 transition-colors"><CalendarIcon className="w-5 h-5" /></button>
                <div className="w-px h-6 bg-gray-200 mx-1" />
                <div className="flex items-center gap-2 px-3 h-8 bg-blue-50 rounded-lg border border-blue-100">
                    <span className="text-[10px] uppercase font-black text-blue-400">Trang:</span>
                    <span className="text-xs font-black text-blue-600">{activePage} / {numPages || 0}</span>
                </div>
             </div>
             <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-2 py-1 border border-gray-100 h-10">
                   <button onClick={() => setScale(Math.max(0.4, scale - 0.2))} className="p-1 hover:bg-white rounded-md text-gray-300"><ZoomOut className="w-4 h-4" /></button>
                   <span className="text-[11px] font-black w-12 text-center text-gray-600">{Math.round(scale * 100)}%</span>
                   <button onClick={() => setScale(Math.min(4, scale + 0.2))} className="p-1 hover:bg-white rounded-md text-gray-300"><ZoomIn className="w-4 h-4" /></button>
                </div>
                <button onClick={downloadPdf} disabled={!pdfFile} className="px-8 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-30 text-white rounded-2xl font-black text-xs shadow-xl transition-all active:scale-95 h-10 flex items-center tracking-wider uppercase">Xuất File Ngay</button>
             </div>
          </div>

          <div className="flex items-center gap-1.5 p-1 px-2 bg-slate-50/50 border border-dashed border-slate-200 rounded-xl min-h-[48px]">
             <div className="flex items-center gap-3">
                <div className="relative">
                  <select value={globalStyle.font} onChange={e => updateSelectedOrGlobal('font', e.target.value)} className="appearance-none bg-white border border-gray-200 rounded-lg px-4 py-1.5 text-xs font-bold text-gray-700 pr-10 outline-none focus:ring-2 focus:ring-blue-400 cursor-pointer shadow-sm">
                    {FONT_OPTIONS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                </div>
                <div className="flex items-center bg-white border border-gray-200 rounded-lg shadow-sm">
                  <input type="number" value={Math.round(globalStyle.fontSize)} onChange={e => updateSelectedOrGlobal('fontSize', Number(e.target.value))} className="w-12 text-xs text-center py-1.5 font-bold outline-none bg-transparent" />
                  <div className="pr-3 text-[10px] font-black text-gray-300 uppercase">PT</div>
                </div>
                <div className="flex bg-white border border-gray-200 rounded-lg shadow-sm p-0.5 gap-0.5">
                  <button onClick={() => updateSelectedOrGlobal('bold', !globalStyle.bold)} className={`p-1.5 rounded-md transition-all ${globalStyle.bold ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-400 hover:text-gray-600'}`} title="In đậm"><Bold className="w-3.5 h-3.5" /></button>
                  <button onClick={() => updateSelectedOrGlobal('italic', !globalStyle.italic)} className={`p-1.5 rounded-md transition-all ${globalStyle.italic ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-400 hover:text-gray-600'}`} title="In nghiêng"><Italic className="w-3.5 h-3.5" /></button>
                  <button onClick={() => updateSelectedOrGlobal('underline', !globalStyle.underline)} className={`p-1.5 rounded-md transition-all ${globalStyle.underline ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-400 hover:text-gray-600'}`} title="Gạch chân"><Underline className="w-3.5 h-3.5" /></button>
                </div>
                <div className="w-px h-6 bg-gray-200 mx-1" />
                <div className="flex items-center gap-2 bg-white px-2 py-1 rounded-lg border border-gray-200 shadow-sm">
                    <input type="color" value={globalStyle.color} onChange={e => updateSelectedOrGlobal('color', e.target.value)} className="w-6 h-6 rounded-md border-0 p-0 cursor-pointer overflow-hidden" />
                    <span className="text-[10px] font-black text-gray-400 uppercase">{globalStyle.color}</span>
                </div>
                {selectedId && (
                  <>
                    <div className="w-px h-6 bg-gray-200 mx-1" />
                    <button onClick={() => { setSignatures(prev => prev.filter(s => s.id !== selectedId)); setSelectedId(null); }} className="flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-all font-black text-[10px] uppercase shadow-sm"><Trash2 className="w-3.5 h-3.5" /> XÓA</button>
                  </>
                )}
             </div>
             {!selectedId && <div className="ml-auto text-[10px] font-black text-slate-300 uppercase tracking-widest animate-pulse">Thiết lập mặc định</div>}
          </div>
        </div>

        <div ref={containerRef} className={`flex-1 overflow-auto py-12 px-12 bg-[#dbdee1] ${toolMode === 'hand' ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'}`}>
          {!pdfFile ? (
            <div className="w-full max-w-xl mx-auto h-fit mt-12 bg-white p-16 rounded-[48px] border-2 border-dashed border-gray-100 shadow-xl flex flex-col items-center">
               <FileUploader accept=".pdf" onFileSelect={setPdfFile} title="TẢI FILE PDF" description="Hệ thống ổn định, đầy đủ định dạng văn bản" />
            </div>
          ) : (
            <div className="flex flex-col items-center gap-16 min-w-max pb-32">
               {Array.from({ length: numPages }).map((_, i) => (
                  <div key={i} data-pagenum={i + 1} className="pdf-page-container group relative">
                    <PdfPageRender pageNum={i + 1} pdfDoc={pdfDoc} scale={scale} signatures={signatures} selectedId={selectedId} setSelectedId={setSelectedId} setSignatures={setSignatures} />
                    <div className="absolute top-0 right-0 translate-x-12 opacity-30 font-black text-3xl text-slate-400 select-none">P{i+1}</div>
                  </div>
               ))}
            </div>
          )}
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-2xl rounded-[48px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="px-10 py-8 border-b flex justify-between items-center"><h2 className="text-2xl font-black text-slate-800 uppercase">Tạo chữ ký</h2><button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-gray-100 rounded-full"><X className="w-6 h-6" /></button></div>
              <div className="p-10">
                <div className="flex gap-2 bg-gray-100 p-2 rounded-2xl mb-8">
                  <button onClick={() => setModalTab("draw")} className={`flex-1 py-4 rounded-xl font-black transition-all ${modalTab === 'draw' ? 'bg-white shadow-xl text-blue-600' : 'text-gray-400'}`}>HÌNH VẼ</button>
                  <button onClick={() => setModalTab("image")} className={`flex-1 py-4 rounded-xl font-black transition-all ${modalTab === 'image' ? 'bg-white shadow-xl text-blue-600' : 'text-gray-400'}`}>TẢI ẢNH</button>
                </div>
                {modalTab === 'draw' ? (
                  <div className="space-y-8">
                    <div className="border border-gray-100 rounded-[32px] bg-white relative overflow-hidden h-80"><SignatureCanvas ref={(ref) => { sigPad.current = ref; }} penColor="#000" canvasProps={{ style: { width: '100%', height: '100%' } }} /><button onClick={() => sigPad.current?.clear()} className="absolute bottom-6 right-6 p-4 bg-white border rounded-2xl text-gray-300 hover:text-red-500 shadow-sm"><Eraser className="w-5 h-5" /></button></div>
                    <button onClick={saveDrawing} className="w-full py-5 bg-blue-600 text-white rounded-[24px] font-black shadow-2xl shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all uppercase tracking-widest">Lưu và Chèn Chữ Ký</button>
                  </div>
                ) : (
                  <label className="w-full h-80 border-2 border-dashed border-gray-200 rounded-[40px] flex flex-col items-center justify-center gap-6 cursor-pointer hover:bg-blue-50 transition-all group">
                     <Upload className="w-12 h-12 text-gray-300 group-hover:text-blue-600 transition-colors" />
                     <p className="font-black text-slate-400 uppercase mt-2">Click để tải ảnh lên</p>
                     <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                        const f = e.target.files?.[0]; if (f) { const r = new FileReader(); r.onload = (ev) => addSignatureToList(ev.target?.result as string, "image", 200, 100); r.readAsDataURL(f); }
                     }} />
                  </label>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}

