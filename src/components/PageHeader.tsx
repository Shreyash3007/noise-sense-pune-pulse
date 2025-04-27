import React, { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({ 
  title, 
  description, 
  icon 
}) => {
  return (
    <div className="flex items-center gap-4 mb-6">
      {icon && (
        <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary">
          {icon}
        </div>
      )}
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        {description && (
          <p className="text-muted-foreground mt-1">{description}</p>
        )}
      </div>
    </div>
  );
};

export default PageHeader; 