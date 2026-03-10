import { Link } from "react-router";
import { LucideIcon } from "lucide-react";

interface ToolCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  color: string;
}

export function ToolCard({ title, description, icon: Icon, href, color }: ToolCardProps) {
  return (
    <Link
      to={href}
      aria-label={`Sử dụng công cụ ${title}`}
      className="group p-6 bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all"
    >
      <div className={`w-12 h-12 rounded-lg ${color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <h4 className="font-semibold text-gray-900 mb-2">{title}</h4>
      <p className="text-sm text-gray-600">{description}</p>
    </Link>
  );
}
