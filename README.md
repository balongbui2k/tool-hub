# Phúc Gia Hub - Tool Aggregator

Hệ thống công cụ quản lý và hỗ trợ nghiệp vụ cho Phúc Gia (PGL & PGE).

## 🚀 Tính năng nổi bật
- **QR Code Generator**: Tạo mã QR chuyên nghiệp cho Liên kết, Tài liệu (Excel/Word) và vCard.
- **Certificate Suite**: Hỗ trợ tạo và quản lý chứng chỉ (dự kiến).
- **Giao diện hiện đại**: Tối ưu hoá UI/UX với chuẩn thương hiệu Phúc Gia.

## 🛠 Cấu trúc Project
- **Frontend**: Vite + React + Tailwind CSS.
- **Backend**: FastAPI (Python) hỗ trợ xử lý file và QR API.

## 💻 Chạy dưới Local
1. **Frontend**:
   ```bash
   npm install
   npm run dev
   ```
2. **Backend**:
   ```bash
   pip install -r requirements.txt
   python backend.py
   ```

## 🌐 Deploy lên Render.com
Dự án đã được cấu hình sẵn `Dockerfile` để deploy Backend và Build script cho Frontend.
1. Đẩy code lên GitHub.
2. Tạo **Web Service** trên Render cho Backend (sử dụng Dockerfile).
3. Tạo **Static Site** trên Render/Vercel cho Frontend.
4. Cấu hình biến môi trường `VITE_BACKEND_URL` trỏ tới API của bạn.