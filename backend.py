"""
PGE Backend Server
==================
FastAPI backend cho ToolHub - PGE Certificate Suite.
Port lại logic từ tool.py để chạy qua HTTP API.

Cài đặt:
    pip install fastapi uvicorn python-multipart pandas openpyxl docxtpl docx2pdf docxcompose PyPDF2 python-docx

Chạy:
    python backend.py
    hoặc: uvicorn backend:app --reload --port 8000
"""

import io
import os
import re
import sys
import zipfile
import tempfile
import unicodedata
from datetime import datetime, timedelta
from pathlib import Path
from typing import Optional

import pandas as pd
import PyPDF2
from docx import Document
from docx.oxml.ns import qn
from docxcompose.composer import Composer
from docxtpl import DocxTemplate
try:
    from docx2pdf import convert as _docx2pdf_convert
except ImportError:
    _docx2pdf_convert = None
from fastapi import FastAPI, File, Form, UploadFile, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response, JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
import socket
import uuid
import shutil

app = FastAPI(title="PGE Tool Backend", version="2.0.0")

@app.get("/")
async def root():
    return {
        "message": "Phúc Gia Hub API is running!",
        "status": "online",
        "docs": "/docs"
    }

# Allow Public Origins for Production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, you might want to restrict this to your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Disposition", "x-file-count", "x-logs"],
)

# Thư mục lưu file upload
UPLOAD_DIR = Path("public/files")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
app.mount("/files", StaticFiles(directory="public/files"), name="files")

def get_local_ip():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        # Connect to a public DNS to determine default route
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except:
        return "127.0.0.1"

@app.post("/api/upload")
async def upload_file(request: Request, file: UploadFile = File(...)):
    try:
        # Prevent tracking issues, store file with a safe unique name
        ext = Path(file.filename).suffix
        safe_name = f"{uuid.uuid4().hex[:8]}_{file.filename.replace(' ', '_')}"
        file_path = UPLOAD_DIR / safe_name
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # DYNAMIC BASE URL: detect how the user is accessing the server
        # This ensures QR codes work for both localhost and Network IP
        base_url = str(request.base_url).rstrip('/')
        file_url = f"{base_url}/api/download/{safe_name}"
        
        print(f"📁 File uploaded: {file.filename} -> {file_url}")
        
        return {"status": "success", "url": file_url, "filename": file.filename}
    except Exception as e:
        print(f"❌ Upload error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/download/{filename}")
async def download_file(filename: str):
    file_path = UPLOAD_DIR / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")
    
    # Trích xuất tên file gốc (Bỏ đoạn uuid ngẫu nhiên ở phần đầu để tên file tải về đẹp hơn)
    download_name = filename
    if "_" in filename:
        parts = filename.split("_", 1)
        if len(parts[0]) == 8:
            download_name = parts[1]
            
    return FileResponse(
        path=file_path, 
        filename=download_name, 
        headers={"Content-Disposition": f'attachment; filename="{download_name}"'}
    )

# ── Utils (ported from tool.py) ────────────────────────────────────────────

def viet_to_ascii(text: str) -> str:
    text = str(text).replace('Đ', 'D').replace('đ', 'd')
    text = unicodedata.normalize('NFD', text)
    return ''.join(c for c in text if unicodedata.category(c) != 'Mn')

def name_to_slug(full_name: str) -> str:
    ascii_name = viet_to_ascii(str(full_name).strip())
    return re.sub(r'[^A-Za-z0-9]+', '_', ascii_name).strip('_')

def course_to_slug(course: str) -> str:
    ascii_course = viet_to_ascii(str(course).strip().title())
    return re.sub(r'[^A-Za-z0-9]+', '_', ascii_course).strip('_')

def format_date_str(val):
    if isinstance(val, datetime): return val.strftime("%d/%m/%Y")
    s = str(val).strip()
    if not s or s.lower() == 'nan': return None
    if " " in s: s = s.split(" ")[0]
    
    # Ưu tiên parse Ngày/Tháng/Năm (VN)
    for fmt in ("%d/%m/%Y", "%d-%m-%Y", "%d.%m.%Y", "%Y-%m-%d"):
        try:
            return datetime.strptime(s, fmt).strftime("%d/%m/%Y")
        except:
            continue
    return s

