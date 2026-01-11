"use client";
import { useAuthStore } from "@/stores/auth/auth-store";

export default function Test() {
  const authStore = useAuthStore();
  const handleClick = () => {
    console.log(authStore.user);
  }
  return (
    <>
      <div onClick={handleClick}>
        {authStore.user}
      </div>
    </>
  )
}