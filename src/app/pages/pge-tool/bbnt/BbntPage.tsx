import { useState, useEffect } from "react";
import { ToolLayout } from "../../../components/ToolLayout";
import {
  FileText,
  Plus,
  Trash2,
  Download,
  Calendar,
  Users,
  Award,
  Sparkles,
  CheckCircle2,
  Calculator,
  Settings,
} from "lucide-react";
import { toast } from "sonner";
import * as docx from "docx";

const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  AlignmentType,
  BorderStyle,
  WidthType,
  ShadingType,
  VerticalAlign,
  PageBreak,
} = docx;

interface Course {
  ten: string;
  tuNgay: string;
  denNgay: string;
  soHV: number;
  donGia: number;
}

interface OtherJob {
  noiDung: string;
  donVi: string;
  soLuong: number;
  donGia: number;
}

const DEFAULT_JOBS: OtherJob[] = [
  { noiDung: "Chuẩn hóa & Biên dịch Tài liệu Kỹ thuật", donVi: "Gói", soLuong: 1, donGia: 150000000 },
  { noiDung: "Phân tích, báo cáo và đề xuất cải tiến liên quan đến hệ thống thử nghiệm", donVi: "Gói", soLuong: 1, donGia: 40000000 },
  { noiDung: "Phí quản lý và sử dụng nền tảng đào tạo trực tuyến", donVi: "Gói", soLuong: 1, donGia: 150000000 },
];

