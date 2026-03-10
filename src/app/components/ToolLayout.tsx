import { Header } from "./Header";
import { Footer } from "./Footer";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router";

interface ToolLayoutProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

export function ToolLayout({ title, description, children }: ToolLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to all tools
          </Link>
          
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-3">{title}</h1>
            <p className="text-lg text-gray-600">{description}</p>
          </div>
          
          {children}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
