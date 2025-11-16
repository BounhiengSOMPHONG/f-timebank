'use client'

import React, { useEffect, useState } from "react"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { useRouter } from "next/navigation"

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

function getCurrentUserRole(): string | null {
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
          if ("role" in parsed && parsed.role) return String(parsed.role)
          if ("user" in parsed && parsed.user?.role) return String(parsed.user.role)
        }
      }
    } catch (e) {
      // ignore
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
        if (obj?.role) return String(obj.role)
        if (obj?.roles && Array.isArray(obj.roles) && obj.roles.length) return String(obj.roles[0])
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
  const [locallyReadIds, setLocallyReadIds] = useState<number[]>(() => {
    try {
      if (typeof window === "undefined") return []
      return JSON.parse(localStorage.getItem("readNotificationIds") || "[]")
    } catch {
      return []
    }
  })
  const [loading, setLoading] = useState(false)

  const fetchNotifications = async () => {
    setLoading(true)
    try {
      const headersInit: Record<string, string> = {
        Accept: "application/json",
        ...(getAuthHeader() as Record<string, string>),
      }
      const res = await fetch(`${API_BASE}/api/notifications/admin`, {
        cache: "no-store",
        credentials: "include",
        headers: headersInit,
      })
      const data = await res.json()
      console.debug("Notification fetch response:", { status: res.status, body: data })

      if (res.status === 401) {
        // Unauthorized: token missing/invalid or cookies not sent.
      }

      if (data?.success) {
        const currentUserId = getCurrentUserId()
        const currentUserRole = getCurrentUserRole()
        let items = data.notifications || []

        // If current user is admin, show admin-relevant notifications (don't filter by user_id).
        // Otherwise only show notifications targeted to the current user or broadcasts.
        const isAdmin = currentUserRole && String(currentUserRole).toLowerCase() === "admin"
        if (!isAdmin) {
          if (currentUserId != null) {
            items = items.filter((n: any) => {
              if (n.user_id === null || n.user_id === undefined) return true
              return Number(n.user_id) === Number(currentUserId)
            })
          }
        }

        // filter out locally-marked-read ids (client-side persistence fallback)
        const readSet = new Set(locallyReadIds.map((id) => Number(id)))
        items = items.filter((n: any) => !readSet.has(Number(n.id)))
        setNotifications(items)
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
  const router = useRouter()
  // mark a single notification as read on the backend and remove it locally
  const markAsRead = async (notificationId: number) => {
    // optimistic removal: remove UI item immediately
    let removedItem: any = null
    setNotifications((prev) => {
      const idx = prev.findIndex((p) => Number(p.id) === Number(notificationId))
      if (idx === -1) return prev
      removedItem = prev[idx]
      const next = [...prev]
      next.splice(idx, 1)
      return next
    })

    // persist locally immediately so refetch doesn't bring it back
    let persistedLocally = false
    try {
      const next = Array.from(new Set([...locallyReadIds.map(Number), Number(notificationId)]))
      setLocallyReadIds(next)
      try {
        localStorage.setItem("readNotificationIds", JSON.stringify(next))
        persistedLocally = true
      } catch (e) {
        // ignore localStorage write errors
      }
    } catch (e) {
      // ignore
    }

    try {
      const markHeaders: Record<string, string> = {
        "Content-Type": "application/json",
        ...(getAuthHeader() as Record<string, string>),
      }
      const res = await fetch(`${API_BASE}/api/notifications/${notificationId}/read`, {
        method: "POST",
        credentials: "include",
        headers: markHeaders,
      })
      const text = await res.text()
      console.debug("markAsRead response", { status: res.status, body: text })
      if (!res.ok) {
        console.warn("Mark as read failed", text)
        // rollback: re-insert removed item at front
        if (removedItem) {
          setNotifications((prev) => [removedItem, ...prev])
        }
        // rollback local persisted id if we added it
        if (persistedLocally) {
          try {
            const rollback = locallyReadIds.filter((id) => Number(id) !== Number(notificationId))
            setLocallyReadIds(rollback)
            localStorage.setItem("readNotificationIds", JSON.stringify(rollback))
          } catch (e) {
            // ignore
          }
        }
      }
    } catch (e) {
      console.error("Mark as read error", e)
      if (removedItem) {
        setNotifications((prev) => [removedItem, ...prev])
      }
      if (persistedLocally) {
        try {
          const rollback = locallyReadIds.filter((id) => Number(id) !== Number(notificationId))
          setLocallyReadIds(rollback)
          localStorage.setItem("readNotificationIds", JSON.stringify(rollback))
        } catch (err) {
          // ignore
        }
      }
    }
  }

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
            <div
              key={n.id}
              role="button"
              tabIndex={0}
              onClick={async () => {
                await markAsRead(n.id)
                if (n.user_id) {
                  router.push(`/verification?userId=${encodeURIComponent(n.user_id)}`)
                } else {
                  router.push("/verification")
                }
              }}
              onKeyDown={async (e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault()
                  await markAsRead(n.id)
                  if (n.user_id) {
                    router.push(`/verification?userId=${encodeURIComponent(n.user_id)}`)
                  } else {
                    router.push("/verification")
                  }
                }
              }}
              className="rounded-md border p-2 cursor-pointer hover:bg-accent"
            >
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


