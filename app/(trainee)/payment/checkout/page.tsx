"use client";

import { useCourseStore } from "@/stores/course/course-store";
import { usePurchaseStore } from "@/stores/purchase/purchase-store";
import type { CourseListItem } from "@/types/course.type";
import { useEffect, useState, useMemo } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useAuthStore } from "@/stores/auth/auth-store";
import { useRouter } from "next/navigation";

export default function CheckoutPage() {
  const purchaseStore = usePurchaseStore();
  const courseStore = useCourseStore();
  const authStore = useAuthStore();
  const router = useRouter();

  const [courses, setCourses] = useState<CourseListItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [paying, setPaying] = useState(false);
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());

  const selectedKey = useMemo(() => {
    const arr = purchaseStore.courseSelected;
    return Array.isArray(arr) ? arr.join(",") : "";
  }, [purchaseStore.courseSelected]);

  useEffect(() => {
    const fetchCourses = async () => {
      const ids = purchaseStore.courseSelected ?? [];
      if (ids.length === 0) {
        setCourses([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const response: any = await courseStore.fetchCourses(ids);
        const data: CourseListItem[] = response?.data ?? response ?? [];
        setCourses(data);
        // mặc định check tất cả
        setCheckedIds(new Set(data.map((c) => c.id)));
      } catch (err) {
        console.error("Error fetching courses for checkout:", err);
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, [selectedKey]);

  const toggleCheck = (id: string) => {
    setCheckedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const checkedCourses = courses.filter((c) => checkedIds.has(c.id));
  const total = checkedCourses.reduce((sum, c) => sum + (c.price ?? 0), 0);

  const formatVND = (value: number) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);

  const handlePurchase = async () => {
    if (checkedCourses.length === 0) return;
    setPaying(true);
    try {
      const res = await purchaseStore.purchaseCourse(checkedCourses.map((c) => c.id));
      if ((res as any).data?.error) return;
      authStore.fetchMe();
      purchaseStore.clearCourseSelected();
      router.push("/my-courses/purchased");
    } catch (err: any) {
      const message = err?.response?.data?.message ?? err?.message ?? "Lỗi thanh toán";
      console.error(message);
    } finally {
      setPaying(false);
    }
  };

  return (
    <div style={{ maxWidth: 1100, margin: "24px auto", padding: 16 }}>
      <h1 className="text-2xl font-bold mb-4">Thanh toán</h1>

      {loading ? (
        <div>Đang tải danh sách khóa học...</div>
      ) : courses.length === 0 ? (
        <div>Không có khóa học nào để thanh toán.</div>
      ) : (
        <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
          {/* Course list */}
          <div style={{ flex: 2, display: "flex", flexDirection: "column", gap: 12 }}>
            {courses.map((c) => (
              <Card
                key={c.id}
                className={`overflow-hidden cursor-pointer transition-colors ${checkedIds.has(c.id) ? "border-primary" : "opacity-60"
                  }`}
                onClick={() => toggleCheck(c.id)}
              >
                <CardContent className="px-0 pr-6">
                  <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    <img
                      src={c.thumbnail}
                      alt={c.name}
                      style={{ width: 160, height: 90, objectFit: "cover", borderRadius: 8 }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600 }}>{c.name}</div>
                      <div style={{ color: "#666", fontSize: 13, marginTop: 6, display: "flex", alignItems: "center", gap: 8 }}>
                        <Avatar>
                          {c.user?.avatar ? (
                            <AvatarImage src={c.user.avatar} alt={c.user.fullName} />
                          ) : (
                            <AvatarFallback>{(c.user?.fullName || "G").charAt(0)}</AvatarFallback>
                          )}
                        </Avatar>
                        <span>{c.user?.fullName ?? "Giảng viên"}</span>
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
                      <div style={{ fontWeight: 700 }}>{formatVND(c.price ?? 0)}</div>
                      {/* Checkbox — stopPropagation để không toggle 2 lần khi click thẳng vào checkbox */}
                      <Checkbox
                        checked={checkedIds.has(c.id)}
                        onClick={(e) => e.stopPropagation()}
                        onCheckedChange={() => toggleCheck(c.id)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Summary */}
          <aside style={{ flex: 1 }}>
            <Card className="py-6">
              <CardHeader>
                <CardTitle>Tóm tắt đơn hàng</CardTitle>
              </CardHeader>
              <CardContent>
                <div style={{ padding: "8px 0" }}>
                  Đã chọn: {checkedCourses.length} / {courses.length} khóa học
                </div>
              </CardContent>
              <CardFooter style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", width: "100%", fontWeight: 700 }}>
                  <span>Tổng cộng</span>
                  <span>{formatVND(total)}</span>
                </div>
                <Button
                  style={{ width: "100%" }}
                  onClick={handlePurchase}
                  disabled={paying || checkedCourses.length === 0}
                >
                  {paying ? "Đang thanh toán..." : "Thanh toán"}
                </Button>
              </CardFooter>
            </Card>
          </aside>
        </div>
      )}
    </div>
  );
}