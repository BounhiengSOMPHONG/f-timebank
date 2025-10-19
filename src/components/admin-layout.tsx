"use client"

import type { ReactNode } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Clock, Users, HelpCircle, LinkIcon, CreditCard, Database, BarChart3, Bell, ShieldCheck } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface AdminLayoutProps {
  children: ReactNode
}

const navigation = [
  { name: "สมาชิกทั้งหมด", href: "/members", icon: Users },
  { name: "คำขอความช่วยเหลือ", href: "/help-requests", icon: HelpCircle },
  { name: "รายการรับคู่", href: "/matching", icon: LinkIcon },
  { name: "การโอนเครดิต", href: "/transfers", icon: CreditCard },
  { name: "การถอนเครดิต", href: "/withdrawals", icon: Database },
  { name: "AI Matching Logs", href: "/ai-logs", icon: BarChart3 },
  { name: "ยืนยันผู้ใช้", href: "/verification", icon: ShieldCheck },
  { name: "สถิติระบบ", href: "/statistics", icon: BarChart3 },
]

export function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname()

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="fixed h-full w-64 border-r border-border bg-card">
        <div className="flex h-16 items-center gap-3 border-b border-border px-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <Clock className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">Time Bank</h1>
            <p className="text-sm text-muted-foreground">Admin Panel</p>
          </div>
        </div>

        <nav className="space-y-1 p-4">
          <div className="mb-2 px-3 text-xs font-semibold text-muted-foreground">เมนูหลัก</div>
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground hover:bg-accent hover:text-accent-foreground",
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col pl-64">
        {/* Header */}
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-border bg-card px-6">
          <div className="text-sm text-muted-foreground">ระบบจัดการ Time Bank</div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] text-destructive-foreground">
                3
              </span>
            </Button>
            <Avatar>
              <AvatarFallback className="bg-primary text-primary-foreground">A</AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium">Admin</span>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  )
}
