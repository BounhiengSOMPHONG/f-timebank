"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Spinner } from "@/components/ui/spinner"
import { Download, Search, ShieldCheck, ShieldOff, RefreshCw } from "lucide-react"

type VerificationEntry = {
  id: number | string
  first_name: string
  last_name: string
  email: string
  phone?: string
  national_id?: string
  dob?: string
  household?: string
  skills?: string[]
  status?: "verified" | "pending" | "rejected" | string
  lat?: number
  lon?: number
  created_at?: string
}

// Keep a small fallback in case the API is unavailable during dev
const mockData: VerificationEntry[] = []

const formatDate = (isoDate?: string) => {
  if (!isoDate) return "-"
  try {
    return new Intl.DateTimeFormat("th-TH", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(isoDate))
  } catch {
    return isoDate
  }
}

const formatISODate = (isoDate?: string) => {
  if (!isoDate) return "-"
  try {
    return new Date(isoDate).toISOString().slice(0, 10)
  } catch {
    return isoDate
  }
}

export function VerificationView() {
  const { toast } = useToast()
  const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "")
  const [entries, setEntries] = useState<VerificationEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved" | "rejected">("all")
  const [detailOpen, setDetailOpen] = useState(false)
  const [detailEntry, setDetailEntry] = useState<VerificationEntry | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)

  const loadData = useCallback(async (showToast = false) => {
    setIsLoading(true)
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") || (process.env.NEXT_PUBLIC_ADMIN_ACCESS_TOKEN as string) : undefined
      const base = API_BASE || ''
      const res = await fetch(`${base}/api/admin/verification`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      })
      if (!res.ok) throw new Error(`Failed to load: ${res.status}`)
      const data = await res.json()
      // API may return either an array directly or an object { success, data: [...] }
      if (Array.isArray(data)) {
        setEntries(data)
      } else if (data && Array.isArray(data.data)) {
        setEntries(data.data)
      } else {
        setEntries([])
      }
      if (showToast) {
        toast({
          title: "รีเฟรชข้อมูลแล้ว",
          description: `โหลดข้อมูลคำขอยืนยัน ${Array.isArray(data) ? data.length : 0} รายการ`,
        })
      }
    } catch (err) {
      // fallback to mock if available
      setEntries(mockData)
      toast({ title: "โหลดข้อมูลล้มเหลว", description: String(err), variant: "destructive" })
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [toast])

  useEffect(() => {
    loadData()
  }, [loadData])

  const openDetails = async (id: number | string) => {
    setDetailLoading(true)
    setDetailOpen(true)
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") || (process.env.NEXT_PUBLIC_ADMIN_ACCESS_TOKEN as string) : undefined
      const base = API_BASE || ''
      const res = await fetch(`${base}/api/admin/verification/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      })
      if (!res.ok) throw new Error(`Failed to load details: ${res.status}`)
      const data = await res.json()
      // Detail endpoint may return { success, data: { ... } }
      if (data && data.data) {
        setDetailEntry(data.data)
      } else {
        setDetailEntry(data)
      }
    } catch (err) {
      toast({ title: "โหลดรายละเอียดล้มเหลว", description: String(err), variant: "destructive" })
      setDetailEntry(null)
    } finally {
      setDetailLoading(false)
    }
  }

  const filteredEntries = useMemo(() => {
    const query = search.trim().toLowerCase()

    return entries.filter((entry) => {
      const fullName = `${entry.first_name ?? ""} ${entry.last_name ?? ""}`.trim()
      const matchesSearch =
        !query ||
        fullName.toLowerCase().includes(query) ||
        (entry.email ?? "").toLowerCase().includes(query) ||
        (entry.phone ?? "").toLowerCase().includes(query)

      const matchesStatus = statusFilter === "all" || entry.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [entries, search, statusFilter])

  const pendingCount = useMemo(
    () => entries.filter((entry) => entry.status === "pending").length,
    [entries],
  )

  const [isUpdating, setIsUpdating] = useState<number | string | null>(null)

  const handleApprove = (entry: VerificationEntry) => {
    setIsUpdating(entry.id)
    setTimeout(() => {
      setEntries((prev) =>
        prev.map((e) => (e.id === entry.id ? { ...e, status: "approved" } : e)),
      )
      toast({
        title: "ยืนยันผู้ใช้สำเร็จ",
        description: `${entry.first_name} ${entry.last_name} ถูกยืนยันตัวตนแล้ว`,
      })
      setIsUpdating(null)
    }, 500)
  }

  const handleReject = (entry: VerificationEntry) => {
    setIsUpdating(entry.id)
    setTimeout(() => {
      setEntries((prev) =>
        prev.map((e) => (e.id === entry.id ? { ...e, status: "rejected" } : e)),
      )
      toast({
        title: "ปฏิเสธคำขอ",
        description: `ปฏิเสธคำขอของ ${entry.first_name} ${entry.last_name} เรียบร้อย`,
        variant: "destructive",
      })
      setIsUpdating(null)
    }, 500)
  }

  const handleRefresh = () => {
    setIsRefreshing(true)
    loadData(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">คำขอยืนยันตัวตน</h1>
          <p className="text-muted-foreground">
            ผู้ใช้ที่ยังรอการตรวจสอบจากผู้ดูแลระบบ จำนวนทั้งหมด {entries.length} รายการ ({pendingCount} รายการรอตรวจสอบ)
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            รีเฟรช
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            ส่งออก CSV
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>ค้นหาและกรอง</CardTitle>
          <CardDescription>ค้นหาโดยอีเมล ชื่อ หรือเบอร์โทร พร้อมเลือกสถานะที่ต้องการดู</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="ค้นหาโดยชื่อผู้ใช้ อีเมล หรือเบอร์โทร..."
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={statusFilter === "all" ? "default" : "outline"}
              onClick={() => setStatusFilter("all")}
            >
              ทั้งหมด
            </Button>
            <Button
              variant={statusFilter === "pending" ? "default" : "outline"}
              onClick={() => setStatusFilter("pending")}
            >
              รอตรวจสอบ
            </Button>
            <Button
              variant={statusFilter === "approved" ? "default" : "outline"}
              onClick={() => setStatusFilter("approved")}
            >
              อนุมัติแล้ว
            </Button>
            <Button
              variant={statusFilter === "rejected" ? "default" : "outline"}
              onClick={() => setStatusFilter("rejected")}
            >
              ถูกปฏิเสธ
            </Button>
          </div>
        </CardContent>
      </Card>
      {/* Details dialog */}
      <Dialog open={detailOpen} onOpenChange={(open) => { if (!open) setDetailEntry(null); setDetailOpen(open) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>รายละเอียดผู้ใช้</DialogTitle>
            <DialogDescription>ข้อมูลผู้ใช้และตำแหน่ง</DialogDescription>
          </DialogHeader>

          {detailLoading ? (
            <div className="flex h-40 items-center justify-center"><Spinner className="h-8 w-8"/></div>
          ) : detailEntry ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div><strong>id</strong><div>{detailEntry.id}</div></div>
                <div><strong>ชื่อ</strong><div>{`${detailEntry.first_name} ${detailEntry.last_name}`}</div></div>
                <div><strong>อีเมล</strong><div>{detailEntry.email}</div></div>
                <div><strong>โทร</strong><div>{detailEntry.phone ?? "-"}</div></div>
                <div><strong>national_id</strong><div>{detailEntry.national_id ?? "-"}</div></div>
                <div><strong>dob</strong><div>{formatISODate(detailEntry.dob)}</div></div>
                <div><strong>household</strong><div>{detailEntry.household ?? "-"}</div></div>
                <div><strong>skills</strong><div>{detailEntry.skills ? detailEntry.skills.join(", ") : "-"}</div></div>
                <div><strong>status</strong><div>{detailEntry.status}</div></div>
                <div><strong>lat, lon</strong><div>{detailEntry.lat ?? "-"}, {detailEntry.lon ?? "-"}</div></div>
                <div><strong>created_at</strong><div>{formatDate(detailEntry.created_at)}</div></div>
              </div>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">ไม่มีข้อมูล</div>
          )}

          <DialogFooter>
            <Button onClick={() => setDetailOpen(false)}>ปิด</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <CardTitle>รายการคำขอ ({filteredEntries.length})</CardTitle>
          <CardDescription>รายละเอียดคำขอยืนยันจากผู้ใช้</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex h-40 items-center justify-center">
              <Spinner className="h-10 w-10" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>id</TableHead>
                  <TableHead>ชื่อ</TableHead>
                  <TableHead>อีเมล</TableHead>
                  <TableHead>โทร</TableHead>
                  <TableHead>เลขบัตรประชาชน</TableHead>
                  <TableHead>วันเกิด</TableHead>
                  <TableHead>ครัวเรือน</TableHead>
                  <TableHead>ทักษะ</TableHead>
                  <TableHead>สถานะ</TableHead>
                  <TableHead className="text-right">การจัดการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEntries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="font-medium">{entry.id}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-semibold">{`${entry.first_name} ${entry.last_name}`}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{entry.email}</TableCell>
                    <TableCell className="text-sm">{entry.phone ?? "-"}</TableCell>
                    <TableCell className="text-sm">{entry.national_id ?? "-"}</TableCell>
                    <TableCell className="text-sm">{formatISODate(entry.dob)}</TableCell>
                    <TableCell className="text-sm">{entry.household ?? "-"}</TableCell>
                    <TableCell className="text-sm">
                      {entry.skills && entry.skills.length > 0 ? (
                        entry.skills.map((s, idx) => (
                          <Badge key={idx} className="mr-1">{s}</Badge>
                        ))
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={entry.status === "verified" ? "default" : entry.status === "pending" ? "secondary" : "destructive"}
                      >
                        {entry.status === "verified" ? "ยืนยันแล้ว" : entry.status === "pending" ? "รอตรวจสอบ" : "ถูกปฏิเสธ"}
                      </Badge>
                    </TableCell>
                    <TableCell className="flex justify-end gap-2">
                      <Button size="sm" variant="ghost" onClick={() => openDetails(entry.id)}>
                        รายละเอียด
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {!isLoading && filteredEntries.length === 0 ? (
            <div className="flex h-32 flex-col items-center justify-center text-center text-sm text-muted-foreground">
              ไม่พบคำขอที่ตรงกับเงื่อนไข
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}

export default VerificationView
