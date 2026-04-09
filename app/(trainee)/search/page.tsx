'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, SlidersHorizontal, X, Star, ArrowUpDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { CourseCard } from '@/components/landing/course-card';
import { useCourseStore } from '@/stores/course/course-store';
import { useDebounce } from '@/hooks/use-debounce';
import type { CourseSearchParams } from '@/types/course.type';
import { courseRequest } from '@/stores/course/course-request';

function parseSearchParams(searchParams: URLSearchParams): CourseSearchParams {
  const params: CourseSearchParams = {};
  const name = searchParams.get('name');
  const teacherName = searchParams.get('teacherName');
  const topicId = searchParams.get('topicId');
  const minPrice = searchParams.get('minPrice');
  const maxPrice = searchParams.get('maxPrice');
  const minStar = searchParams.get('minStar');
  const maxStar = searchParams.get('maxStar');
  const fromDate = searchParams.get('fromDate');
  const toDate = searchParams.get('toDate');
  const sortBy = searchParams.get('sortBy');
  const sortOrder = searchParams.get('sortOrder');
  const page = searchParams.get('page');
  const limit = searchParams.get('limit');

  if (name) params.name = name;
  if (teacherName) params.teacherName = teacherName;
  if (topicId) params.topicId = topicId;
  if (minPrice) params.minPrice = Number(minPrice);
  if (maxPrice) params.maxPrice = Number(maxPrice);
  if (minStar) params.minStar = Number(minStar);
  if (maxStar) params.maxStar = Number(maxStar);
  if (fromDate) params.fromDate = fromDate;
  if (toDate) params.toDate = toDate;
  if (sortBy) params.sortBy = sortBy as CourseSearchParams['sortBy'];
  if (sortOrder) params.sortOrder = sortOrder as CourseSearchParams['sortOrder'];
  if (page) params.page = Number(page);
  if (limit) params.limit = Number(limit);

  return params;
}