def format_date_range(start_val, end_val):
    s = format_date_str(start_val)
    e = format_date_str(end_val)
    if not s: return ""
    if not e or s == e: return s
    return f"{s} - {e}"

def convert_docx_to_pdf_win32(in_path: str, out_path: str) -> bool:
    """
    Chuyển đổi DOCX → PDF bằng Win32COM (comtypes), đáng tin cậy nhất trên Windows.
    Trả về True nếu thành công, False nếu thất bại.
    """
    try:
        import comtypes.client
        # wdFormatPDF = 17
        word = comtypes.client.CreateObject("Word.Application")
        word.Visible = False
        doc = word.Documents.Open(in_path)
        doc.SaveAs(out_path, FileFormat=17)
        doc.Close()
        word.Quit()
        return os.path.exists(out_path)
    except Exception as e:
        print(f"❌ convert_docx_to_pdf_win32 lỗi: {e}")
        return False

def convert_docx_to_pdf_linux(in_path: str, out_dir: str) -> bool:
    """Chuyển đổi DOCX → PDF bằng LibreOffice (soffice), chuẩn cho Linux/Docker."""
    try:
        import subprocess
        subprocess.run(
            ['soffice', '--headless', '--convert-to', 'pdf', '--outdir', out_dir, in_path],
            check=True,
            capture_output=True
        )
        return True
    except Exception as e:
        print(f"❌ convert_docx_to_pdf_linux lỗi: {e}")
        return False

def extract_first_date_for_prefix(text):
    match = re.search(r'\d{4}[./-]\d{2}[./-]\d{2}', text)
    if match: return match.group().replace("-", ".").replace("/", ".")
    match = re.search(r'\d{2}[./-]\d{2}[./-]\d{4}', text)
    if match:
        d = match.group().replace("-", "/").replace(".", "/")
        try: return datetime.strptime(d, "%d/%m/%Y").strftime("%Y.%m.%d")
        except: return text
    return text

def sanitize_docx(doc):
    """Xóa cài đặt Mail Merge khỏi file Word để tránh lỗi pop-up khi mở file"""
    try:
        settings = doc.settings.element
        removed = False
        # Danh sách các thẻ liên quan đến Mail Merge cần xóa
        for tag in ['mailMerge', 'mailMergeSource']:
            el = settings.find(qn(f'w:{tag}'))
            if el is not None:
                settings.remove(el)
                removed = True
        if removed:
            print("🧹 Đã xóa cài đặt Mail Merge khỏi file Word mẫu.")
        return removed
    except Exception:
        pass
    return False

# Mapping các tên cột có thể có trong Excel
COL_MAP = {
    'name': ['họ và tên', 'họ tên', 'full name', 'tên học viên', 'tên'],
    'course': ['khóa học', 'tên khóa học', 'khóa', 'course name'],
    'start_date': ['thời gian bắt đầu', 'ngày bắt đầu', 'từ ngày', 'start date', 'tg bắt đầu'],
    'end_date': ['thời gian kết thúc', 'ngày kết thúc', 'đến ngày', 'end date', 'tg kết thúc'],
    'gender': ['giới tính', 'gender', 'phái'],
    'birth_date': ['ngày sinh', 'năm sinh', 'birth date', 'ngay sinh'],
    'sign_date': ['ngày ký', 'ngày ký tên', 'sign date', 'ngày cấp'],
    'title': ['danh xưng', 'ông/bà', 'title', 'chức danh'],
}

def get_col_val(row, key, default=None):
    """Lấy giá trị từ row dựa trên mapping cột"""
    cols = [str(c).strip().lower() for c in row.index]
    for candidate in COL_MAP.get(key, []):
        if candidate in cols:
            return row[candidate]
    return default

