"use client"

import { usePathname, useRouter } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";

export default function MyCoursesTabs() {
  const pathname = usePathname() || "";

  const value = pathname.includes("/my-courses/history") ? "history" : "purchased";

  return (
    <h1 className="text-2xl font-bold">Khóa học đã mua</h1>
  );
}