function buildQueryString(params: CourseSearchParams): string {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '' && value !== null) {
      sp.set(key, String(value));
    }
  });
  return sp.toString();
}

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseStore = useCourseStore();

  const [filters, setFilters] = useState<CourseSearchParams>(() =>
    parseSearchParams(searchParams),
  );
  const [teacherNameInput, setTeacherNameInput] = useState(filters.teacherName || '');
  const [minPriceInput, setMinPriceInput] = useState(filters.minPrice?.toString() || '');
  const [maxPriceInput, setMaxPriceInput] = useState(filters.maxPrice?.toString() || '');
  const [topics, setTopics] = useState<{ id: string; name: string; slug: string }[]>([]);
  const [sheetOpen, setSheetOpen] = useState(false);
  const debouncedTeacherName = useDebounce(teacherNameInput, 400);

  // Sync debounced teacher name to filters
  useEffect(() => {
    setFilters((prev) => ({ ...prev, teacherName: debouncedTeacherName || undefined, page: 1 }));
  }, [debouncedTeacherName]);

  // Fetch results when filters change
  useEffect(() => {
    const qs = buildQueryString(filters);
    router.replace(`/search${qs ? `?${qs}` : ''}`, { scroll: false });
    courseStore.searchCourses(filters);
  }, [filters]);

  // Sync URL → state whenever search params string changes (header-driven searches)
  const spString = searchParams?.toString?.() ?? '';
  useEffect(() => {
    const parsed = parseSearchParams(searchParams as unknown as URLSearchParams);
    setFilters((prev) => {
      try {
        if (JSON.stringify(prev) === JSON.stringify(parsed)) return prev;
      } catch (err) {
        // fallback to always update
      }
      // update related inputs when filters change from URL
      setTeacherNameInput(parsed.teacherName || '');
      setMinPriceInput(parsed.minPrice?.toString() || '');
      setMaxPriceInput(parsed.maxPrice?.toString() || '');
      return parsed;
    });
  }, [spString]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch topics for topic filter
  useEffect(() => {
    let mounted = true;
    courseRequest
      .getAllTopics()
      .then((res) => {
        if (!mounted) return;
        setTopics(res.data || []);
      })
      .catch(() => {
        // ignore errors
      });
    return () => {
      mounted = false;
    };
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      courseStore.clearSearchResults();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const updateFilter = useCallback((update: Partial<CourseSearchParams>) => {
    setFilters((prev) => ({ ...prev, ...update, page: 1 }));
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setFilters((prev) => ({ ...prev, page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const clearAllFilters = useCallback(() => {
    setFilters({});
    setTeacherNameInput('');
    setMinPriceInput('');
    setMaxPriceInput('');
  }, []);

  const handlePriceApply = () => {
    const update: Partial<CourseSearchParams> = {};
    update.minPrice = minPriceInput ? Number(minPriceInput) : undefined;
    update.maxPrice = maxPriceInput ? Number(maxPriceInput) : undefined;
    updateFilter(update);
  };

  const activeFilterCount = [
    filters.teacherName,
    filters.topicId,
    filters.minPrice !== undefined,
    filters.maxPrice !== undefined,
    filters.minStar !== undefined,
    filters.fromDate,
    filters.toDate,
  ].filter(Boolean).length;

  const { searchResults, searchMeta, loadingSearch } = courseStore;

  return (
    <div className="px-4 md:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Tìm kiếm khóa học</h1>
        {filters.name && (
          <p className="text-muted-foreground">
            Kết quả cho &quot;<span className="font-medium text-foreground">{filters.name}</span>&quot;
            {searchMeta && ` — ${searchMeta.total} khóa học`}
          </p>
        )}
        {!filters.name && searchMeta && (
          <p className="text-muted-foreground">{searchMeta.total} khóa học</p>
        )}
      </div>

      {/* Search bar + Filter toggle + Sort */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {/* Search is available in header; page reads `name` from URL */}
        <div className="flex-1" />

        {/* Filter button (mobile+desktop) */}
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="gap-2">
              <SlidersHorizontal className="h-4 w-4" />
              Bộ lọc
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent className="w-80 sm:w-96 overflow-y-auto p-3">
            <h1 className='font-bold text-xl'>Bộ lọc nâng cao</h1>
            <div className="space-y-6">
              {/* Teacher name */}
              <div className="space-y-2">
                <Label>Giảng viên</Label>
                <Input
                  placeholder="Tên giảng viên..."
                  value={teacherNameInput}
                  onChange={(e) => setTeacherNameInput(e.target.value)}
                />
              </div>

              {/* Topic */}
              <div className="space-y-2">
                <Label>Chủ đề</Label>
                <Select
                  value={filters.topicId || 'all'}
                  onValueChange={(v) =>
                    updateFilter({ topicId: v === 'all' ? undefined : v })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Chọn chủ đề" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    {topics.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              {/* Price range */}
              <div className="space-y-2">
                <Label>Khoảng giá (VND)</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Từ"
                    min={0}
                    value={minPriceInput}
                    onChange={(e) => setMinPriceInput(e.target.value)}
                  />
                  <Input
                    type="number"
                    placeholder="Đến"
                    min={0}
                    value={maxPriceInput}
                    onChange={(e) => setMaxPriceInput(e.target.value)}
                  />
                </div>
                <Button variant="secondary" size="sm" onClick={handlePriceApply} className="w-full">
                  Áp dụng giá
                </Button>
              </div>

              <Separator />

              {/* Star rating */}
              <div className="space-y-2">
                <Label>Đánh giá tối thiểu</Label>
                <div className="flex gap-1">
                  {[0, 1, 2, 3, 4, 5].map((star) => (
                    <Button
                      key={star}
                      size="sm"
                      variant={filters.minStar === star ? 'default' : 'outline'}
                      className="gap-1"
                      onClick={() =>
                        updateFilter({
                          minStar: filters.minStar === star ? undefined : star,
                        })
                      }
                    >
                      {star > 0 && <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />}
                      {star === 0 ? 'Tất cả' : `${star}+`}
                    </Button>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Date range */}
              <div className="space-y-2">
                <Label>Ngày tạo</Label>
                <div className="flex gap-2">
                  <Input
                    type="date"
                    value={filters.fromDate || ''}
                    onChange={(e) =>
                      updateFilter({ fromDate: e.target.value || undefined })
                    }
                  />
                  <Input
                    type="date"
                    value={filters.toDate || ''}
                    onChange={(e) =>
                      updateFilter({ toDate: e.target.value || undefined })
                    }
                  />
                </div>
              </div>

              <Separator />

              {/* Clear all */}
              <Button
                variant="destructive"
                className="w-full"
                onClick={() => {
                  clearAllFilters();
                  setSheetOpen(false);
                }}
              >
                <X className="h-4 w-4 mr-2" />
                Xóa tất cả bộ lọc
              </Button>
            </div>
          </SheetContent>
        </Sheet>

        {/* Sort */}
        <div className="flex gap-2">
          <Select
            value={filters.sortBy || 'createdAt'}
            onValueChange={(v) =>
              updateFilter({ sortBy: v as CourseSearchParams['sortBy'] })
            }
          >
            <SelectTrigger className="w-40">
              <ArrowUpDown className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Sắp xếp" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="createdAt">Mới nhất</SelectItem>
              <SelectItem value="price">Giá</SelectItem>
              <SelectItem value="star">Đánh giá</SelectItem>
              <SelectItem value="studentCount">Phổ biến</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={filters.sortOrder || 'desc'}
            onValueChange={(v) =>
              updateFilter({ sortOrder: v as CourseSearchParams['sortOrder'] })
            }
          >
            <SelectTrigger className="w-30">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desc">Giảm dần</SelectItem>
              <SelectItem value="asc">Tăng dần</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Active filter badges */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {filters.teacherName && (
            <Badge variant="secondary" className="gap-1">
              GV: {filters.teacherName}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => {
                  setTeacherNameInput('');
                  updateFilter({ teacherName: undefined });
                }}
              />
            </Badge>
          )}
          {(filters.minPrice !== undefined || filters.maxPrice !== undefined) && (
            <Badge variant="secondary" className="gap-1">
              Giá: {filters.minPrice ?? 0}đ – {filters.maxPrice ?? '∞'}đ
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => {
                  setMinPriceInput('');
                  setMaxPriceInput('');
                  updateFilter({ minPrice: undefined, maxPrice: undefined });
                }}
              />
            </Badge>
          )}
          {filters.minStar !== undefined && (
            <Badge variant="secondary" className="gap-1">
              ≥ {filters.minStar} sao
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => updateFilter({ minStar: undefined })}
              />
            </Badge>
          )}
          {(filters.fromDate || filters.toDate) && (
            <Badge variant="secondary" className="gap-1">
              {filters.fromDate || '...'} → {filters.toDate || '...'}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => updateFilter({ fromDate: undefined, toDate: undefined })}
              />
            </Badge>
          )}
        </div>
      )}

      {/* Results */}
      {loadingSearch ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-video w-full rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-6 w-1/3" />
            </div>
          ))}
        </div>
      ) : searchResults && searchResults.length > 0 ? (
        <>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {searchResults.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>

          {/* Pagination */}
          {searchMeta && searchMeta.totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={searchMeta.page <= 1}
                onClick={() => handlePageChange(searchMeta.page - 1)}
              >
                Trước
              </Button>
              {Array.from({ length: searchMeta.totalPages }, (_, i) => i + 1)
                .filter((p) => {
                  const current = searchMeta.page;
                  return p === 1 || p === searchMeta.totalPages || Math.abs(p - current) <= 2;
                })
                .reduce<(number | 'ellipsis')[]>((acc, p, idx, arr) => {
                  if (idx > 0 && p - (arr[idx - 1] as number) > 1) {
                    acc.push('ellipsis');
                  }
                  acc.push(p);
                  return acc;
                }, [])
                .map((item, idx) =>
                  item === 'ellipsis' ? (
                    <span key={`e-${idx}`} className="px-2 text-muted-foreground">
                      ...
                    </span>
                  ) : (
                    <Button
                      key={item}
                      variant={searchMeta.page === item ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handlePageChange(item as number)}
                    >
                      {item}
                    </Button>
                  ),
                )}
              <Button
                variant="outline"
                size="sm"
                disabled={searchMeta.page >= searchMeta.totalPages}
                onClick={() => handlePageChange(searchMeta.page + 1)}
              >
                Sau
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Search className="h-16 w-16 text-muted-foreground/40 mb-4" />
          <h3 className="text-lg font-semibold mb-1">Không tìm thấy khóa học</h3>
          <p className="text-muted-foreground text-sm max-w-md">
            Thử thay đổi từ khóa tìm kiếm hoặc điều chỉnh bộ lọc để tìm được khóa học phù hợp.
          </p>
          {activeFilterCount > 0 && (
            <Button variant="outline" className="mt-4" onClick={clearAllFilters}>
              Xóa bộ lọc
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
