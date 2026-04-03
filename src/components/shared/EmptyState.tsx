'use client';

import { PackageOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  ctaText?: string;
  onCtaClick?: () => void;
}

export default function EmptyState({ icon, title, description, ctaText, onCtaClick }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="mb-4 text-muted-foreground">
        {icon || <PackageOpen className="h-16 w-16" strokeWidth={1} />}
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground max-w-md mb-6">{description}</p>
      {ctaText && onCtaClick && (
        <Button onClick={onCtaClick} className="bg-primary hover:bg-primary/90 text-primary-foreground">
          {ctaText}
        </Button>
      )}
    </div>
  );
}
