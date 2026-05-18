import { ChevronRight, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";

interface BreadcrumbItem {
  label: string;
  onClick?: () => void;
  to?: string;
  icon?: ReactNode;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  const navigate = useNavigate();

  const handleItemClick = (item: BreadcrumbItem) => {
    if (item.to) {
      navigate(item.to);
    } else if (item.onClick) {
      item.onClick();
    }
  };

  return (
    <nav className="flex items-center gap-2 text-sm mb-6">
      <Home className="w-4 h-4 text-gray-400" />

      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          <ChevronRight className="w-4 h-4 text-gray-400" />

          {item.to ? (
            <Link
              to={item.to}
              className="flex items-center gap-1.5 text-gray-700 font-medium hover:text-blue-600 transition-colors"
            >
              {item.icon}
              {item.label}
            </Link>
          ) : (
            <button
              onClick={() => handleItemClick(item)}
              className="flex items-center gap-1.5 text-gray-700 font-medium hover:text-blue-600 transition-colors"
            >
              {item.icon}
              {item.label}
            </button>
          )}
        </div>
      ))}
    </nav>
  );
}