def read_excel_names(excel_bytes: bytes):
    """Đọc Excel từ bytes, tự động tìm sheet phù hợp và trả về dữ liệu"""
    with pd.ExcelFile(io.BytesIO(excel_bytes), engine='openpyxl') as xl:
        target_sh = None
        # Ưu tiên tìm sheet chứa cột 'Họ tên'
        for sh_name in xl.sheet_names:
            df_header = pd.read_excel(xl, sheet_name=sh_name, nrows=0)
            cols = [str(c).strip().lower() for c in df_header.columns]
            if any(x in cols for x in COL_MAP['name']):
                target_sh = sh_name
                break
        
        if target_sh is None:
            target_sh = xl.sheet_names[0]
            
        # Đọc tất cả dưới dạng chuỗi (str) để lấy chính xác những gì hiển thị trong Excel, 
        # tránh việc thư viện tự động chuyển đổi ngày tháng gây đảo Day/Month.
        df = pd.read_excel(xl, sheet_name=target_sh, dtype=str)
    
    df.columns = [str(c).strip().lower() for c in df.columns]

    # Tìm thông tin prefix từ dòng đầu tiên
    first_row = df.iloc[0]
    first_row_start = get_col_val(first_row, 'start_date')
    
    if isinstance(first_row_start, datetime):
        s_date_prefix = first_row_start.strftime("%Y.%m.%d")
    else:
        s_date_prefix = extract_first_date_for_prefix(str(first_row_start))

    c_name_default = str(get_col_val(first_row, 'course', '')).strip()
    prefix = f"{s_date_prefix}-{course_to_slug(c_name_default)}"

    names_original, names_slug, rows_data = [], [], []
    for _, row in df.iterrows():
        name = get_col_val(row, 'name')
        if not name or str(name).lower() == 'nan': continue
        names_original.append(str(name))
        names_slug.append(name_to_slug(str(name)))
        rows_data.append(row)

    return prefix, names_slug, names_original, rows_data, c_name_default, s_date_prefix


# ── API Endpoints ──────────────────────────────────────────────────────────

@app.get("/health")
async def health():
    return {"status": "ok", "service": "PGE Tool Backend v2.0"}


