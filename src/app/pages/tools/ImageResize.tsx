import { useState } from "react";
import { ToolLayout } from "../../components/ToolLayout";
import { FileUploader } from "../../components/FileUploader";
import { Download, Image } from "lucide-react";

export function ImageResize() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleResize = () => {
    alert("In a real implementation, the resized image would download here");
  };

  return (
    <ToolLayout
      title="Resize Image"
      description="Change image dimensions quickly and easily"
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
            {preview && (
              <img
                src={preview}
                alt="Preview"
                className="w-full h-64 object-contain bg-gray-50 rounded-lg mb-6"
              />
            )}
            
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Image className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">{file.name}</h3>
                <p className="text-sm text-gray-600">{(file.size / 1024).toFixed(2)} KB</p>
              </div>
            </div>

            <h3 className="font-semibold text-gray-900 mb-4">New Dimensions</h3>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm text-gray-700 mb-2">Width (px)</label>
                <input
                  type="number"
                  value={dimensions.width}
                  onChange={(e) =>
                    setDimensions({ ...dimensions, width: parseInt(e.target.value) })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-2">Height (px)</label>
                <input
                  type="number"
                  value={dimensions.height}
                  onChange={(e) =>
                    setDimensions({ ...dimensions, height: parseInt(e.target.value) })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleResize}
                className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
              >
                <Download className="w-5 h-5" />
                Resize & Download
              </button>
              <button
                onClick={() => {
                  setFile(null);
                  setPreview("");
                }}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Upload Another
              </button>
            </div>
          </div>

          <div className="bg-purple-50 rounded-xl p-6 border border-purple-100">
            <h3 className="font-semibold text-gray-900 mb-3">Quick Presets</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <button
                onClick={() => setDimensions({ width: 1920, height: 1080 })}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:border-purple-500 transition-colors text-sm"
              >
                1920×1080
              </button>
              <button
                onClick={() => setDimensions({ width: 1280, height: 720 })}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:border-purple-500 transition-colors text-sm"
              >
                1280×720
              </button>
              <button
                onClick={() => setDimensions({ width: 800, height: 600 })}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:border-purple-500 transition-colors text-sm"
              >
                800×600
              </button>
              <button
                onClick={() => setDimensions({ width: 400, height: 400 })}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:border-purple-500 transition-colors text-sm"
              >
                400×400
              </button>
            </div>
          </div>
        </div>
      )}
    </ToolLayout>
  );
}
