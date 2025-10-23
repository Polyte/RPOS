import { ChevronRightIcon, HomeIcon } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ComponentType<any>;
  onClick?: () => void;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className = '' }: BreadcrumbProps) {
  return (
    <nav className={`flex items-center space-x-2 text-sm ${className}`} aria-label="Breadcrumb">
      <div className="flex items-center space-x-2">
        <HomeIcon className="w-4 h-4 text-gray-500" />
        <span className="text-gray-500">Roxton POS</span>
      </div>
      
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        const IconComponent = item.icon;
        
        return (
          <div key={index} className="flex items-center space-x-2">
            <ChevronRightIcon className="w-4 h-4 text-gray-400" />
            
            {item.onClick || item.href ? (
              <button
                onClick={item.onClick}
                className={`flex items-center gap-2 hover:text-blue-600 transition-colors duration-200 ${
                  isLast ? 'text-gray-900 font-medium' : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                {IconComponent && <IconComponent className="w-4 h-4" />}
                {item.label}
              </button>
            ) : (
              <span className={`flex items-center gap-2 ${
                isLast ? 'text-gray-900 font-medium' : 'text-gray-600'
              }`}>
                {IconComponent && <IconComponent className="w-4 h-4" />}
                {item.label}
              </span>
            )}
          </div>
        );
      })}
    </nav>
  );
}