@app.post("/api/cert-suite")
async def cert_suite(
    excel: UploadFile = File(...),
    docx: UploadFile = File(...),
    output_name: str = Form("Tong_Hop_Chung_Chi.docx"),
    output_format: str = Form("docx"),
):
    """Tool 1: Tạo file Word tổng hợp chứng chỉ"""
    logs = []

    def log(type_, text):
        logs.append({"type": type_, "text": text})

    try:
        excel_bytes = await excel.read()
        docx_bytes = await docx.read()

        # Kiểm tra nhanh định dạng file để tránh lỗi ValueError khi chọn nhầm file Excel vào ô Word
        if not docx.filename.lower().endswith(".docx"):
            return JSONResponse({"logs": logs, "error": f"File mẫu '{docx.filename}' không phải là định dạng Word (.docx). Vui lòng kiểm tra lại!"}, status_code=400)
        
        # Thử kiểm tra nội dung file bằng cách đọc header (optional nhưng an toàn)
        if b"word/document.xml" not in docx_bytes[:8000] and b"word/_rels" not in docx_bytes[:8000]:
             # Nếu file chứa 'spreadsheetml', chắc chắn là chọn nhầm file Excel
             if b"spreadsheetml" in docx_bytes[:8000]:
                 return JSONResponse({"logs": logs, "error": "Bạn đã chọn nhầm file Excel vào mục 'Biểu mẫu Word'. Vui lòng chọn lại đúng file .docx!"}, status_code=400)

        log("info", "📚 Đang đọc dữ liệu từ Excel...")
        prefix, names_slug, names_original, rows_data, c_name_default, s_date_prefix = read_excel_names(excel_bytes)
        log("info", f"✓ Tìm thấy {len(names_original)} học viên. Prefix: {prefix}")

        doc_objs = []

        for idx, row in enumerate(rows_data):
            name = names_original[idx]
            c_name = str(get_col_val(row, 'course', c_name_default)).strip()
            if not c_name or c_name.lower() == 'nan': c_name = c_name_default

            dx = str(get_col_val(row, 'title', '')).strip()
            if not dx or dx.lower() == 'nan':
                gt = str(get_col_val(row, 'gender', '')).strip().lower()
                if gt in ['nam', 'm', 'male']: dx = 'Ông'
                elif gt in ['nữ', 'nu', 'f', 'female']: dx = 'Bà'
                else: dx = 'Ông/Bà'

            ns = get_col_val(row, 'birth_date', '')
            if isinstance(ns, datetime): ns = ns.strftime("%d/%m/%Y")

            t_starts = get_col_val(row, 'start_date')
            t_ends = get_col_val(row, 'end_date')
            tg_hoc = format_date_range(t_starts, t_ends)

            raw_sign = get_col_val(row, 'sign_date', '')
            sign_t = ""
            if isinstance(raw_sign, datetime):
                sign_t = f"Hà Nội, ngày {raw_sign.day:02d} tháng {raw_sign.month:02d} năm {raw_sign.year}"
            elif pd.notna(raw_sign) and str(raw_sign).strip() and str(raw_sign).lower() != 'nan':
                match = re.search(r'(\d{1,2})\D+(\d{1,2})\D+(\d{4})', str(raw_sign))
                if match:
                    d, m, y = int(match.group(1)), int(match.group(2)), int(match.group(3))
                    sign_t = f"Hà Nội, ngày {d:02d} tháng {m:02d} năm {y}"

            if not sign_t:
                ref = pd.to_datetime(t_starts, errors='coerce', dayfirst=True)
                if pd.isna(ref):
                    try: ref = datetime.strptime(s_date_prefix, "%Y.%m.%d")
                    except: ref = datetime.now()
                sign_d = ref + timedelta(days=7)
                sign_t = f"Hà Nội, ngày {sign_d.day:02d} tháng {sign_d.month:02d} năm {sign_d.year}"

            tpl = DocxTemplate(io.BytesIO(docx_bytes))
            
            # Xóa cài đặt Mail Merge khỏi template trước khi render
            sanitize_docx(tpl.docx)
            
            tpl.render({
                'Danh_xưng': str(dx),
                'Họ_và_tên': str(name),
                'Ngày_sinh': str(ns),
                'Khóa_học': c_name,
                'Thời_gian': tg_hoc,
                'TT': f"{idx+1:02d}",
                'Ngay_Ki': sign_t,
            })

            mem = io.BytesIO()
            tpl.save(mem)
            mem.seek(0)
            doc_objs.append(Document(mem))
            log("info", f"  ✓ {name} | {tg_hoc}")

        if not doc_objs:
            return JSONResponse({"logs": logs, "error": "Không tìm thấy học viên nào trong Excel!"}, status_code=400)

        log("info", f"\n📎 Đang ghép {len(doc_objs)} chứng chỉ thành 1 file...")
        master = doc_objs[0]
        comp = Composer(master)
        for i in range(1, len(doc_objs)):
            master.add_page_break()
            comp.append(doc_objs[i])

        out_buf = io.BytesIO()
        comp.save(out_buf)
        out_buf.seek(0)

        log("success", f"✅ Xong! Đã tạo file tổng hợp với {len(doc_objs)} chứng chỉ.")

        file_bytes = out_buf.getvalue()
        media_type = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"

        if output_format.lower() == "pdf":
            log("info", "📄 Đang chuyển đổi sang PDF bằng Microsoft Word COM...")
            try:
                temp_id = uuid.uuid4().hex[:8]
                in_path = str((UPLOAD_DIR / f"temp_{temp_id}.docx").absolute())
                out_path = str((UPLOAD_DIR / f"temp_{temp_id}.pdf").absolute())

                with open(in_path, "wb") as f:
                    f.write(file_bytes)
                log("info", f"  ↳ File tạm DOCX: {in_path}")

                # ── XỬ LÝ CHUYỂN ĐỔI PDF ──
                success = False
                if sys.platform == "win32":
                    # Phương án 1: Win32COM (comtypes) - đáng tin cậy nhất trên Windows
                    success = convert_docx_to_pdf_win32(in_path, out_path)

                    # Phương án 2: Fallback docx2pdf nếu Win32COM thất bại
                    if not success and _docx2pdf_convert is not None:
                        log("warn", "  ⚠ Win32COM thất bại, thử docx2pdf...")
                        try:
                            _docx2pdf_convert(in_path, out_path)
                            success = os.path.exists(out_path)
                        except Exception as e2:
                            log("error", f"  ❌ docx2pdf cũng thất bại: {e2}")
                else:
                    # Phương án cho Linux/Docker: LibreOffice (soffice)
                    log("info", "  📄 Đang chuyển đổi bằng LibreOffice (soffice)...")
                    success = convert_docx_to_pdf_linux(in_path, str(UPLOAD_DIR.absolute()))
                    
                    # LibreOffice mặc định tạo file tên giống file gốc nhưng đuôi .pdf
                    expected_out = in_path.replace(".docx", ".pdf")
                    if os.path.exists(expected_out):
                        # Đổi tên về out_path (temp_xxxx.pdf)
                        if os.path.exists(out_path): os.remove(out_path)
                        os.rename(expected_out, out_path)
                        success = True

                if success:
                    with open(out_path, "rb") as f:
                        file_bytes = f.read()
                    media_type = "application/pdf"
                    if output_name.lower().endswith(".docx"):
                        output_name = output_name[:-5] + ".pdf"
                    elif not output_name.lower().endswith(".pdf"):
                        output_name += ".pdf"
                    log("success", f"✅ Chuyển đổi PDF thành công! ({len(file_bytes)//1024} KB)")
                else:
                    log("error", "❌ Không thể tạo PDF. Trên Windows hãy kiểm tra MS Word, trên Linux hãy kiểm tra LibreOffice.")

                # Dọn file tạm
                for p in [in_path, out_path]:
                    if os.path.exists(p):
                        try: os.remove(p)
                        except: pass

            except Exception as e:
                import traceback
                log("error", f"❌ Lỗi chuyển đổi PDF: {str(e)}")
                log("error", traceback.format_exc())

        return Response(
            content=file_bytes,
            media_type=media_type,
            headers={
                "Content-Disposition": f'attachment; filename="{output_name}"',
                "x-logs": str(len(logs)),
            }
        )

    except Exception as e:
        import traceback
        log("error", f"❌ Lỗi: {str(e)}")
        log("error", traceback.format_exc())
        return JSONResponse({"logs": logs, "error": str(e)}, status_code=500)


