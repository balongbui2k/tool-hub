import openpyxl
import os

path = "Letterhead mẫu/Danh_Sach_Tham_Gia-Mau.xlsx"
if os.path.exists(path):
    wb = openpyxl.load_workbook(path, data_only=True)
    ws = wb.active
    for row in ws.iter_rows(min_row=1, max_row=10):
        print([str(cell.value).encode('utf-8', 'ignore').decode('utf-8') for cell in row])
else:
    print(f"Path not found: {path.encode('utf-8')}")
