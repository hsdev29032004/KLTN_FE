'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';

const MATERIAL_ICON: Record<string, string> = {
  video: '🎥',
  img: '🖼️',
  pdf: '📄',
  file: '📎',
};

interface Material {
  id: string;
  name: string;
  type: string;
  isPreview?: boolean;
}

interface LessonItemProps {
  lesson: {
    id: string;
    name: string;
    status: string;
    materials?: Material[];
  };
  defaultOpen?: boolean;
  onPreview: (material: Material) => void;
}

export function LessonItem({ lesson, defaultOpen = false, onPreview }: LessonItemProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const materials = lesson.materials ?? [];

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="overflow-hidden">
        <CollapsibleTrigger asChild>
          <div className="flex cursor-pointer items-center justify-between p-4 hover:shadow-md">
            <div className="flex-1">
              <h3 className="mb-2 font-semibold">{lesson.name}</h3>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>{materials.length} tài liệu</span>
                <Badge variant="secondary" className="capitalize">
                  {lesson.status}
                </Badge>
              </div>
            </div>
            {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="border-t p-4">
            {materials.length > 0 ? (
              <div className="mt-1 flex flex-col gap-2">
                {materials.map((material) => (
                  <div key={material.id} className="flex items-center justify-between">
                    <span>
                      {MATERIAL_ICON[material.type] ?? '📄'} {material.name}
                    </span>
                    {material.isPreview && (
                      <button
                        onClick={() => onPreview(material)}
                        className="ml-1 text-xs text-blue-500 hover:underline"
                      >
                        Xem trước
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Không có tài liệu</p>
            )}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}