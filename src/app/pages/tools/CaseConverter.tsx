import { useState } from "react";
import { ToolLayout } from "../../components/ToolLayout";
import { Copy, Check } from "lucide-react";

export function CaseConverter() {
  const [text, setText] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  const conversions = [
    {
      label: "Sentence case",
      convert: (str: string) =>
        str.charAt(0).toUpperCase() + str.slice(1).toLowerCase(),
    },
    {
      label: "lowercase",
      convert: (str: string) => str.toLowerCase(),
    },
    {
      label: "UPPERCASE",
      convert: (str: string) => str.toUpperCase(),
    },
    {
      label: "Title Case",
      convert: (str: string) =>
        str
          .toLowerCase()
          .split(" ")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" "),
    },
    {
      label: "camelCase",
      convert: (str: string) => {
        const words = str.toLowerCase().split(" ");
        return (
          words[0] +
          words
            .slice(1)
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join("")
        );
      },
    },
    {
      label: "snake_case",
      convert: (str: string) => str.toLowerCase().replace(/\s+/g, "_"),
    },
  ];

  const copyToClipboard = (convertedText: string, label: string) => {
    navigator.clipboard.writeText(convertedText);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <ToolLayout
      title="Case Converter"
      description="Convert text to different cases instantly"
    >
      <div className="space-y-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Enter your text
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type or paste your text here..."
            className="w-full h-32 p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
          />
        </div>

        {text && (
          <div className="space-y-4">
            {conversions.map((conversion) => {
              const convertedText = conversion.convert(text);
              const isCopied = copied === conversion.label;

              return (
                <div
                  key={conversion.label}
                  className="bg-white rounded-xl border border-gray-200 p-6"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900">{conversion.label}</h3>
                    <button
                      onClick={() => copyToClipboard(convertedText, conversion.label)}
                      className="flex items-center gap-2 px-3 py-1.5 text-sm bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-4 h-4" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          Copy
                        </>
                      )}
                    </button>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg text-gray-900 font-mono text-sm break-words">
                    {convertedText}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="bg-green-50 rounded-xl p-6 border border-green-100">
          <h3 className="font-semibold text-gray-900 mb-3">Available Conversions</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-1">•</span>
              <span>Sentence case - First letter capitalized</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-1">•</span>
              <span>lowercase - All letters lowercase</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-1">•</span>
              <span>UPPERCASE - All letters uppercase</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-1">•</span>
              <span>Title Case - First Letter Of Each Word Capitalized</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-1">•</span>
              <span>camelCase - First word lowercase, others capitalized</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-1">•</span>
              <span>snake_case - Words separated by underscores</span>
            </li>
          </ul>
        </div>
      </div>
    </ToolLayout>
  );
}
