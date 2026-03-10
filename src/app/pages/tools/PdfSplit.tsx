import { useState } from "react";
import { ToolLayout } from "../../components/ToolLayout";
import { FileUploader } from "../../components/FileUploader";
import { Download } from "lucide-react";

export function PdfSplit() {
  const [file, setFile] = useState<File | null>(null);
  const [pageRange, setPageRange] = useState({ from: 1, to: 1 });

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
  };

  const handleSplit = () => {
    alert("In a real implementation, the split PDF would download here");
  };

  return (
    <ToolLayout
      title="Split PDF"
      description="Extract specific pages from your PDF document"
    >
      {!file ? (
        <FileUploader
          accept=".pdf"
          onFileSelect={handleFileSelect}
          title="Upload PDF File"
          description="Choose a PDF to split"
        />
      ) : (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Select Page Range</h3>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm text-gray-700 mb-2">From Page</label>
                <input
                  type="number"
                  min="1"
                  value={pageRange.from}
                  onChange={(e) =>
                    setPageRange({ ...pageRange, from: parseInt(e.target.value) })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-2">To Page</label>
                <input
                  type="number"
                  min="1"
                  value={pageRange.to}
                  onChange={(e) =>
                    setPageRange({ ...pageRange, to: parseInt(e.target.value) })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleSplit}
                className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
              >
                <Download className="w-5 h-5" />
                Split & Download
              </button>
              <button
                onClick={() => setFile(null)}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Upload Another
              </button>
            </div>
          </div>

          <div className="bg-red-50 rounded-xl p-6 border border-red-100">
            <h3 className="font-semibold text-gray-900 mb-3">How to use</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-red-600 mt-1">•</span>
                <span>Enter the page range you want to extract</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 mt-1">•</span>
                <span>Click "Split & Download" to get your new PDF</span>
              </li>
            </ul>
          </div>
        </div>
      )}
    </ToolLayout>
  );
}
