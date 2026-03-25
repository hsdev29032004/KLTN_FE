"use client"

import { usePathname, useRouter } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";

export default function MyCoursesTabs() {
  const pathname = usePathname() || "";

  const value = pathname.includes("/my-courses/history") ? "history" : "purchased";

  return (
    <Tabs value={value}>
      <TabsList>
        <TabsTrigger value="purchased">
          <Link href="/my-courses/purchased">Khóa học đã mua</Link>
        </TabsTrigger>
        <TabsTrigger value="history">
          <Link href="/my-courses/history">Lịch sử mua</Link>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
