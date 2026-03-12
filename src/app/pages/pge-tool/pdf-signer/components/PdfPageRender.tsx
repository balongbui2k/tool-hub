import { useRef, useEffect } from "react";
import { DraggableSignature } from "./DraggableSignature";

export function PdfPageRender({ pageNum, pdfDoc, scale, signatures, selectedId, setSelectedId, setSignatures }: any) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const render = async () => {
      if (!pdfDoc) return;
      try {
        const page = await pdfDoc.getPage(pageNum);
        const viewport = page.getViewport({ scale });
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        canvas.height = viewport.height; 
        canvas.width = viewport.width;
        await page.render({ canvasContext: ctx, viewport }).promise;
      } catch (err) { 
        console.error(err); 
      }
    };
    render();
  }, [pdfDoc, pageNum, scale]);

  return (
    <div className="relative bg-white shadow-2xl border border-gray-200" onMouseDown={() => setSelectedId(null)}>
      <canvas ref={canvasRef} />
      {signatures.filter((s: any) => s.page === pageNum).map((sig: any) => (
        <DraggableSignature 
          key={sig.id} 
          sig={sig} 
          scale={scale}
          isSelected={selectedId === sig.id} 
          onClick={(e: any) => { e.stopPropagation(); setSelectedId(sig.id); }} 
          onUpdate={(id: string, update: any) => setSignatures((prev: any) => prev.map((s: any) => s.id === id ? { ...s, ...update } : s))} 
        />
      ))}
    </div>
  );
}
