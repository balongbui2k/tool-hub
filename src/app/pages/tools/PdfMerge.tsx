import { useState } from "react";
import { ToolLayout } from "../../components/ToolLayout";
import { Upload, Download, FileText, X } from "lucide-react";

export function PdfMerge() {
  const [files, setFiles] = useState<File[]>([]);
  const [processing, setProcessing] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    setFiles([...files, ...selectedFiles]);
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleMerge = () => {
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      alert("In a real implementation, the merged PDF would download here");
    }, 2000);
  };

  return (
    <ToolLayout
      title="Merge PDF"
      description="Combine multiple PDF files into a single document"
    >
      <div className="space-y-6">
        <div className="border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center bg-white hover:border-gray-400 transition-colors">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <Upload className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Add PDF Files</h3>
            <p className="text-gray-600 mb-6">Select multiple PDFs to merge</p>
            <label className="inline-block">
              <input
                type="file"
                accept=".pdf"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
              <span className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 cursor-pointer transition-colors inline-block">
                Choose Files
              </span>
            </label>
          </div>
        </div>

        {files.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">
              Files to merge ({files.length})
            </h3>
            <div className="space-y-3 mb-6">
              {files.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"
                >
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-red-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{file.name}</p>
                    <p className="text-sm text-gray-600">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <button
                    onClick={() => removeFile(index)}
                    className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={handleMerge}
              disabled={processing || files.length < 2}
              className="w-full px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {processing ? (
                "Merging..."
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  Merge PDFs
                </>
              )}
            </button>
          </div>
        )}

        <div className="bg-red-50 rounded-xl p-6 border border-red-100">
          <h3 className="font-semibold text-gray-900 mb-3">Tips</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-red-600 mt-1">•</span>
              <span>Drag files to reorder them before merging</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-600 mt-1">•</span>
              <span>You can merge up to 20 PDF files at once</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-600 mt-1">•</span>
              <span>The final document maintains the original quality</span>
            </li>
          </ul>
        </div>
      </div>
    </ToolLayout>
  );
}
