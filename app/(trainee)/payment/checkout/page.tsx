"use client";

import { useCourseStore } from "@/stores/course/course-store";
import { usePurchaseStore } from "@/stores/purchase/purchase-store";
import { useEffect, useState } from "react";

export default function CheckoutPage() {
  const purchaseStore = usePurchaseStore();
  const courseStore = useCourseStore();

  const [courses, setCourses] = useState<any[]>([]);


  useEffect(() => {
    const fetchCourses = async () => {
      if (purchaseStore.courseSelected && purchaseStore.courseSelected.length > 0) {
        console.log(purchaseStore.courseSelected, 'purchaseStore.courseSelected');

        const response = await courseStore.fetchCourses(purchaseStore.courseSelected);
        console.log(response, 'response');

      }
    };
    fetchCourses();
  }, [purchaseStore.courseSelected])
  return (
    <div>
      <h1>{purchaseStore.courseSelected}</h1>
    </div>
  );
}