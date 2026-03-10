import { Upload } from "lucide-react";
import { useCallback, useState } from "react";

interface FileUploaderProps {
  accept?: string;
  onFileSelect: (file: File) => void;
  title: string;
  description: string;
}

export function FileUploader({ accept, onFileSelect, title, description }: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      
      const file = e.dataTransfer.files[0];
      if (file) {
        onFileSelect(file);
      }
    },
    [onFileSelect]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        onFileSelect(file);
      }
    },
    [onFileSelect]
  );

  return (
    <div
      className={`border-2 border-dashed rounded-2xl p-12 text-center transition-colors ${
        isDragging
          ? "border-blue-500 bg-blue-50"
          : "border-gray-300 bg-white hover:border-gray-400"
      }`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <div className="flex flex-col items-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
          <Upload className="w-8 h-8 text-blue-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 mb-6">{description}</p>
        <label className="inline-block">
          <input
            type="file"
            accept={accept}
            onChange={handleFileInput}
            className="hidden"
          />
          <span className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors inline-block">
            Choose File
          </span>
        </label>
        <p className="text-sm text-gray-500 mt-4">or drag and drop your file here</p>
      </div>
    </div>
  );
}
