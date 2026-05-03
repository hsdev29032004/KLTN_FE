'use client';

import { useEffect, useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Check, ChevronDown, X } from 'lucide-react';
import SDK from '@/stores/sdk';

interface Topic {
    id: string;
    name: string;
    slug: string;
}

interface TopicMultiSelectProps {
    value: string[];
    onChange: (ids: string[]) => void;
}

export function TopicMultiSelect({ value, onChange }: TopicMultiSelectProps) {
    const [open, setOpen] = useState(false);
    const [topics, setTopics] = useState<Topic[]>([]);

    useEffect(() => {
        SDK.getInstance()
            .getAllTopics()
            .then((res) => setTopics(res.data))
            .catch(() => { });
    }, []);

    const toggle = (id: string) => {
        onChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id]);
    };

    const remove = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        onChange(value.filter((v) => v !== id));
    };

    const selectedTopics = topics.filter((t) => value.includes(t.id));

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <div
                    className="min-h-9 w-full flex flex-wrap gap-1 items-center rounded-md border border-input bg-transparent px-3 py-1.5 text-sm cursor-pointer hover:bg-accent/50 transition-colors"
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') setOpen(true);
                    }}
                >
                    {selectedTopics.length === 0 ? (
                        <span className="text-muted-foreground">Chọn chủ đề...</span>
                    ) : (
                        selectedTopics.map((t) => (
                            <Badge key={t.id} variant="secondary" className="gap-1 pr-1">
                                {t.name}
                                <button
                                    type="button"
                                    className="rounded-sm opacity-70 hover:opacity-100"
                                    onClick={(e) => remove(t.id, e)}
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </Badge>
                        ))
                    )}
                    <ChevronDown className="ml-auto h-4 w-4 shrink-0 text-muted-foreground" />
                </div>
            </PopoverTrigger>
            <PopoverContent
                className="w-[--radix-popover-trigger-width] p-1"
                align="start"
                sideOffset={4}
            >
                <div className="max-h-56 overflow-y-auto">
                    {topics.length === 0 && (
                        <p className="py-3 text-center text-sm text-muted-foreground">Đang tải...</p>
                    )}
                    {topics.map((topic) => {
                        const selected = value.includes(topic.id);
                        return (
                            <div
                                key={topic.id}
                                className={`flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm cursor-pointer select-none hover:bg-accent ${selected ? 'text-primary font-medium' : ''
                                    }`}
                                onClick={() => toggle(topic.id)}
                            >
                                <Check className={`h-4 w-4 shrink-0 ${selected ? 'opacity-100' : 'opacity-0'}`} />
                                {topic.name}
                            </div>
                        );
                    })}
                </div>
            </PopoverContent>
        </Popover>
    );
}
