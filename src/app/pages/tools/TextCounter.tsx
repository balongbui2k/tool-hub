import { useState, useMemo } from "react";
import { ToolLayout } from "../../components/ToolLayout";

export function TextCounter() {
  const [text, setText] = useState("");

  const stats = useMemo(() => {
    const words = text.trim().split(/\s+/).filter((word) => word.length > 0);
    const characters = text.length;
    const charactersNoSpaces = text.replace(/\s/g, "").length;
    const paragraphs = text
      .split(/\n\n+/)
      .filter((para) => para.trim().length > 0).length;
    const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0).length;

    return {
      words: words.length,
      characters,
      charactersNoSpaces,
      paragraphs,
      sentences,
    };
  }, [text]);

  return (
    <ToolLayout
      title="Word Counter"
      description="Count words, characters, sentences, and paragraphs"
    >
      <div className="space-y-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Start typing or paste your text here..."
            className="w-full h-64 p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-1">{stats.words}</div>
            <div className="text-sm text-gray-600">Words</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-1">{stats.characters}</div>
            <div className="text-sm text-gray-600">Characters</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-1">
              {stats.charactersNoSpaces}
            </div>
            <div className="text-sm text-gray-600">No Spaces</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-1">{stats.sentences}</div>
            <div className="text-sm text-gray-600">Sentences</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-1">{stats.paragraphs}</div>
            <div className="text-sm text-gray-600">Paragraphs</div>
          </div>
        </div>

        <div className="bg-green-50 rounded-xl p-6 border border-green-100">
          <h3 className="font-semibold text-gray-900 mb-3">Additional Stats</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-700">Average word length:</span>
              <span className="font-medium text-gray-900">
                {stats.words > 0
                  ? (stats.charactersNoSpaces / stats.words).toFixed(1)
                  : 0}{" "}
                chars
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Reading time:</span>
              <span className="font-medium text-gray-900">
                {Math.ceil(stats.words / 200)} min
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Speaking time:</span>
              <span className="font-medium text-gray-900">
                {Math.ceil(stats.words / 150)} min
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Words per sentence:</span>
              <span className="font-medium text-gray-900">
                {stats.sentences > 0 ? (stats.words / stats.sentences).toFixed(1) : 0}
              </span>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