export function BbntPage() {
  const [ngay, setNgay] = useState<string>("");
  const [thang, setThang] = useState<string>("");
  const [nam, setNam] = useState<string>("");
  const [soNghiemThu, setSoNghiemThu] = useState<string>("");
  const [soPhuLucHD, setSoPhuLucHD] = useState<string>("");

  const [khoaHocs, setKhoaHocs] = useState<Course[]>([
    { ten: "Hiệu chuẩn phương tiện đo nhiệt độ, độ ẩm không khí", tuNgay: "05/05/2026", denNgay: "09/05/2026", soHV: 17, donGia: 10000000 },
  ]);

  const [congViecKhac, setCongViecKhac] = useState<OtherJob[]>(DEFAULT_JOBS);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // Initialize dates based on current time
  useEffect(() => {
    const today = new Date();
    const d = String(today.getDate()).padStart(2, "0");
    const m = String(today.getMonth() + 1).padStart(2, "0");
    const y = String(today.getFullYear());
    setNgay(d);
    setThang(m);
    setNam(y);
    setSoNghiemThu(`${y}${m}${d}/BBNT/PGE-PGL`);
    setSoPhuLucHD(`${y}0122.PL01/HĐHT/PGE-PGL`);
  }, []);

  // Update document number when date changes
  useEffect(() => {
    if (ngay && thang && nam) {
      const d = ngay.padStart(2, "0");
      const m = thang.padStart(2, "0");
      setSoNghiemThu(`${nam}${m}${d}/BBNT/PGE-PGL`);
      setSoPhuLucHD(`${nam}0122.PL01/HĐHT/PGE-PGL`);
    }
  }, [ngay, thang, nam]);

  const formatVND = (num: number) => {
    return num.toLocaleString("vi-VN") + " đ";
  };

  const handleAddCourse = () => {
    setKhoaHocs([...khoaHocs, { ten: "", tuNgay: "", denNgay: "", soHV: 1, donGia: 0 }]);
  };

  const handleRemoveCourse = (index: number) => {
    if (khoaHocs.length === 1) return;
    setKhoaHocs(khoaHocs.filter((_, i) => i !== index));
  };

  const handleCourseChange = (index: number, field: keyof Course, val: any) => {
    const next = [...khoaHocs];
    if (field === "soHV" || field === "donGia") {
      next[index][field] = Number(val) || 0;
    } else {
      next[index][field] = val;
    }
    setKhoaHocs(next);
  };

  const handleAddJob = () => {
    setCongViecKhac([...congViecKhac, { noiDung: "", donVi: "Gói", soLuong: 1, donGia: 0 }]);
  };

  const handleRemoveJob = (index: number) => {
    setCongViecKhac(congViecKhac.filter((_, i) => i !== index));
  };

  const handleJobChange = (index: number, field: keyof OtherJob, val: any) => {
    const next = [...congViecKhac];
    if (field === "soLuong" || field === "donGia") {
      next[index][field] = Number(val) || 0;
    } else {
      next[index][field] = val;
    }
    setCongViecKhac(next);
  };

  // Calculations
  const pl1Subtotal = khoaHocs.reduce((s, c) => s + c.soHV * c.donGia, 0);
  const pl1Vat = Math.round(pl1Subtotal * 0.08);
  const pl1Total = pl1Subtotal + pl1Vat;

  const pl2Subtotal = congViecKhac.reduce((s, j) => s + j.soLuong * j.donGia, 0);
  const pl2Vat = Math.round(pl2Subtotal * 0.08);
  const pl2Total = pl2Subtotal + pl2Vat;

  const grandTotal = pl1Total + pl2Total;

  // Word Number Converter (Vietnamese)
  const numToWords = (n: number): string => {
    const units = [
      "",
      "một",
      "hai",
      "ba",
      "bốn",
      "năm",
      "sáu",
      "bảy",
      "tám",
      "chín",
      "mười",
      "mười một",
      "mười hai",
      "mười ba",
      "mười bốn",
      "mười lăm",
      "mười sáu",
      "mười bảy",
      "mười tám",
      "mười chín",
    ];
    const tens = [
      "",
      "mười",
      "hai mươi",
      "ba mươi",
      "bốn mươi",
      "năm mươi",
      "sáu mươi",
      "bảy mươi",
      "tám mươi",
      "chín mươi",
    ];

    if (n === 0) return "không";

    function readMillion(val: number): string {
      let result = "";
      if (val >= 1000000000) {
        result += readMillion(Math.floor(val / 1000000000)) + " tỷ ";
        val %= 1000000000;
      }
      if (val >= 1000000) {
        result += readThousand(Math.floor(val / 1000000)) + " triệu ";
        val %= 1000000;
      }
      if (val >= 1000) {
        result += readThousand(Math.floor(val / 1000)) + " ngàn ";
        val %= 1000;
      }
      if (val > 0) result += readThousand(val);
      return result.trim();
    }

    function readThousand(val: number): string {
      if (val < 20) return units[val];
      if (val < 100) {
        const t = tens[Math.floor(val / 10)];
        const u = val % 10;
        return u === 0 ? t : t + " " + (u === 5 && Math.floor(val / 10) > 1 ? "lăm" : units[u]);
      }
      const h = Math.floor(val / 100);
      const rest = val % 100;
      let result = units[h] + " trăm";
      if (rest > 0 && rest < 10) result += " lẻ " + units[rest];
      else if (rest >= 10) result += " " + readThousand(rest);
      return result;
    }

    return readMillion(n);
  };

  const capitalize = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const handleGenerate = async () => {
    // Validate
    const invalidCourse = khoaHocs.some((k) => !k.ten || !k.tuNgay || !k.denNgay || k.soHV <= 0 || k.donGia < 0);
    const invalidJob = congViecKhac.some((j) => !j.noiDung || !j.donVi || j.soLuong <= 0 || j.donGia < 0);

    if (invalidCourse || invalidJob) {
      toast.error("Vui lòng điền đầy đủ và chính xác thông tin các mục.");
      return;
    }

    setIsGenerating(true);
    try {
      const ngayPad = ngay.padStart(2, "0");
      const thangPad = thang.padStart(2, "0");

      const border = { style: BorderStyle.SINGLE, size: 4, color: "000000" };
      const borders = { top: border, bottom: border, left: border, right: border };
      const noBorder = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
      const noBorders = { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder };
      const cellPad = { top: 80, bottom: 80, left: 100, right: 100 };

      // Helper function to format currency for DOCX table
      const fmtVND = (num: number) => num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");

      const hCell = (text: string, w: number) => {
        return new TableCell({
          borders,
          width: { size: w, type: WidthType.DXA },
          shading: { fill: "D9D9D9", type: ShadingType.CLEAR },
          margins: cellPad,
          verticalAlign: VerticalAlign.CENTER,
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text, bold: true, size: 20, font: "Times New Roman" })],
            }),
          ],
        });
      };

      const dCell = (text: any, w: number, align = AlignmentType.LEFT, bold = false) => {
        return new TableCell({
          borders,
          width: { size: w, type: WidthType.DXA },
          margins: cellPad,
          verticalAlign: VerticalAlign.CENTER,
          children: [
            new Paragraph({
              alignment: align,
              children: [new TextRun({ text: String(text), bold, size: 20, font: "Times New Roman" })],
            }),
          ],
        });
      };

      const noCell = (text: string, w: number) => {
        return new TableCell({
          borders: noBorders,
          width: { size: w, type: WidthType.DXA },
          margins: cellPad,
          children: [
            new Paragraph({
              children: [new TextRun({ text: String(text), size: 24, font: "Times New Roman" })],
            }),
          ],
        });
      };

      const para = (runs: TextRun[], align = AlignmentType.LEFT, sp = { before: 60, after: 60 }) => {
        return new Paragraph({ alignment: align, spacing: sp, children: runs });
      };

      const txt = (text: string, opts = {}) => {
        return new TextRun({ text, font: "Times New Roman", size: 24, ...opts });
      };

      const sp = (n = 1) => {
        return Array(n)
          .fill(null)
          .map(() => para([txt("")]));
      };

      const children: any[] = [];

      // Title & Header of BBNT
      children.push(para([txt("CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM", { bold: true, size: 26 })], AlignmentType.CENTER, { before: 0, after: 40 }));
      children.push(para([txt("Độc lập – Tự do – Hạnh phúc", { bold: true, size: 24 })], AlignmentType.CENTER, { before: 0, after: 40 }));
      children.push(para([txt("─────────────────────", { size: 22 })], AlignmentType.CENTER, { before: 0, after: 200 }));
      children.push(para([txt("BIÊN BẢN NGHIỆM THU ĐÀO TẠO", { bold: true, size: 28 })], AlignmentType.CENTER, { before: 0, after: 80 }));
      children.push(para([txt("Số: " + soNghiemThu, { bold: true, size: 24 })], AlignmentType.CENTER, { before: 0, after: 200 }));

      // References
      children.push(
        para(
          [
            txt("Căn cứ vào Hợp đồng hợp tác đào tạo số ", { italics: true }),
            txt("20250122/HĐHT/PGE-PGL", { italics: true, bold: true }),
            txt(
              " giữa Công ty Cổ phần Giáo dục Phúc Gia và Công ty Cổ phần Phòng thử nghiệm Phúc Gia ký ngày 22 tháng 01 năm 2025;",
              { italics: true }
            ),
          ],
          AlignmentType.BOTH
        )
      );
      children.push(
        para(
          [
            txt("Căn cứ vào Phụ lục hợp đồng hợp tác đào tạo số ", { italics: true }),
            txt(soPhuLucHD, { italics: true, bold: true }),
            txt(
              " giữa Công ty Cổ phần Giáo dục Phúc Gia và Công ty Cổ phần Phòng thử nghiệm Phúc Gia ký ngày 22 tháng 01 năm " +
                nam +
                ";",
              { italics: true }
            ),
          ],
          AlignmentType.BOTH
        )
      );
      children.push(
        para([txt("Căn cứ vào kết quả thực hiện kế hoạch đào tạo giữa Hai Bên.", { italics: true })], AlignmentType.BOTH, {
          before: 60,
          after: 120,
        })
      );
      children.push(
        para([txt("Hôm nay, ngày " + ngayPad + " tháng " + thangPad + " năm " + nam + ", Chúng tôi gồm:")], AlignmentType.BOTH, {
          before: 0,
          after: 120,
        })
      );

      // Party A (PGL)
      children.push(
        new Table({
          width: { size: 9026, type: WidthType.DXA },
          columnWidths: [2500, 6526],
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  borders: noBorders,
                  width: { size: 9026, type: WidthType.DXA },
                  columnSpan: 2,
                  margins: cellPad,
                  children: [para([txt("Bên A. CÔNG TY CỔ PHẦN PHÒNG THỬ NGHIỆM PHÚC GIA (PGL)", { bold: true })])],
                }),
              ],
            }),
            new TableRow({ children: [noCell("Mã số doanh nghiệp:", 2500), noCell("0107509079", 6526)] }),
            new TableRow({
              children: [
                noCell("Trụ sở chính:", 2500),
                noCell("Tòa nhà Hoa Cương, số 18, ngõ 11 Thái Hà, phường Đống Đa, thành phố Hà Nội.", 6526),
              ],
            }),
            new TableRow({
              children: [
                noCell("Người đại diện:", 2500),
                new TableCell({
                  borders: noBorders,
                  width: { size: 6526, type: WidthType.DXA },
                  margins: cellPad,
                  children: [para([txt("Ông "), txt("Lê Tuấn Hiếu", { bold: true }), txt("  |  Chức vụ: Chủ tịch HĐQT")])],
                }),
              ],
            }),
          ],
        })
      );
      children.push(...sp(1));

      // Party B (PGE)
      children.push(
        new Table({
          width: { size: 9026, type: WidthType.DXA },
          columnWidths: [2500, 6526],
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  borders: noBorders,
                  width: { size: 9026, type: WidthType.DXA },
                  columnSpan: 2,
                  margins: cellPad,
                  children: [para([txt("Bên B. CÔNG TY CỔ PHẦN GIÁO DỤC PHÚC GIA (PGE)", { bold: true })])],
                }),
              ],
            }),
            new TableRow({ children: [noCell("Mã số doanh nghiệp:", 2500), noCell("0107498807", 6526)] }),
            new TableRow({
              children: [
                noCell("Trụ sở chính:", 2500),
                noCell("Tầng 3, số 28, ngõ 29/14, phố Nghĩa Dũng, phường Hồng Hà, TP Hà Nội, Việt Nam", 6526),
              ],
            }),
            new TableRow({
              children: [
                noCell("Người đại diện:", 2500),
                new TableCell({
                  borders: noBorders,
                  width: { size: 6526, type: WidthType.DXA },
                  margins: cellPad,
                  children: [para([txt("Ông "), txt("Lê Mạnh Tiến", { bold: true }), txt("  |  Chức vụ: Tổng Giám đốc")])],
                }),
              ],
            }),
          ],
        })
      );
      children.push(...sp(1));

      children.push(
        para(
          [
            txt(
              "Hai Bên thống nhất nghiệm thu kết quả thực hiện kế hoạch đào tạo tháng " +
                thangPad +
                " năm " +
                nam +
                " với những nội dung như sau:"
            ),
          ],
          AlignmentType.BOTH,
          { before: 0, after: 120 }
        )
      );

      // Section titles
      const sT = (numStr: string, title: string) => {
        children.push(para([txt(numStr + ". " + title, { bold: true })], AlignmentType.LEFT, { before: 120, after: 60 }));
      };

      // Section I
      sT("I", "Công việc đã thực hiện");
      children.push(para([txt("Bên B đã thực hiện và hoàn thành công việc:")], AlignmentType.LEFT, { before: 60, after: 60 }));
      children.push(
        para(
          [
            txt("Công tác đào tạo: ", { bold: true }),
            txt(
              "Tổ chức 0" +
                khoaHocs.length +
                " khóa đào tạo chuyên môn cho nhân sự Bên A trong tháng " +
                thangPad +
                "/" +
                nam +
                ". Chi tiết về thời gian, số lượng học viên và loại hình đào tạo được quy định tại Phụ lục I đính kèm."
            ),
          ],
          AlignmentType.BOTH
        )
      );
      children.push(
        para(
          [
            txt("Công tác chuyên môn & Hệ thống: ", { bold: true }),
            txt(
              "Hoàn thành việc chuẩn hóa và dịch thuật tài liệu kỹ thuật; cập nhật thông tin và cảnh báo rủi ro chuyên ngành; duy trì vận hành hệ thống quản lý đào tạo trực tuyến cho toàn bộ nhân sự Bên A theo chi tiết tại Phụ lục II đính kèm."
            ),
          ],
          AlignmentType.BOTH,
          { before: 60, after: 60 }
        )
      );

      // Section II
      sT("II", "Trách nhiệm của Bên B");
      [
        ["Công tác đào tạo:", "Tổ chức lớp học, bố trí giảng viên chuyên môn và cung cấp học liệu/tài liệu theo đúng tiêu chuẩn, yêu cầu của Bên A; thực hiện cấp chứng chỉ cho học viên đạt yêu cầu."],
        ["Công tác chuyên môn:", "Chuẩn hóa, biên dịch tài liệu kỹ thuật; cập nhật kịp thời các thông tin nghiệp vụ và bản tin cảnh báo rủi ro chuyên ngành phục vụ vận hành."],
        ["Quản trị hệ thống:", "Duy trì vận hành ổn định và quản lý hiệu quả hệ thống đào tạo trực tuyến (CLS) cho toàn bộ nhân sự của Bên A."],
      ].forEach(([label, text]) => {
        children.push(para([txt("- "), txt(label, { bold: true }), txt(" " + text)], AlignmentType.BOTH, { before: 40, after: 40 }));
      });

      // Section III
      sT("III", "Trách nhiệm của Bên A");
      [
        "Đảm bảo đáp ứng các điều kiện học tập theo yêu cầu của Bên B.",
        "Cử học viên tham gia đúng đối tượng và bố trí thời gian học tập đầy đủ.",
        "Hai Bên đã hoàn thiện các thủ tục xác nhận danh sách học viên tham gia học khi kết thúc lớp học.",
        "Cung cấp các thông tin cần thiết cho PGE để phục vụ cho hoạt động chuẩn hóa và dịch thuật tài liệu kỹ thuật; cập nhật thông tin và cảnh báo rủi ro chuyên ngành; duy trì vận hành hệ thống quản lý đào tạo trực tuyến cho toàn bộ nhân sự của PGL.",
      ].forEach((t) => {
        children.push(para([txt("- " + t)], AlignmentType.BOTH, { before: 40, after: 40 }));
      });

      // Section IV
      sT("IV", "Trách nhiệm chung của Hai Bên");
      children.push(
        para(
          [txt("Tổng giá trị dịch vụ Bên B đã cung cấp cho Bên A là: "), txt(fmtVND(grandTotal) + " VNĐ.", { bold: true })],
          AlignmentType.BOTH,
          { before: 40, after: 20 }
        )
      );

      const tc = numToWords(grandTotal);
      const tcC = capitalize(tc);
      children.push(
        para([txt("Bằng chữ: ", { italics: true }), txt(tcC + " đồng.", { italics: true, bold: true })], AlignmentType.BOTH, {
          before: 0,
          after: 60,
        })
      );
      children.push(
        para([txt("Bên B có trách nhiệm cung cấp cho Bên A hóa đơn hợp pháp, hợp lệ.")], AlignmentType.BOTH, {
          before: 40,
          after: 40,
        })
      );
      children.push(
        para(
          [
            txt(
              "Bên A có trách nhiệm thanh toán cho Bên B số tiền Hai Bên thống nhất nghiệm thu nói trên trong thời gian không quá mười ngày làm việc kể từ ngày Hai Bên ký Biên bản này."
            ),
          ],
          AlignmentType.BOTH,
          { before: 40, after: 100 }
        )
      );
      children.push(
        para([txt("Biên bản này được lập thành 04 (bốn) bản, mỗi Bên giữ 02 (hai) bản và có pháp lý ngang nhau.")], AlignmentType.BOTH, {
          before: 0,
          after: 200,
        })
      );

      // Signatures
      children.push(
        new Table({
          width: { size: 9026, type: WidthType.DXA },
          columnWidths: [4513, 4513],
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  borders: noBorders,
                  width: { size: 4513, type: WidthType.DXA },
                  margins: cellPad,
                  children: [
                    para([txt("ĐẠI DIỆN BÊN A", { bold: true })], AlignmentType.CENTER),
                    para([txt("CHỦ TỊCH HĐQT", { bold: true })], AlignmentType.CENTER),
                    ...sp(4),
                    para([txt("Lê Tuấn Hiếu", { bold: true })], AlignmentType.CENTER),
                  ],
                }),
                new TableCell({
                  borders: noBorders,
                  width: { size: 4513, type: WidthType.DXA },
                  margins: cellPad,
                  children: [
                    para([txt("ĐẠI DIỆN BÊN B", { bold: true })], AlignmentType.CENTER),
                    para([txt("TỔNG GIÁM ĐỐC", { bold: true })], AlignmentType.CENTER),
                    ...sp(4),
                    para([txt("Lê Mạnh Tiến", { bold: true })], AlignmentType.CENTER),
                  ],
                }),
              ],
            }),
          ],
        })
      );

      // ---- PHỤ LỤC I ----
      children.push(new Paragraph({ children: [new PageBreak()] }));
      children.push(para([txt("PHỤ LỤC I", { bold: true, size: 26 })], AlignmentType.CENTER, { before: 0, after: 40 }));
      children.push(para([txt("DANH SÁCH KHÓA HỌC", { bold: true, size: 26 })], AlignmentType.CENTER, { before: 0, after: 80 }));
      children.push(
        para(
          [
            txt(
              "(Kèm theo Biên bản Nghiệm thu Số: " +
                soNghiemThu +
                " ngày " +
                ngayPad +
                " tháng " +
                thangPad +
                " năm " +
                nam +
                ")",
              { italics: true, size: 22 }
            ),
          ],
          AlignmentType.CENTER,
          { before: 0, after: 160 }
        )
      );

      // PL1 Table configuration
      const cw1 = [500, 3200, 1400, 700, 1363, 1863];
      const ph1 = new TableRow({
        children: [
          hCell("TT", 500),
          hCell("Tên khóa học", 3200),
          hCell("Thời gian thực hiện", 1400),
          hCell("Số lượng học viên", 700),
          hCell("Đơn giá (đ)", 1363),
          hCell("Thành tiền (đ)", 1863),
        ],
      });

      const pd1 = khoaHocs.map(
        (k, i) =>
          new TableRow({
            children: [
              dCell(i + 1, 500, AlignmentType.CENTER),
              dCell(k.ten, 3200),
              dCell(k.tuNgay + " - " + k.denNgay, 1400, AlignmentType.CENTER),
              dCell(k.soHV, 700, AlignmentType.CENTER),
              dCell(fmtVND(k.donGia), 1363, AlignmentType.RIGHT),
              dCell(fmtVND(k.soHV * k.donGia), 1863, AlignmentType.RIGHT),
            ],
          })
      );

      const sw1 = 500 + 3200 + 1400 + 700 + 1363;
      const ps1 = [
        new TableRow({
          children: [
            new TableCell({
              borders,
              width: { size: sw1, type: WidthType.DXA },
              columnSpan: 5,
              margins: cellPad,
              shading: { fill: "D9D9D9", type: ShadingType.CLEAR },
              children: [para([txt("Cộng", { bold: true })], AlignmentType.RIGHT)],
            }),
            dCell(fmtVND(pl1Subtotal), 1863, AlignmentType.RIGHT, true),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({
              borders,
              width: { size: sw1, type: WidthType.DXA },
              columnSpan: 5,
              margins: cellPad,
              shading: { fill: "D9D9D9", type: ShadingType.CLEAR },
              children: [para([txt("Thuế GTGT (8%)", { bold: true })], AlignmentType.RIGHT)],
            }),
            dCell(fmtVND(pl1Vat), 1863, AlignmentType.RIGHT, true),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({
              borders,
              width: { size: sw1, type: WidthType.DXA },
              columnSpan: 5,
              margins: cellPad,
              shading: { fill: "D9D9D9", type: ShadingType.CLEAR },
              children: [para([txt("Tổng", { bold: true })], AlignmentType.RIGHT)],
            }),
            dCell(fmtVND(pl1Total), 1863, AlignmentType.RIGHT, true),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({
              borders,
              width: { size: 9026, type: WidthType.DXA },
              columnSpan: 6,
              margins: cellPad,
              children: [
                para(
                  [
                    txt("Bằng chữ: ", { italics: true }),
                    txt(capitalize(numToWords(pl1Total)) + " đồng.", { italics: true, bold: true }),
                  ],
                  AlignmentType.LEFT
                ),
              ],
            }),
          ],
        }),
      ];
      children.push(new Table({ width: { size: 9026, type: WidthType.DXA }, columnWidths: cw1, rows: [ph1, ...pd1, ...ps1] }));

      // ---- PHỤ LỤC II ----
      children.push(new Paragraph({ children: [new PageBreak()] }));
      children.push(para([txt("PHỤ LỤC II", { bold: true, size: 26 })], AlignmentType.CENTER, { before: 0, after: 40 }));
      children.push(para([txt("CÁC CÔNG VIỆC KHÁC ĐÃ HOÀN THÀNH", { bold: true, size: 26 })], AlignmentType.CENTER, { before: 0, after: 80 }));
      children.push(
        para(
          [
            txt(
              "(Kèm theo Biên bản Nghiệm thu Số: " +
                soNghiemThu +
                " ngày " +
                ngayPad +
                " tháng " +
                thangPad +
                " năm " +
                nam +
                ")",
              { italics: true, size: 22 }
            ),
          ],
          AlignmentType.CENTER,
          { before: 0, after: 160 }
        )
      );

      // PL2 Table configuration
      const cw2 = [500, 3200, 800, 800, 1363, 2363];
      const ph2 = new TableRow({
        children: [
          hCell("TT", 500),
          hCell("Nội dung công việc", 3200),
          hCell("Đơn vị", 800),
          hCell("Số lượng", 800),
          hCell("Đơn giá (đ)", 1363),
          hCell("Thành tiền (đ)", 2363),
        ],
      });

      const pd2 = congViecKhac.map(
        (c, i) =>
          new TableRow({
            children: [
              dCell(i + 1, 500, AlignmentType.CENTER),
              dCell(c.noiDung, 3200),
              dCell(c.donVi, 800, AlignmentType.CENTER),
              dCell(c.soLuong, 800, AlignmentType.CENTER),
              dCell(fmtVND(c.donGia), 1363, AlignmentType.RIGHT),
              dCell(fmtVND(c.soLuong * c.donGia), 2363, AlignmentType.RIGHT),
            ],
          })
      );

      const sw2 = 500 + 3200 + 800 + 800 + 1363;
      const ps2 = [
        new TableRow({
          children: [
            new TableCell({
              borders,
              width: { size: sw2, type: WidthType.DXA },
              columnSpan: 5,
              margins: cellPad,
              shading: { fill: "D9D9D9", type: ShadingType.CLEAR },
              children: [para([txt("Cộng", { bold: true })], AlignmentType.RIGHT)],
            }),
            dCell(fmtVND(pl2Subtotal), 2363, AlignmentType.RIGHT, true),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({
              borders,
              width: { size: sw2, type: WidthType.DXA },
              columnSpan: 5,
              margins: cellPad,
              shading: { fill: "D9D9D9", type: ShadingType.CLEAR },
              children: [para([txt("Thuế GTGT (8%)", { bold: true })], AlignmentType.RIGHT)],
            }),
            dCell(fmtVND(pl2Vat), 2363, AlignmentType.RIGHT, true),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({
              borders,
              width: { size: sw2, type: WidthType.DXA },
              columnSpan: 5,
              margins: cellPad,
              shading: { fill: "D9D9D9", type: ShadingType.CLEAR },
              children: [para([txt("Tổng", { bold: true })], AlignmentType.RIGHT)],
            }),
            dCell(fmtVND(pl2Total), 2363, AlignmentType.RIGHT, true),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({
              borders,
              width: { size: 9026, type: WidthType.DXA },
              columnSpan: 6,
              margins: cellPad,
              children: [
                para(
                  [
                    txt("Bằng chữ: ", { italics: true }),
                    txt(capitalize(numToWords(pl2Total)) + " đồng.", { italics: true, bold: true }),
                  ],
                  AlignmentType.LEFT
                ),
              ],
            }),
          ],
        }),
      ];
      children.push(new Table({ width: { size: 9026, type: WidthType.DXA }, columnWidths: cw2, rows: [ph2, ...pd2, ...ps2] }));

      // Compile document object
      const documentObj = new Document({
        styles: {
          default: {
            document: {
              run: { font: "Times New Roman", size: 24 },
            },
          },
        },
        sections: [
          {
            properties: {
              page: {
                size: { width: 11906, height: 16838 },
                margin: { top: 1134, right: 850, bottom: 1134, left: 1701 },
              },
            },
            children: children,
          },
        ],
      });

      // Generate & Trigger download
      const blob = await Packer.toBlob(documentObj);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${nam}${thangPad}${ngayPad}-BBNT-PGE-PGL.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Đã xuất file .docx thành công!");
    } catch (e: any) {
      toast.error("Lỗi khi tạo file: " + e.message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <ToolLayout
      title="Tạo Biên Bản Nghiệm Thu"
      description="PGE → PGL · Phụ lục II mặc định · Tự động tính toán tổng số tiền hợp đồng"
    >
      <div className="space-y-6 max-w-4xl mx-auto pb-16">
        {/* Date / Metadata Info */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-600" />
            Ngày ký & Số Biên Bản
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Ngày</label>
              <input
                type="text"
                value={ngay}
                onChange={(e) => setNgay(e.target.value)}
                placeholder="30"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Tháng</label>
              <input
                type="text"
                value={thang}
                onChange={(e) => setThang(e.target.value)}
                placeholder="05"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Năm</label>
              <input
                type="text"
                value={nam}
                onChange={(e) => setNam(e.target.value)}
                placeholder="2026"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 pt-2 border-t border-gray-100 justify-between text-xs text-gray-500">
            <div>
              Số Biên Bản: <span className="font-bold text-indigo-600">{soNghiemThu}</span>
            </div>
            <div>
              Số Phụ Lục HĐ: <span className="font-bold text-indigo-600">{soPhuLucHD}</span>
            </div>
          </div>
        </div>

        {/* Phụ Lục I - Danh Sách Khóa Học */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-emerald-600" />
              Phụ lục I — Danh sách khóa học
            </h2>
            <button
              onClick={handleAddCourse}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 font-semibold text-xs border border-emerald-100 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Thêm khóa học
            </button>
          </div>

          <div className="space-y-4">
            {khoaHocs.map((kh, i) => (
              <div key={i} className="p-4 bg-gray-50 border border-gray-200 rounded-xl relative group">
                {khoaHocs.length > 1 && (
                  <button
                    onClick={() => handleRemoveCourse(i)}
                    className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    title="Xóa khóa này"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <div className="font-semibold text-xs text-gray-400 mb-2 uppercase tracking-wide">
                  Khóa học {i + 1}
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Tên khóa học</label>
                    <textarea
                      value={kh.ten}
                      onChange={(e) => handleCourseChange(i, "ten", e.target.value)}
                      placeholder="Nhập tên khóa học..."
                      rows={2}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">Từ ngày</label>
                      <input
                        type="text"
                        value={kh.tuNgay}
                        onChange={(e) => handleCourseChange(i, "tuNgay", e.target.value)}
                        placeholder="05/05/2026"
                        className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">Đến ngày</label>
                      <input
                        type="text"
                        value={kh.denNgay}
                        onChange={(e) => handleCourseChange(i, "denNgay", e.target.value)}
                        placeholder="09/05/2026"
                        className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">Số học viên</label>
                      <input
                        type="number"
                        value={kh.soHV}
                        onChange={(e) => handleCourseChange(i, "soHV", e.target.value)}
                        placeholder="17"
                        min={1}
                        className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">Đơn giá (VNĐ/HV)</label>
                      <input
                        type="number"
                        value={kh.donGia}
                        onChange={(e) => handleCourseChange(i, "donGia", e.target.value)}
                        placeholder="10000000"
                        min={0}
                        className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                      />
                    </div>
                  </div>
                </div>

                <div className="text-right text-xs font-bold text-gray-600 mt-2">
                  Thành tiền: {formatVND(kh.soHV * kh.donGia)}
                </div>
              </div>
            ))}
          </div>

          {/* PL1 Summary */}
          <div className="mt-4 pt-4 border-t border-gray-100 space-y-1.5 text-sm">
            <div className="flex justify-between text-gray-500">
              <span>Cộng:</span>
              <span className="font-semibold">{formatVND(pl1Subtotal)}</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>Thuế GTGT (8%):</span>
              <span className="font-semibold">{formatVND(pl1Vat)}</span>
            </div>
            <div className="flex justify-between text-gray-900 font-bold text-base">
              <span>Tổng phụ lục I:</span>
              <span className="text-emerald-600">{formatVND(pl1Total)}</span>
            </div>
          </div>
        </div>

        {/* Phụ Lục II - Công Việc Khác */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Settings className="w-5 h-5 text-blue-600" />
              Phụ lục II — Công việc khác
            </h2>
            <button
              onClick={handleAddJob}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 font-semibold text-xs border border-blue-100 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Thêm công việc
            </button>
          </div>

          <div className="space-y-4">
            {congViecKhac.map((job, i) => (
              <div key={i} className="p-4 bg-gray-50 border border-gray-200 rounded-xl relative group">
                <button
                  onClick={() => handleRemoveJob(i)}
                  className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                  title="Xóa công việc này"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="font-semibold text-xs text-gray-400 mb-2 uppercase tracking-wide">
                  Công việc {i + 1}
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Nội dung công việc</label>
                    <textarea
                      value={job.noiDung}
                      onChange={(e) => handleJobChange(i, "noiDung", e.target.value)}
                      placeholder="Nhập nội dung công việc..."
                      rows={2}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">Đơn vị</label>
                      <input
                        type="text"
                        value={job.donVi}
                        onChange={(e) => handleJobChange(i, "donVi", e.target.value)}
                        placeholder="Gói"
                        className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">Số lượng</label>
                      <input
                        type="number"
                        value={job.soLuong}
                        onChange={(e) => handleJobChange(i, "soLuong", e.target.value)}
                        placeholder="1"
                        min={1}
                        className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">Đơn giá (VNĐ)</label>
                      <input
                        type="number"
                        value={job.donGia}
                        onChange={(e) => handleJobChange(i, "donGia", e.target.value)}
                        placeholder="150000000"
                        min={0}
                        className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                      />
                    </div>
                  </div>
                </div>

                <div className="text-right text-xs font-bold text-gray-600 mt-2">
                  Thành tiền: {formatVND(job.soLuong * job.donGia)}
                </div>
              </div>
            ))}
          </div>

          {/* PL2 Summary */}
          <div className="mt-4 pt-4 border-t border-gray-100 space-y-1.5 text-sm">
            <div className="flex justify-between text-gray-500">
              <span>Cộng:</span>
              <span className="font-semibold">{formatVND(pl2Subtotal)}</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>Thuế GTGT (8%):</span>
              <span className="font-semibold">{formatVND(pl2Vat)}</span>
            </div>
            <div className="flex justify-between text-gray-900 font-bold text-base">
              <span>Tổng phụ lục II:</span>
              <span className="text-blue-600">{formatVND(pl2Total)}</span>
            </div>
          </div>
        </div>

        {/* Grand Total */}
        <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-2xl p-6 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="text-sm font-semibold text-indigo-100 uppercase tracking-wider">Tổng giá trị hợp đồng</div>
            <div className="text-xs text-indigo-200 mt-1 italic font-medium">
              Bằng chữ: {capitalize(numToWords(grandTotal))} đồng
            </div>
          </div>
          <div className="text-3xl font-black">{formatVND(grandTotal)}</div>
        </div>

        {/* Generate / Action Button */}
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full py-4 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 active:scale-[0.99] transition-all flex items-center justify-center gap-2 font-bold shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-base cursor-pointer"
        >
          {isGenerating ? (
            <>
              <Sparkles className="w-5 h-5 animate-spin" />
              Đang tạo file...
            </>
          ) : (
            <>
              <Download className="w-5 h-5" />
              ⬇ Xuất file nghiệm thu .docx
            </>
          )}
        </button>
      </div>
    </ToolLayout>
  );
}
