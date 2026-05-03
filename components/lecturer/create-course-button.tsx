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
import { TopicMultiSelect } from '@/components/common/topic-multi-select';
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
  const [commissionRate, setCommissionRate] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [topicIds, setTopicIds] = useState<string[]>([]);
  const [contentParts, setContentParts] = useState<string[]>(['']);
  const descRef = useRef<RichTextEditorRef>(null);
  const [loading, setLoading] = useState(false);

  const addContentPart = () => setContentParts((prev) => [...prev, '']);
  const removeContentPart = (idx: number) =>
    setContentParts((prev) => prev.filter((_, i) => i !== idx));
  const updateContentPart = (idx: number, value: string) =>
    setContentParts((prev) => prev.map((v, i) => (i === idx ? value : v)));

  const handleSubmit = async () => {
    if (!name.trim() || !price.trim()) {
      toast.error('Vui lòng điền tên và giá');
      return;
    }
    if (commissionRate === '') {
      toast.error('Vui lòng nhập tỷ lệ hoa hồng (commissionRate)');
      return;
    }
    const crNum = Number(commissionRate);
    if (Number.isNaN(crNum) || crNum < 0 || crNum > 100) {
      toast.error('Tỷ lệ hoa hồng phải là số trong khoảng 0–100');
      return;
    }
    setLoading(true);
    try {
      const content = contentParts.filter((p) => p.trim()).join('|');
      const description = descRef.current?.getContent() ?? '';
      const sdk = SDK.getInstance();
      let res;
      if (thumbnailFile) {
        const form = new FormData();
        form.append('thumbnail', thumbnailFile);
        form.append('name', name.trim());
        form.append('price', String(Number(price)));
        form.append('commissionRate', String(crNum));
        form.append('content', content);
        form.append('description', description);
        topicIds.forEach((id) => form.append('topicIds', id));
        res = await (sdk as any).createCourse(form);
      } else {
        res = await sdk.createCourse({
          name: name.trim(),
          price: Number(price),
          thumbnail: thumbnail.trim(),
          content,
          description,
          commissionRate: crNum,
          ...(topicIds.length > 0 ? { topicIds } : {}),
        } as any);
      }
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

          <div className="grid grid-cols-3 gap-4">
            <div className="grid gap-1.5">
              <Label>Giá (VNĐ)</Label>
              <Input type="number" min={0} value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0" />
            </div>
            <div className="grid gap-1.5">
              <Label>Tỷ lệ hoa hồng (%)</Label>
              <Input type="number" min={0} max={100} step="0.1" value={commissionRate} onChange={(e) => setCommissionRate(e.target.value)} placeholder="Ví dụ: 10 hoặc 5.5" />
            </div>
            <div className="grid gap-1.5">
              <Label>Thumbnail</Label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setThumbnailFile(e.target.files?.[0] ?? null)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm cursor-pointer file:border-0 file:bg-transparent file:text-sm file:font-medium"
              />
              <div className="flex gap-2 items-center">
                <Input value={thumbnail} onChange={(e) => setThumbnail(e.target.value)} placeholder="Hoặc dán URL ảnh (tùy chọn)" />
                {(thumbnailFile || thumbnail) && (
                  <div className="ml-2">
                    <img
                      src={thumbnailFile ? URL.createObjectURL(thumbnailFile) : thumbnail}
                      alt="preview"
                      className="h-16 w-28 object-cover rounded-md border"
                    />
                  </div>
                )}
              </div>
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
            <Label>Chủ đề</Label>
            <TopicMultiSelect value={topicIds} onChange={setTopicIds} />
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
