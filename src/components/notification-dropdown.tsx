'use client'

import React, { useEffect, useState } from "react"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"

// Fallback to localhost so fetch works when frontend is served separately in dev.
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"

function getAuthHeader() {
  if (typeof window === "undefined") return {}
  const token =
    localStorage.getItem("accessToken") ||
    localStorage.getItem("auth_token") ||
    localStorage.getItem("token") ||
    ""
  return token ? { Authorization: `Bearer ${token}` } : {}
}

function getCurrentUserId(): number | null {
  if (typeof window === "undefined") return null

  const tryKeys = [
    "user",
    "currentUser",
    "current_user",
    "currentUserId",
    "userId",
  ]

  for (const key of tryKeys) {
    const v = localStorage.getItem(key)
    if (!v) continue
    try {
      if (v.trim().startsWith("{") || v.trim().startsWith("[")) {
        const parsed = JSON.parse(v)
        if (!parsed) continue
        if (typeof parsed === "object") {
          if ("id" in parsed && parsed.id) return Number(parsed.id)
          if ("user" in parsed && parsed.user?.id) return Number(parsed.user.id)
        }
      } else {
        const num = Number(v)
        if (!Number.isNaN(num)) return num
      }
    } catch (e) {
      // ignore parsing errors
    }
  }

  const token =
    localStorage.getItem("accessToken") ||
    localStorage.getItem("auth_token") ||
    localStorage.getItem("token") ||
    ""
  if (token) {
    try {
      const parts = token.split(".")
      if (parts.length >= 2) {
        const payload = parts[1].replace(/-/g, "+").replace(/_/g, "/")
        const padded = payload + "=".repeat((4 - (payload.length % 4)) % 4)
        const decoded = atob(padded)
        const obj = JSON.parse(decoded)
        if (obj?.sub) return Number(obj.sub)
        if (obj?.id) return Number(obj.id)
        if (obj?.user_id) return Number(obj.user_id)
        if (obj?.user?.id) return Number(obj.user.id)
      }
    } catch (e) {
      // ignore
    }
  }

  return null
}

export default function NotificationDropdown() {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const fetchNotifications = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/api/notifications/admin`, {
        cache: "no-store",
        credentials: "include",
        headers: {
          Accept: "application/json",
          ...getAuthHeader(),
        },
      })
      const data = await res.json()
      console.debug("Notification fetch response:", { status: res.status, body: data })

      if (res.status === 401) {
        // Unauthorized: token missing/invalid or cookies not sent.
      }

      if (data?.success) {
        const currentUserId = getCurrentUserId()
        if (currentUserId != null) {
          const filtered = (data.notifications || []).filter((n: any) => {
            if (n.user_id === null || n.user_id === undefined) return true
            return Number(n.user_id) === Number(currentUserId)
          })
          setNotifications(filtered)
        } else {
          setNotifications(data.notifications || [])
        }
      } else {
        setNotifications([])
      }
    } catch (err) {
      console.error("Failed to load notifications", err)
      setNotifications([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // initial load and periodic refresh
    fetchNotifications()
    const id = setInterval(fetchNotifications, 30000)
    return () => clearInterval(id)
  }, [])

  const unreadCount = notifications.length

  return (
    <Popover open={open} onOpenChange={(v) => { setOpen(v); if (v) fetchNotifications() }}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] text-destructive-foreground">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-80">
        <div className="mb-2 flex items-center justify-between">
          <div className="text-sm font-medium">การแจ้งเตือน</div>
          <div className="text-xs text-muted-foreground">{loading ? "กำลังโหลด..." : `${unreadCount} ไม่อ่าน`}</div>
        </div>

        <div className="max-h-64 overflow-y-auto space-y-2">
          {loading && <div className="text-sm text-muted-foreground">กำลังดึงข้อมูล...</div>}
          {!loading && notifications.length === 0 && <div className="text-sm text-muted-foreground">ไม่มีการแจ้งเตือน</div>}
          {!loading && notifications.map((n) => (
            <div key={n.id} className="rounded-md border p-2">
              <div className="text-sm font-medium">{n.message}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {n.first_name} {n.last_name} • {n.email}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {new Date(n.created_at).toLocaleString("th-TH")}
              </div>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}


