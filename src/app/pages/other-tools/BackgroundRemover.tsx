import { useState } from "react";
import { ToolLayout } from "../../components/ToolLayout";
import { FileUploader } from "../../components/FileUploader";
import { Download, CheckCircle } from "lucide-react";

export function BackgroundRemover() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [processing, setProcessing] = useState(false);
  const [processed, setProcessed] = useState(false);

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setProcessed(false);
    
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
    }, 3000);
  };

  const handleDownload = () => {
    alert("In a real implementation, the image without background would download here");
  };

  return (
    <ToolLayout
      title="Remove Background"
      description="Automatically remove backgrounds from images using AI"
    >
      {!file ? (
        <FileUploader
          accept="image/*"
          onFileSelect={handleFileSelect}
          title="Upload Image"
          description="Works best with portraits and products"
        />
      ) : (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Original</h4>
                {preview && (
                  <img
                    src={preview}
                    alt="Original"
                    className="w-full h-64 object-contain bg-gray-50 rounded-lg"
                  />
                )}
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  {processing ? "Processing..." : processed ? "No Background" : "Result"}
                </h4>
                <div className="w-full h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                  {processing ? (
                    <div className="text-center">
                      <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                      <p className="text-sm text-gray-600">Removing background...</p>
                    </div>
                  ) : processed ? (
                    preview && (
                      <div className="relative w-full h-full">
                        <div
                          className="absolute inset-0 rounded-lg"
                          style={{
                            backgroundImage:
                              "linear-gradient(45deg, #f0f0f0 25%, transparent 25%), linear-gradient(-45deg, #f0f0f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f0f0f0 75%), linear-gradient(-45deg, transparent 75%, #f0f0f0 75%)",
                            backgroundSize: "20px 20px",
                            backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px",
                          }}
                        ></div>
                        <img
                          src={preview}
                          alt="Processed"
                          className="relative w-full h-full object-contain"
                        />
                      </div>
                    )
                  ) : (
                    <p className="text-sm text-gray-400">Preview will appear here</p>
                  )}
                </div>
              </div>
            </div>

            {processed && (
              <div className="flex items-center gap-2 text-green-600 mb-4">
                <CheckCircle className="w-5 h-5" />
                <span className="text-sm font-medium">Background removed successfully!</span>
              </div>
            )}

            <div className="flex gap-4">
              {processed && (
                <button
                  onClick={handleDownload}
                  className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Download PNG
                </button>
              )}
              <button
                onClick={() => {
                  setFile(null);
                  setPreview("");
                  setProcessed(false);
                }}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {processed ? "Remove Another" : "Cancel"}
              </button>
            </div>
          </div>

          <div className="bg-purple-50 rounded-xl p-6 border border-purple-100">
            <h3 className="font-semibold text-gray-900 mb-3">Best Practices</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-purple-600 mt-1">•</span>
                <span>Use high-quality images for better results</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600 mt-1">•</span>
                <span>Works best with clear subject-background separation</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600 mt-1">•</span>
                <span>Download as PNG to preserve transparency</span>
              </li>
            </ul>
          </div>
        </div>
      )}
    </ToolLayout>
  );
}
