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

// Password strength validation function
function getPasswordStrength(pwd: string): { score: number; label: string; color: string; isValid: boolean } {
  let score = 0
  const requirements = {
    length: pwd.length >= 8, // At least 8 characters
    uppercase: /[A-Z]/.test(pwd), // At least one uppercase letter
    lowercase: /[a-z]/.test(pwd), // At least one lowercase letter
    number: /\d/.test(pwd), // At least one digit
    special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd), // At least one special character
  }

  if (requirements.length) score++
  if (requirements.uppercase) score++
  if (requirements.lowercase) score++
  if (requirements.number) score++
  if (requirements.special) score++

  let label = "Yếu"
  let color = "text-red-500"
  let isValid = false

  if (score >= 4) {
    label = "Mạnh"
    color = "text-lightblue-500"
    isValid = true
  } else if (score >= 3) {
    label = "Trung bình"
    color = "text-yellow-500"
    isValid = true
  }

  return { score, label, color, isValid }
}

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
  const [loading, setLoading] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState<ReturnType<typeof getPasswordStrength> | null>(null)

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const pwd = e.target.value
    setPassword(pwd)
    if (pwd) {
      setPasswordStrength(getPasswordStrength(pwd))
    } else {
      setPasswordStrength(null)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!role) {
      toast.error("Bạn chưa chọn vai trò", {
        description: "Vui lòng chọn vai trò.",
      })
      return
    }

    if (!passwordStrength?.isValid) {
      toast.error("Mật khẩu yếu", {
        description: "Mật khẩu phải ít nhất 8 ký tự với chữ hoa, chữ thường, số và ký tự đặc biệt.",
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
          <h1 className="text-2xl font-bold">Tạo tài khoản của bạn</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Điền mẫu dưới đây để tạo tài khoản
          </p>
        </div>
        <Field>
          <FieldLabel htmlFor="name">Họ và Tên</FieldLabel>
          <Input id="name" type="text" placeholder="Đỗ Phúc Hưng" required value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input id="email" type="email" placeholder="dophuchung@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </Field>
        <Field>
          <FieldLabel htmlFor="role">Vai trò</FieldLabel>
          <Select onValueChange={(v) => setRole(v as "trainee" | "lecturer")} value={role}>
            <SelectTrigger id="role">
              <SelectValue placeholder="Chọn vai trò" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="trainee">Học viên</SelectItem>
              <SelectItem value="lecturer">Giảng viên</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field>
          <FieldLabel htmlFor="password">Mật khẩu</FieldLabel>
          <Input id="password" type="password" required value={password} onChange={handlePasswordChange} />
          {password && (
            <div className="mt-2">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Độ mạnh mật khẩu:</p>
                <p className={`text-sm font-semibold ${passwordStrength?.color}`}>{passwordStrength?.label}</p>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2 overflow-hidden">
                <div
                  className={`h-full transition-all ${passwordStrength?.score === 5
                    ? "bg-green-500 w-full"
                    : passwordStrength?.score === 4
                      ? "bg-green-500 w-4/5"
                      : passwordStrength?.score === 3
                        ? "bg-yellow-500 w-3/5"
                        : "bg-red-500 w-2/5"
                    }`}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Mật khẩu cần: ít nhất 8 ký tự, chữ hoa, chữ thường, số và ký tự đặc biệt (!@#$%^&*)
              </p>
            </div>
          )}
        </Field>
        <Field>
          <FieldLabel htmlFor="confirm-password">Xác nhận mật khẩu</FieldLabel>
          <Input id="confirm-password" type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
        </Field>
        <Field>
          <Button type="submit" className="w-full" disabled={loading || (password.length > 0 && !passwordStrength?.isValid)}>
            {loading ? "Đang xử lý..." : "Tạo tài khoản"}
          </Button>
        </Field>
        <FieldDescription className="px-6 text-center">
          Đã có tài khoản? <Link href="/login">Đăng nhập</Link>
        </FieldDescription>
      </FieldGroup>
    </form>
  )
}