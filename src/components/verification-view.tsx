'use client'

import { useCallback, useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Spinner } from "@/components/ui/spinner"
import { Download, Search, ShieldCheck, ShieldOff, RefreshCw } from "lucide-react"

type VerificationEntry = {
  id: string
  fullName: string
  email: string
  phone: string
  submittedAt: string
  documents: Array<{ name: string; url: string }>
  status: "pending" | "approved" | "rejected"
  notes?: string
}

const mockData: VerificationEntry[] = [
  {
    id: "USR-001",
    fullName: "สมชาย ใจดี",
    email: "somchai.j@example.com",
    phone: "081-234-5678",
    submittedAt: new Date().toISOString(),
    documents: [{ name: "บัตรประชาชน", url: "#" }],
    status: "pending",
  },
  {
    id: "USR-002",
    fullName: "สมหญิง รักไทย",
    email: "somy_rak@example.com",
    phone: "082-345-6789",
    submittedAt: new Date(Date.now() - 86400000).toISOString(),
    documents: [{ name: "บัตรประชาชน", url: "#" }],
    status: "pending",
  },
  {
    id: "USR-003",
    fullName: "จอห์น โด",
    email: "john.doe@example.com",
    phone: "099-876-5432",
    submittedAt: new Date(Date.now() - 172800000).toISOString(),
    documents: [],
    status: "approved",
  },
];

const formatDate = (isoDate: string) => {
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

export function VerificationView() {
  const { toast } = useToast()
  const [entries, setEntries] = useState<VerificationEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved" | "rejected">("all")

  const loadData = useCallback((showToast = false) => {
    setIsLoading(true)
    setTimeout(() => {
      setEntries(mockData)
      setIsLoading(false)
      setIsRefreshing(false)
      if (showToast) {
        toast({
          title: "รีเฟรชข้อมูลแล้ว",
          description: `โหลดข้อมูลคำขอยืนยัน ${mockData.length} รายการ`,
        })
      }
    }, 1000)
  }, [toast])

  useEffect(() => {
    loadData()
  }, [loadData])

  const filteredEntries = useMemo(() => {
    const query = search.trim().toLowerCase()

    return entries.filter((entry) => {
      const matchesSearch =
        !query ||
        entry.fullName.toLowerCase().includes(query) ||
        entry.email.toLowerCase().includes(query) ||
        entry.phone.toLowerCase().includes(query)

      const matchesStatus = statusFilter === "all" || entry.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [entries, search, statusFilter])

  const pendingCount = useMemo(
    () => entries.filter((entry) => entry.status === "pending").length,
    [entries],
  )

  const [isUpdating, setIsUpdating] = useState<string | null>(null)

  const handleApprove = (entry: VerificationEntry) => {
    setIsUpdating(entry.id)
    setTimeout(() => {
      setEntries((prev) =>
        prev.map((e) => (e.id === entry.id ? { ...e, status: "approved" } : e)),
      )
      toast({
        title: "ยืนยันผู้ใช้สำเร็จ",
        description: `${entry.fullName} ถูกยืนยันตัวตนแล้ว`,
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
        description: `ปฏิเสธคำขอของ ${entry.fullName} เรียบร้อย`,
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
                  <TableHead>รหัสคำขอ</TableHead>
                  <TableHead>ชื่อผู้ใช้</TableHead>
                  <TableHead>ข้อมูลติดต่อ</TableHead>
                  <TableHead>ยื่นคำขอเมื่อ</TableHead>
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
                        <span className="font-semibold">{entry.fullName}</span>
                        <span className="text-sm text-muted-foreground">
                          เอกสาร {entry.documents.length} รายการ
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col text-sm">
                        <span>{entry.email}</span>
                        <span>{entry.phone}</span>
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(entry.submittedAt)}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          entry.status === "approved"
                            ? "default"
                            : entry.status === "pending"
                              ? "secondary"
                              : "destructive"
                        }
                      >
                        {entry.status === "approved"
                          ? "อนุมัติแล้ว"
                          : entry.status === "pending"
                            ? "รอตรวจสอบ"
                            : "ถูกปฏิเสธ"}
                      </Badge>
                    </TableCell>
                    <TableCell className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleApprove(entry)} disabled={isUpdating === entry.id}>
                        {isUpdating === entry.id ? <Spinner className="h-4 w-4"/> : <ShieldCheck className="mr-2 h-4 w-4" />}
                        อนุมัติ
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleReject(entry)} disabled={isUpdating === entry.id}>
                        {isUpdating === entry.id ? <Spinner className="h-4 w-4"/> : <ShieldOff className="mr-2 h-4 w-4" />}
                        ปฏิเสธ
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
