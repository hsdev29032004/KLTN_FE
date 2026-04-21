"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authRequest } from "@/stores/auth/auth-request";

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [countdown, setCountdown] = useState<number>(0);
  const RESEND_SECONDS = 60;

  useEffect(() => {
    let t: number | undefined;
    if (countdown > 0) {
      t = window.setTimeout(() => setCountdown((c) => c - 1), 1000);
    }
    return () => {
      if (t) clearTimeout(t);
    };
  }, [countdown]);

  const emailIsValid = (e: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
  };

  async function requestCode() {
    setError(null);
    setSuccess(null);
    if (!emailIsValid(email)) {
      setError("Email không hợp lệ");
      return;
    }
    try {
      setLoading(true);
      await authRequest.forgotPassword(email);
      // Always show generic message
      setSuccess("Nếu email tồn tại trong hệ thống, mã xác thực đã được gửi");
      setStep(2);
      setCountdown(RESEND_SECONDS);
    } catch (err: any) {
      // For FE we still show generic message on success path; if network error, show it
      if (err?.response) {
        setError(err.response?.data?.message || "Có lỗi xảy ra");
      } else {
        setError("Không thể kết nối tới server");
      }
    } finally {
      setLoading(false);
    }
  }

  async function resendCode() {
    if (countdown > 0) return;
    setError(null);
    setSuccess(null);
    try {
      setLoading(true);
      await authRequest.forgotPassword(email);
      setSuccess("Mã xác thực đã được gửi lại nếu email tồn tại");
      setCountdown(RESEND_SECONDS);
    } catch (err: any) {
      if (err?.response) setError(err.response?.data?.message || "Có lỗi xảy ra");
      else setError("Không thể kết nối tới server");
    } finally {
      setLoading(false);
    }
  }

  async function resetPassword(e?: React.FormEvent) {
    e?.preventDefault();
    setError(null);
    setSuccess(null);
    if (!emailIsValid(email)) {
      setError("Email không hợp lệ");
      return;
    }
    if (code.trim().length !== 6) {
      setError("Mã xác thực phải gồm 6 chữ số");
      return;
    }
    if (password.length < 6) {
      setError("Mật khẩu mới phải có ít nhất 6 ký tự");
      return;
    }
    try {
      setLoading(true);
      await authRequest.resetPassword(email, code, password);
      setSuccess("Cập nhật mật khẩu thành công. Chuyển hướng tới đăng nhập...");
      setTimeout(() => router.push("/login"), 1200);
    } catch (err: any) {
      if (err?.response?.status === 401) {
        setError("Mã không hợp lệ hoặc đã hết hạn");
      } else if (err?.response) {
        setError(err.response?.data?.message || "Có lỗi xảy ra");
      } else {
        setError("Không thể kết nối tới server");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 480, margin: "40px auto", padding: 24 }}>
      <h2 style={{ marginBottom: 12 }}>Quên mật khẩu</h2>

      {error && (
        <div style={{ color: "#b00020", marginBottom: 12 }}>{error}</div>
      )}
      {success && (
        <div style={{ color: "#0b6623", marginBottom: 12 }}>{success}</div>
      )}

      {step === 1 && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            requestCode();
          }}
        >
          <label style={{ display: "block", marginBottom: 8 }}>
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@example.com"
            style={{ width: "100%", padding: 8, marginBottom: 12 }}
          />

          <div style={{ display: "flex", gap: 8 }}>
            <button type="submit" disabled={loading}>
              Gửi mã
            </button>
            <button
              type="button"
              onClick={() => router.push("/login")}
              disabled={loading}
            >
              Quay lại đăng nhập
            </button>
          </div>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={resetPassword}>
          <label style={{ display: "block", marginBottom: 8 }}>Email</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@example.com"
            style={{ width: "100%", padding: 8, marginBottom: 12 }}
            readOnly={true}
          />

          <label style={{ display: "block", marginBottom: 8 }}>Mã xác thực</label>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            placeholder="6 chữ số"
            maxLength={6}
            style={{ width: "100%", padding: 8, marginBottom: 12 }}
          />

          <label style={{ display: "block", marginBottom: 8 }}>Mật khẩu mới</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mật khẩu mới (ít nhất 6 ký tự)"
            style={{ width: "100%", padding: 8, marginBottom: 12 }}
          />

          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button type="submit" disabled={loading}>
              Đặt lại mật khẩu
            </button>

            <button type="button" onClick={resendCode} disabled={countdown > 0 || loading}>
              {countdown > 0 ? `Gửi lại (${countdown}s)` : "Gửi lại mã"}
            </button>

            <button type="button" onClick={() => setStep(1)} disabled={loading}>
              Quay lại
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
