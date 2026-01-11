
"use client";
import Test from '@/components/test';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/auth/auth-store';

export default function Home() {
  const authStore = useAuthStore();
  const handleClick = () => {
    console.log('here');
    
    authStore.setUser('Hello World');
  }
  return (
    <>
      <div>
        <Button onClick={handleClick}>setuser</Button>
        <Button onClick={() => {
          authStore.fetchMe();
        }}>fetch me</Button>
        <Test />
      </div>
    </>
  )
}
