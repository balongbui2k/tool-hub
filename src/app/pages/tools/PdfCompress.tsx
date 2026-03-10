import { useState } from "react";
import { ToolLayout } from "../../components/ToolLayout";
import { FileUploader } from "../../components/FileUploader";
import { Download, FileText, CheckCircle } from "lucide-react";

export function PdfCompress() {
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [processed, setProcessed] = useState(false);

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setProcessed(false);
    // Simulate processing
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      setProcessed(true);
    }, 2000);
  };

  const handleDownload = () => {
    // Mock download functionality
    alert("In a real implementation, the compressed PDF would download here");
  };

  return (
    <ToolLayout
      title="Compress PDF"
      description="Reduce your PDF file size while maintaining quality"
    >
      {!file ? (
        <FileUploader
          accept=".pdf"
          onFileSelect={handleFileSelect}
          title="Upload PDF File"
          description="Choose a PDF to compress"
        />
      ) : (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <FileText className="w-6 h-6 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">{file.name}</h3>
                <p className="text-sm text-gray-600">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
                {processing && (
                  <div className="mt-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: "70%" }}></div>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">Compressing...</p>
                  </div>
                )}
                {processed && (
                  <div className="mt-4 flex items-center gap-2 text-green-600">
                    <CheckCircle className="w-5 h-5" />
                    <span className="text-sm font-medium">Compressed successfully! Size reduced by 40%</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {processed && (
            <div className="flex gap-4">
              <button
                onClick={handleDownload}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <Download className="w-5 h-5" />
                Download Compressed PDF
              </button>
              <button
                onClick={() => {
                  setFile(null);
                  setProcessed(false);
                }}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Compress Another
              </button>
            </div>
          )}
        </div>
      )}

      <div className="mt-12 bg-blue-50 rounded-xl p-6 border border-blue-100">
        <h3 className="font-semibold text-gray-900 mb-3">How it works</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-1">•</span>
            <span>Upload your PDF file (max 100MB)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-1">•</span>
            <span>We compress your file using advanced algorithms</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-1">•</span>
            <span>Download the optimized PDF with reduced file size</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-1">•</span>
            <span>Files are automatically deleted after 1 hour for your security</span>
          </li>
        </ul>
      </div>
    </ToolLayout>
  );
}
