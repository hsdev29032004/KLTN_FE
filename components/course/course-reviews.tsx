'use client';

import { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useReviewStore } from '@/stores/review/review-store';
import { Input } from '@/components/ui/input';
import type { ICourseReview } from '@/types/course.type';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function calcAvgRating(reviews: ICourseReview[]) {
  if (!reviews.length) return '0';
  return (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1);
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StarRow({ rating, size = 4 }: { rating: number; size?: number }) {
  return (
    <div className="flex">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={`h-${size} w-${size} ${
            i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'
          }`}
        />
      ))}
    </div>
  );
}

function ReviewCardItem({ review }: { review: ICourseReview }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={review.reviewer?.avatar} alt={review.reviewer?.fullName} />
              <AvatarFallback>{review.reviewer?.fullName?.charAt(0)}</AvatarFallback>
            </Avatar>
            <p className="text-sm font-semibold">{review.reviewer?.fullName}</p>
          </div>
          <StarRow rating={review.rating} />
        </div>
        <p className="text-sm text-muted-foreground">{review.content}</p>
      </CardContent>
    </Card>
  );
}

function ReviewPlainItem({ review }: { review: ICourseReview }) {
  return (
    <div className="border-b py-4 last:border-0">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={review.reviewer?.avatar} alt={review.reviewer?.fullName} />
            <AvatarFallback>{review.reviewer?.fullName?.charAt(0)}</AvatarFallback>
          </Avatar>
          <p className="text-sm font-semibold">{review.reviewer?.fullName}</p>
        </div>
        <StarRow rating={review.rating} />
      </div>
      <p className="text-sm text-muted-foreground">{review.content}</p>
    </div>
  );
}

function RatingSummary({ avgRating, total }: { avgRating: string; total: number }) {
  return (
    <Card>
      <CardContent className="p-6 text-center">
        <div className="mb-2 text-5xl font-bold">{avgRating}</div>
        <div className="mb-4 flex justify-center">
          <StarRow rating={Math.round(parseFloat(avgRating))} size={5} />
        </div>
        <p className="text-muted-foreground">{total} đánh giá</p>
      </CardContent>
    </Card>
  );
}

function ReviewsDialog({
  open,
  onOpenChange,
  reviews,
  avgRating,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  reviews: ICourseReview[];
  avgRating: string;
}) {
  const [starFilter, setStarFilter] = useState<string>('all');

  const filtered =
    starFilter === 'all'
      ? reviews
      : reviews.filter((r) => r.rating === parseInt(starFilter));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Tất cả đánh giá</DialogTitle>
        </DialogHeader>

        <div className="flex items-center justify-between gap-4 py-2">
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{avgRating}</span> / 5
            {' · '}
            {reviews.length} đánh giá
          </p>
          <Select value={starFilter} onValueChange={setStarFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Lọc theo sao" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              {[5, 4, 3, 2, 1].map((s) => (
                <SelectItem key={s} value={String(s)}>
                  {s} sao ({reviews.filter((r) => r.rating === s).length})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-y-auto flex-1 -mx-6 px-6">
          {filtered.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Không có đánh giá nào
            </p>
          ) : (
            filtered.map((review) => (
              <ReviewPlainItem key={review.id} review={review} />
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface CourseReviewsProps {
  initialReviews: ICourseReview[];
  courseId: string;
}

export function CourseReviews({ initialReviews, courseId }: CourseReviewsProps) {
  console.log(courseId);
  
  const reviewStore = useReviewStore();
  const [showAll, setShowAll] = useState(false);
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState('');

  // Sync server-fetched reviews into Redux on mount
  useEffect(() => {
    reviewStore.setReviews(initialReviews);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const reviews = reviewStore.reviews;
  const avgRating = calcAvgRating(reviews);

  const handleSubmit = async () => {
    if (!rating || !comment.trim()) return;
    await reviewStore.createReview({ courseId, rating, content: comment.trim() });
    setRating(0);
    setComment('');
  };

  return (
    <>
      <div>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-3xl font-bold">Đánh giá</h2>
          {reviews.length > 2 && (
            <Button variant="outline" onClick={() => setShowAll(true)}>
              Xem tất cả ({reviews.length})
            </Button>
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <RatingSummary avgRating={avgRating} total={reviews.length} />
          <div className="space-y-4">
            {reviews.slice(0, 2).map((review) => (
              <ReviewCardItem key={review.id} review={review} />
            ))}
          </div>
        </div>

        {/* Write a review */}
        <div className="mt-6 flex items-center gap-3">
          <div className="flex">
            {Array.from({ length: 5 }, (_, i) => (
              <Star
                key={i}
                className={`h-6 w-6 cursor-pointer transition-colors ${
                  i < (hovered || rating)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-muted-foreground'
                }`}
                onMouseEnter={() => setHovered(i + 1)}
                onMouseLeave={() => setHovered(0)}
                onClick={() => setRating(i + 1)}
              />
            ))}
          </div>
          <Input
            placeholder="Viết đánh giá của bạn..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            className="flex-1"
          />
          <Button
            onClick={handleSubmit}
            disabled={!rating || !comment.trim() || reviewStore.creating}
          >
            {reviewStore.creating ? 'Đang gửi...' : 'Gửi'}
          </Button>
        </div>
      </div>

      <ReviewsDialog
        open={showAll}
        onOpenChange={setShowAll}
        reviews={reviews}
        avgRating={avgRating}
      />
    </>
  );
}
