"use client";

import { useCourseStore } from "@/stores/course/course-store";
import { usePurchaseStore } from "@/stores/purchase/purchase-store";
import type { CourseListItem } from "@/types/course.type";
import { useEffect, useState, useMemo } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
// table not needed anymore

export default function CheckoutPage() {
  const purchaseStore = usePurchaseStore();
  const courseStore = useCourseStore();

  const [courses, setCourses] = useState<CourseListItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  // avoid infinite loop by depending on a stable primitive (string) instead of array/object
  const selectedKey = useMemo(() => {
    const arr = purchaseStore.courseSelected;
    return Array.isArray(arr) ? arr.join(",") : "";
  }, [purchaseStore.courseSelected]);

  useEffect(() => {
    const fetchCourses = async () => {
      const ids = purchaseStore.courseSelected ?? [];
      if (!ids || ids.length === 0) {
        setCourses([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const response: any = await courseStore.fetchCourses(ids);
        const data: CourseListItem[] = response?.data ?? response ?? [];
        setCourses(data);
      } catch (err) {
        console.error("Error fetching courses for checkout:", err);
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [selectedKey]);

  const formatVND = (value: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);
  };

  const subtotal = courses.reduce((sum, c) => sum + (c.price ?? 0), 0);
  const total = subtotal;
  return (
    <div style={{ maxWidth: 1100, margin: "24px auto", padding: 16 }}>
      <h1 className="text-2xl font-bold mb-4">Thanh toán</h1>

      {loading ? (
        <div>Đang tải danh sách khóa học...</div>
      ) : courses.length === 0 ? (
        <div>Không có khóa học nào để thanh toán.</div>
      ) : (
        <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
          <div style={{ flex: 2 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, overflow: "hidden" }}>
              {courses.map((c) => (
                <Card key={c.id} className="overflow-hidden">
                  <CardContent className="px-0 pr-6">
                    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                      <img src={c.thumbnail} alt={c.name} style={{ width: 160, height: 90, objectFit: "cover", borderRadius: 8 }} />
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
                      <div style={{ fontWeight: 700 }}>{formatVND(c.price ?? 0)}</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <aside style={{ flex: 1 }}>
            <Card className="py-6">
              <CardHeader>
                <CardTitle>Tóm tắt đơn hàng</CardTitle>
              </CardHeader>
              <CardContent>
                <div style={{ padding: "8px 0" }}>Số khóa học: {courses.length}</div>
              </CardContent>
              <CardFooter style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", width: "100%", fontWeight: 700 }}>
                  <span>Tổng cộng</span>
                  <span>{formatVND(total)}</span>
                </div>
                <Button style={{ width: "100%" }}>Thanh toán</Button>
              </CardFooter>
            </Card>
          </aside>
        </div>
      )}
    </div>
  );
}