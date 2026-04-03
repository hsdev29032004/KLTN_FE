'use client';

import { useRef, useState } from 'react';
import { Plus, X, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { RichTextEditor, RichTextEditorRef } from '@/components/common/rich-text-editor';
import SDK from '@/stores/sdk';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export function CreateCourseButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        <Plus className="mr-1 h-4 w-4" /> Tạo khóa học
      </Button>
      {open && <CourseDialog open={open} onClose={() => setOpen(false)} />}
    </>
  );
}

function CourseDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [contentParts, setContentParts] = useState<string[]>(['']);
  const descRef = useRef<RichTextEditorRef>(null);
  const [loading, setLoading] = useState(false);

  const addContentPart = () => setContentParts((prev) => [...prev, '']);
  const removeContentPart = (idx: number) =>
    setContentParts((prev) => prev.filter((_, i) => i !== idx));
  const updateContentPart = (idx: number, value: string) =>
    setContentParts((prev) => prev.map((v, i) => (i === idx ? value : v)));

  const handleSubmit = async () => {
    if (!name.trim() || !price.trim() || !thumbnail.trim()) {
      toast.error('Vui lòng điền tên, giá và thumbnail');
      return;
    }
    setLoading(true);
    try {
      const content = contentParts.filter((p) => p.trim()).join('|');
      const description = descRef.current?.getContent() ?? '';
      const sdk = SDK.getInstance();
      const res = await sdk.createCourse({
        name: name.trim(),
        price: Number(price),
        thumbnail: thumbnail.trim(),
        content,
        description,
      });
      const data = (res as any).data || res;
      toast.success('Tạo khóa học thành công');
      onClose();
      router.push(`/lecturer/courses/${data.id}`);
    } catch {
      // error handled by interceptor
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tạo khóa học mới</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid gap-1.5">
            <Label>Tên khóa học</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nhập tên khóa học" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-1.5">
              <Label>Giá (VNĐ)</Label>
              <Input type="number" min={0} value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0" />
            </div>
            <div className="grid gap-1.5">
              <Label>Thumbnail URL</Label>
              <Input value={thumbnail} onChange={(e) => setThumbnail(e.target.value)} placeholder="https://..." />
            </div>
          </div>

          <div className="grid gap-1.5">
            <div className="flex items-center justify-between">
              <Label>Nội dung (content)</Label>
              <Button type="button" variant="outline" size="sm" onClick={addContentPart}>
                <Plus className="mr-1 h-3 w-3" /> Thêm mục
              </Button>
            </div>
            <div className="space-y-2">
              {contentParts.map((part, idx) => (
                <div key={idx} className="flex gap-2">
                  <Input
                    value={part}
                    onChange={(e) => updateContentPart(idx, e.target.value)}
                    placeholder={`Nội dung ${idx + 1}`}
                  />
                  {contentParts.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="shrink-0"
                      onClick={() => removeContentPart(idx)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-1.5">
            <Label>Mô tả</Label>
            <RichTextEditor ref={descRef} height={250} placeholder="Nhập mô tả khóa học..." />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Hủy
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            <Save className="mr-1 h-4 w-4" />
            {loading ? 'Đang tạo...' : 'Tạo khóa học'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
