"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Lecturer() {
  const router = useRouter();
  useEffect(() => {
    router.push('/lecturer/dashboard');
  }, []);

  return null;
}