@app.post("/api/split-pdf")
async def split_pdf(
    excel: UploadFile = File(...),
    pdf: UploadFile = File(...),
    drive_link: Optional[str] = Form(None),
):
    """Tool 2: Tách PDF theo danh sách học viên"""
    logs = []

    def log(type_, text):
        logs.append({"type": type_, "text": text})

    try:
        excel_bytes = await excel.read()
        pdf_bytes = await pdf.read()

        log("info", "📚 Đang đọc danh sách từ Excel...")
        prefix, names_slug, names_original, _, _, _ = read_excel_names(excel_bytes)
        log("info", f"✓ {len(names_original)} học viên. Prefix: {prefix}")

        work_pdf_bytes = pdf_bytes

        # If uploaded file is DOCX, we'd need to convert - skip for now, require PDF
        if pdf.filename and pdf.filename.lower().endswith('.docx'):
            log("warn", "⚠ File DOCX trực tiếp không được hỗ trợ trong web mode. Vui lòng chuyển sang PDF trước.")
            return JSONResponse({"logs": logs, "error": "Vui lòng upload file PDF (không phải DOCX). Hãy chuyển Word→PDF bằng tool Tool 1 trước."}, status_code=400)

        log("info", "✂️  Đang tách từng trang PDF...")

        zip_buf = io.BytesIO()
        count = 0

        with zipfile.ZipFile(zip_buf, 'w', zipfile.ZIP_DEFLATED) as zf:
            reader = PyPDF2.PdfReader(io.BytesIO(work_pdf_bytes))
            total_pages = len(reader.pages)

            for idx in range(min(total_pages, len(names_slug))):
                writer = PyPDF2.PdfWriter()
                writer.add_page(reader.pages[idx])

                new_name = f"{prefix}-{names_slug[idx]}.pdf"
                page_buf = io.BytesIO()
                writer.write(page_buf)
                zf.writestr(new_name, page_buf.getvalue())

                log("info", f"  ➜ {new_name}")
                count += 1

        if drive_link:
            log("info", f"🔗 Google Drive: {drive_link}")

        log("success", f"✅ Xong! Đã tách {count} file PDF thành công.")

        zip_buf.seek(0)
        return Response(
            content=zip_buf.getvalue(),
            media_type="application/zip",
            headers={
                "Content-Disposition": 'attachment; filename="Chung_Chi_PDF.zip"',
                "x-file-count": str(count),
            }
        )

    except Exception as e:
        import traceback
        log("error", f"❌ Lỗi: {str(e)}")
        return JSONResponse({"logs": logs, "error": str(e)}, status_code=500)


