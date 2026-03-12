import { useState, useRef, useEffect } from "react";

export function DraggableSignature({ sig, isSelected, onClick, onUpdate, scale }: any) {
  const [pos, setPos] = useState({ x: sig.x, y: sig.y });
  const [size, setSize] = useState({ width: sig.width, height: sig.height });
  const [resizing, setResizing] = useState(false);
  const [dragging, setDragging] = useState(false);
  
  const startMouse = useRef({ x: 0, y: 0 });
  const startBase = useRef({ x: 0, y: 0, w: 0, h: 0 });

  useEffect(() => {
    const mm = (e: MouseEvent) => {
      if (dragging) {
        const dx = (e.clientX - startMouse.current.x) / scale;
        const dy = (e.clientY - startMouse.current.y) / scale;
        setPos({ x: startBase.current.x + dx, y: startBase.current.y + dy });
      }
      if (resizing) { 
        const dx = (e.clientX - startMouse.current.x) / scale; 
        const ratio = startBase.current.h / startBase.current.w; 
        const newW = Math.max(30, startBase.current.w + dx);
        setSize({ width: newW, height: newW * ratio }); 
      }
    };
    const mu = () => { 
      if (dragging || resizing) { 
        setDragging(false); setResizing(false); 
        onUpdate(sig.id, { ...pos, ...size }); 
      } 
    };
    if (dragging || resizing) {
      window.addEventListener("mousemove", mm);
      window.addEventListener("mouseup", mu);
    }
    return () => { window.removeEventListener("mousemove", mm); window.removeEventListener("mouseup", mu); };
  }, [dragging, resizing, pos, size, sig.id, onUpdate, scale]);

  return (
    <div 
      style={{ 
        position: "absolute", 
        left: pos.x * scale, 
        top: pos.y * scale, 
        width: size.width * scale, 
        height: size.height * scale, 
        zIndex: isSelected ? 60 : 50, 
        opacity: sig.opacity,
        outline: 'none',
        pointerEvents: 'auto'
      }} 
      onMouseDown={(e) => { 
        onClick(e); 
        if (!resizing) { 
          setDragging(true); 
          startMouse.current = { x: e.clientX, y: e.clientY };
          startBase.current = { x: pos.x, y: pos.y, w: size.width, h: size.height };
        } 
      }}
      className={`group ${isSelected ? 'ring-2 ring-blue-500 shadow-2xl' : ''} select-none`}
    >
        {isSelected && (
          <div 
            onMouseDown={(e) => { 
              e.stopPropagation(); 
              e.preventDefault();
              setResizing(true); 
              startMouse.current = { x: e.clientX, y: e.clientY };
              startBase.current = { x: pos.x, y: pos.y, w: size.width, h: size.height };
            }} 
            style={{ pointerEvents: 'auto', cursor: 'nwse-resize' }}
            className="absolute bottom-0 right-0 w-5 h-5 bg-white border-2 border-blue-600 rounded-full -mb-2.5 -mr-2.5 z-[100] shadow-xl hover:scale-125 transition-transform" 
          />
        )}

        <div className="w-full h-full flex items-center justify-center pointer-events-none">
          {sig.type === 'draw' || sig.type === 'image' ? (
            <img src={sig.data} alt="sig" className="w-full h-full object-contain select-none" />
          ) : (
            <textarea 
               value={sig.data} 
               onMouseDown={(e) => e.stopPropagation()}
               onChange={e => onUpdate(sig.id, { data: e.target.value })} 
               readOnly={!isSelected} 
               style={{ 
                  fontSize: (sig.fontSize || 18) * (size.width / 200) * scale, 
                  color: sig.color, 
                  fontFamily: sig.font === 'Courier' ? 'Courier' : sig.font === 'Times-Roman' ? 'serif' : 'sans-serif', 
                  fontWeight: sig.bold ? 'bold' : 'normal', 
                  fontStyle: sig.italic ? 'italic' : 'normal',
                  textDecoration: sig.underline ? 'underline' : 'none',
                  background: 'transparent', border: 'none', outline: 'none', resize: 'none', width: '100%', height: '100%', overflow: 'hidden', textAlign: 'center',
                  caretColor: 'transparent',
                  pointerEvents: isSelected ? 'auto' : 'none'
               }} 
               className="italic leading-tight whitespace-pre-wrap flex items-center justify-center py-1 opacity-100" 
            />
          )}
        </div>
    </div>
  );
}
