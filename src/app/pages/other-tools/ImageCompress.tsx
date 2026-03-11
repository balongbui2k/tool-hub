import { useState } from "react";
import { ToolLayout } from "../../components/ToolLayout";
import { FileUploader } from "../../components/FileUploader";
import { Download, Image, CheckCircle } from "lucide-react";

export function ImageCompress() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [processing, setProcessing] = useState(false);
  const [processed, setProcessed] = useState(false);

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setProcessed(false);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(selectedFile);
    
    // Simulate processing
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      setProcessed(true);
    }, 2000);
  };

  const handleDownload = () => {
    alert("In a real implementation, the compressed image would download here");
  };

  return (
    <ToolLayout
      title="Compress Image"
      description="Reduce image file size without losing quality"
    >
      {!file ? (
        <FileUploader
          accept="image/*"
          onFileSelect={handleFileSelect}
          title="Upload Image"
          description="Supports JPG, PNG, WebP, and more"
        />
      ) : (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                {preview && (
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full h-64 object-contain bg-gray-50 rounded-lg"
                  />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Image className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">{file.name}</h3>
                    <p className="text-sm text-gray-600">
                      Original: {(file.size / 1024).toFixed(2)} KB
                    </p>
                    {processing && (
                      <div className="mt-4">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-purple-600 h-2 rounded-full animate-pulse" style={{ width: "70%" }}></div>
                        </div>
                        <p className="text-sm text-gray-600 mt-2">Compressing...</p>
                      </div>
                    )}
                    {processed && (
                      <div className="mt-4">
                        <div className="flex items-center gap-2 text-green-600 mb-2">
                          <CheckCircle className="w-5 h-5" />
                          <span className="text-sm font-medium">Compressed!</span>
                        </div>
                        <p className="text-sm text-gray-600">
                          New size: {((file.size * 0.6) / 1024).toFixed(2)} KB
                          <span className="text-green-600 ml-2">(40% smaller)</span>
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {processed && (
            <div className="flex gap-4">
              <button
                onClick={handleDownload}
                className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
              >
                <Download className="w-5 h-5" />
                Download Compressed Image
              </button>
              <button
                onClick={() => {
                  setFile(null);
                  setPreview("");
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

      <div className="mt-12 bg-purple-50 rounded-xl p-6 border border-purple-100">
        <h3 className="font-semibold text-gray-900 mb-3">Features</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex items-start gap-2">
            <span className="text-purple-600 mt-1">•</span>
            <span>Supports JPG, PNG, WebP, and GIF formats</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-600 mt-1">•</span>
            <span>Smart compression maintains visual quality</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-600 mt-1">•</span>
            <span>Reduce file size by up to 80%</span>
          </li>
        </ul>
      </div>
    </ToolLayout>
  );
}