@app.post("/api/rename")
async def rename_pdfs(
    excel: UploadFile = File(...),
    zip: UploadFile = File(...),
    drive_link: Optional[str] = Form(None),
):
    """Tool 3: Đổi tên file PDF theo danh sách"""
    logs = []

    def log(type_, text):
        logs.append({"type": type_, "text": text})

    try:
        excel_bytes = await excel.read()
        zip_bytes = await zip.read()

        log("info", "📚 Đang đọc danh sách từ Excel...")
        prefix, names_slug, _, _, _, _ = read_excel_names(excel_bytes)
        log("info", f"✓ {len(names_slug)} học viên. Prefix: {prefix}")

        log("info", "🏷️ Đang đổi tên file trong ZIP...")

        out_zip_buf = io.BytesIO()
        count = 0

        with zipfile.ZipFile(io.BytesIO(zip_bytes), 'r') as zin:
            with zipfile.ZipFile(out_zip_buf, 'w', zipfile.ZIP_DEFLATED) as zout:
                pdf_files = sorted(
                    [f for f in zin.namelist() if f.lower().endswith('.pdf')],
                    key=lambda x: (
                        int(re.search(r'-(\d+)\.pdf$', x).group(1))
                        if re.search(r'-(\d+)\.pdf$', x)
                        else 9999
                    )
                )

                for item in zin.namelist():
                    if not item.lower().endswith('.pdf'):
                        continue
                    name_base = item.rsplit('.pdf', 1)[0]
                    parts = name_base.split('-')
                    idx_str = parts[-1]
                    if idx_str.isdigit():
                        idx = int(idx_str)
                        if 1 <= idx <= len(names_slug):
                            new_name = f"{prefix}-{names_slug[idx-1]}.pdf"
                            zout.writestr(new_name, zin.read(item))
                            log("info", f"  ➜ {new_name}")
                            count += 1
                            continue
                    # Keep original if no match
                    zout.writestr(item, zin.read(item))

        if drive_link:
            log("info", f"🔗 Google Drive: {drive_link}")

        log("success", f"✅ Xong! Đã đổi tên {count} file PDF.")

        out_zip_buf.seek(0)
        return Response(
            content=out_zip_buf.getvalue(),
            media_type="application/zip",
            headers={
                "Content-Disposition": 'attachment; filename="Chung_Chi_DaDoiTen.zip"',
                "x-file-count": str(count),
            }
        )

    except Exception as e:
        import traceback
        log("error", f"❌ Lỗi: {str(e)}")
        return JSONResponse({"logs": logs, "error": str(e)}, status_code=500)


if __name__ == "__main__":
    import uvicorn
    # Render provides the PORT environment variable
    port = int(os.environ.get("PORT", 8000))
    print("=" * 50)
    print(f"🚀 PGE Backend Server starting on port {port}...")
    print("=" * 50)
    uvicorn.run("backend:app", host="0.0.0.0", port=port, reload=False)
