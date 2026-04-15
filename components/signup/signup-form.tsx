"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/stores/auth/auth-store"
import { toast } from "sonner"

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const authStore = useAuthStore()
  const router = useRouter()

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [role, setRole] = useState<"trainee" | "lecturer" | "">("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [bankNumber, setbankNumber] = useState("")
  const [bankName, setbankName] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!role) {
      toast.error("Vui lòng chọn role", {
        description: "Vui lòng chọn vai trò.",
      })
      return
    }

    if (password !== confirmPassword) {
      toast.error("Mật khẩu không khớp", {
        description: "Password và Confirm Password phải giống nhau.",
      })
      return
    }

    setLoading(true)
    try {
      await authStore.register({
        name,
        email,
        password,
        role: role === "trainee" ? "User" : "Teacher",
        bankNumber: bankNumber || undefined,
        bankName: bankName || undefined,
      })

      toast.success("Đăng ký thành công")

      router.push("/login")
    } catch (err: any) {
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className={cn("flex flex-col gap-6 py-4", className)} onSubmit={handleSubmit} {...props}>
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Create your account</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Fill in the form below to create your account
          </p>
        </div>
        <Field>
          <FieldLabel htmlFor="name">Full Name</FieldLabel>
          <Input id="name" type="text" placeholder="John Doe" required value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input id="email" type="email" placeholder="m@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </Field>
        <Field>
          <FieldLabel htmlFor="role">Role</FieldLabel>
          <Select onValueChange={(v) => setRole(v as "trainee" | "lecturer")} value={role}>
            <SelectTrigger id="role">
              <SelectValue placeholder="Select your role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="trainee">Trainee (Học viên)</SelectItem>
              <SelectItem value="lecturer">Lecturer (Giảng viên)</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field>
          <FieldLabel htmlFor="bank-number">Bank Number</FieldLabel>
          <Input id="bank-number" type="text" placeholder="0123456789" value={bankNumber} onChange={(e) => setbankNumber(e.target.value)} />
        </Field>
        <Field>
          <FieldLabel htmlFor="bank-name">Bank Name</FieldLabel>
          <Input id="bank-name" type="text" placeholder="Nguyen Van A" value={bankName} onChange={(e) => setbankName(e.target.value)} />
        </Field>
        <Field>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </Field>
        <Field>
          <FieldLabel htmlFor="confirm-password">Confirm Password</FieldLabel>
          <Input id="confirm-password" type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
        </Field>
        <Field>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Đang xử lý..." : "Create Account"}
          </Button>
        </Field>
        <FieldDescription className="px-6 text-center">
          Already have an account? <Link href="/login">Sign in</Link>
        </FieldDescription>
      </FieldGroup>
    </form>
  )
}