"use client";

import { useState, useRef } from "react";
import { useAuthStore } from "@/stores/auth/auth-store";
import { userRequest } from "@/stores/user/user-request";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RichTextEditor, type RichTextEditorRef } from "@/components/common/rich-text-editor";
import { toast } from "sonner";

export default function LecturerProfile() {
  const authStore = useAuthStore();
  const user = authStore.user;
  const editorRef = useRef<RichTextEditorRef>(null);

  const [formData, setFormData] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
    avatar: user?.avatar || "",
    bankNumber: user?.bankNumber || "",
    bankName: user?.bankName || "",
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      const payload = {
        fullName: formData.fullName,
        avatar: formData.avatar,
        bankNumber: formData.bankNumber,
        bankName: formData.bankName,
        introduce: editorRef.current?.getContent() || "",
      };
      
      const response = await userRequest.updateProfile(payload);
      
      if (response.data) {
        toast.success("Cập nhật thông tin thành công");
      }
    } catch (error: any) {
      toast.error("Lỗi khi cập nhật", {
        description: error?.response?.data?.message || "Vui lòng thử lại sau",
      });
      console.error("Error:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) {
    return <div>Đang tải...</div>;
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <Card>
        <CardHeader className="mb-2">
          <CardTitle>Chỉnh sửa thông tin cá nhân</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Avatar Preview */}
            <div className="flex items-center gap-4">
              <Avatar className="w-24 h-24">
                <AvatarImage src={formData.avatar} alt={formData.fullName} />
                <AvatarFallback>{formData.fullName.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Label htmlFor="avatar" className="mb-2">URL Avatar</Label>
                <Input
                  id="avatar"
                  name="avatar"
                  type="url"
                  value={formData.avatar}
                  onChange={handleInputChange}
                  placeholder="https://example.com/avatar.jpg"
                />
              </div>
            </div>

            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="fullName">
                Họ và tên <span className="text-red-500">*</span>
              </Label>
              <Input
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                required
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">
                Email <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                disabled
              />
            </div>

            {/* Role - Disabled */}
            <div className="space-y-2">
              <Label htmlFor="role">Vai trò</Label>
              <Input
                id="role"
                value={user.role?.name || ""}
                disabled
                className="bg-muted cursor-not-allowed"
              />
            </div>

            {/* Introduce - TinyMCE */}
            <div className="space-y-2">
              <Label htmlFor="introduce">Giới thiệu</Label>
              <RichTextEditor
                ref={editorRef}
                initialValue={user?.introduce || ""}
                height={400}
                placeholder="Nhập giới thiệu về bạn..."
              />
            </div>

            {/* Bank Payment Information */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Sửa ngân hàng thanh toán lương</h3>
              
              <div className="space-y-4">
                {/* Bank Number */}
                <div className="space-y-2">
                  <Label htmlFor="bankNumber">
                    Số tài khoản ngân hàng <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="bankNumber"
                    name="bankNumber"
                    type="text"
                    placeholder="Nhập số tài khoản"
                    value={formData.bankNumber}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                {/* Bank Name */}
                <div className="space-y-2">
                  <Label htmlFor="bankName">
                    Tên ngân hàng <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="bankName"
                    name="bankName"
                    type="text"
                    placeholder="Nhập tên ngân hàng (VD: Vietcombank, Techcombank...)"
                    value={formData.bankName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setFormData({
                    fullName: user?.fullName || "",
                    email: user?.email || "",
                    avatar: user?.avatar || "",
                    bankNumber: user?.bankNumber || "",
                    bankName: user?.bankName || "",
                  });
                  editorRef.current?.setContent(user?.introduce || "");
                }}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}