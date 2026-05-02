"use client"

import { useEffect, useRef, useCallback } from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { XIcon } from "lucide-react"
import Hls from "hls.js"

type MediaType = "img" | "pdf" | "video"

const CLOUD_BASE = process.env.NEXT_PUBLIC_CLOUD_URL ?? "http://localhost:3002"

function getPdfSource(u: string) {
  if (!u) return ""
  if (u.startsWith("blob:")) return u
  if (/^https?:\/\//i.test(u)) return u
  if (u.startsWith("/")) return `${CLOUD_BASE}${u}`
  return `${CLOUD_BASE}/api/pdfs/${u}`
}

interface MediaModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  type: MediaType
  url: string
  encryptUrl?: string | null
  title?: string
}

export default function MediaModal({ open, onOpenChange, type, url, encryptUrl, title }: MediaModalProps) {
  const hlsRef = useRef<Hls | null>(null)
  const videoElRef = useRef<HTMLVideoElement | null>(null)

  const initHls = useCallback((video: HTMLVideoElement | null) => {
    // Cleanup trước
    if (hlsRef.current) {
      hlsRef.current.destroy()
      hlsRef.current = null
    }

    if (!video || !url) return
    videoElRef.current = video

    if (Hls.isSupported()) {
      const hls = new Hls({
        xhrSetup(xhr) {
          xhr.withCredentials = true
          xhr.setRequestHeader("x-url", `${process.env.NEXT_PUBLIC_CLOUD_URL}/api/videos/${url}/index.m3u8`)
          if (encryptUrl) {
            xhr.setRequestHeader("x-encrypt-url", encryptUrl)
          }
        }
      })
      hlsRef.current = hls
      hls.loadSource(`${process.env.NEXT_PUBLIC_CLOUD_URL}/api/videos/${url}/index.m3u8`)
      hls.attachMedia(video)
      hls.on(Hls.Events.ERROR, (_event, data) => {
        console.error("HLS error:", data)
      })
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = `${process.env.NEXT_PUBLIC_CLOUD_URL}/api/videos/${url}/index.m3u8`
    }
  }, [url, encryptUrl])

  // Callback ref: được gọi ngay khi element mount/unmount
  const videoRef = useCallback((node: HTMLVideoElement | null) => {
    if (node && open && type === "video") {
      initHls(node)
    }
  }, [open, type, initHls])

  // Cleanup khi đóng modal
  useEffect(() => {
    if (!open) {
      if (hlsRef.current) {
        hlsRef.current.destroy()
        hlsRef.current = null
      }
      if (videoElRef.current) {
        videoElRef.current.pause()
        videoElRef.current.removeAttribute("src")
        videoElRef.current.load()
        videoElRef.current = null
      }
    }
  }, [open])

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/20" />
        <DialogPrimitive.Content className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-lg bg-background shadow-lg">
            <div className="flex items-center justify-between p-4 border-b">
              <DialogPrimitive.Title className="text-lg font-semibold">
                {title ?? "Media Preview"}
              </DialogPrimitive.Title>
              <DialogPrimitive.Close asChild>
                <button className="rounded p-1 hover:bg-muted">
                  <XIcon className="h-4 w-4" />
                </button>
              </DialogPrimitive.Close>
            </div>

            <div className="p-4">
              {type === "img" && (
                <img src={url} alt="media" className="w-full max-h-[80vh] object-contain" />
              )}
              {type === "video" && (
                // Dùng callback ref thay vì useRef thông thường
                <video ref={videoRef} controls className="w-full max-h-[80vh] bg-black" />
              )}
              {type === "pdf" && (
                <iframe
                  src={getPdfSource(url)}
                  title={title ?? "PDF Preview"}
                  className="w-full h-[80vh] border-0"
                />
              )}
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}