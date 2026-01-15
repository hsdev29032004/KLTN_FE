import { GalleryVerticalEnd } from "lucide-react"
import { cookies } from "next/headers"

import { SignupForm } from "@/components/signup/signup-form"

export default async function SignupPage() {


  return (
    <div className="flex flex-1 items-center justify-center">
      <div className="w-full max-w-xs">
        <SignupForm />
      </div>
    </div>
  )
}
