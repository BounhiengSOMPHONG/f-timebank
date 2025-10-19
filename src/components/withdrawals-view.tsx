'use client'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Check, X } from "lucide-react"

type Withdrawal = {
  id: string
  memberId: string
  memberName: string
  amount: number
  requestDate: string
  status: "pending" | "approved" | "rejected"
}

export function WithdrawalsView({ initialWithdrawals }: { initialWithdrawals: Withdrawal[] }) {
  const { toast } = useToast()
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>(initialWithdrawals)
  const [statusFilter, setStatusFilter] = useState("all")
  const [pendingChange, setPendingChange] = useState<{ id: string; status: Withdrawal["status"] } | null>(null)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)

  const filteredWithdrawals = useMemo(() => {
    if (statusFilter === "all") {
      return withdrawals
    }
    return withdrawals.filter((w) => w.status === statusFilter)
  }, [withdrawals, statusFilter])

  const handleStatusChange = (id: string, status: Withdrawal["status"]) => {
    setPendingChange({ id, status })
    setIsConfirmOpen(true)
  }

  const handleConfirmStatusChange = () => {
    if (!pendingChange) return

    setWithdrawals((current) =>
      current.map((withdrawal) =>
        withdrawal.id === pendingChange.id ? { ...withdrawal, status: pendingChange.status } : withdrawal,
      ),
    )

    toast({
      title: "อัปเดตสถานะแล้ว",
      description: `คำขอ ${pendingChange.id} ถูกเปลี่ยนเป็นสถานะ ${pendingChange.status}`,
    })

    setIsConfirmOpen(false)
    setPendingChange(null)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>ตัวกรอง</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="สถานะ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">ทุกสถานะ</SelectItem>
              <SelectItem value="pending">รอดำเนินการ</SelectItem>
              <SelectItem value="approved">อนุมัติแล้ว</SelectItem>
              <SelectItem value="rejected">ปฏิเสธแล้ว</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>รายการถอนเครดิต</CardTitle>
          <CardDescription>จัดการคำขอถอนเครดิตของสมาชิก</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>ชื่อสมาชิก</TableHead>
                <TableHead>จำนวน</TableHead>
                <TableHead>วันที่ขอ</TableHead>
                <TableHead>สถานะ</TableHead>
                <TableHead className="text-right">การจัดการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredWithdrawals.map((w) => (
                <TableRow key={w.id}>
                  <TableCell>{w.id}</TableCell>
                  <TableCell>{w.memberName} ({w.memberId})</TableCell>
                  <TableCell>{w.amount} ชม.</TableCell>
                  <TableCell>{w.requestDate}</TableCell>
                  <TableCell>
                    <Badge variant={w.status === 'approved' ? 'default' : w.status === 'rejected' ? 'destructive' : 'outline'}>
                      {w.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {w.status === 'pending' && (
                      <div className="flex gap-2 justify-end">
                        <Button size="sm" variant="outline" onClick={() => handleStatusChange(w.id, 'approved')}>
                          <Check className="h-4 w-4 mr-2" /> อนุมัติ
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleStatusChange(w.id, 'rejected')}>
                          <X className="h-4 w-4 mr-2" /> ปฏิเสธ
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ยืนยันการเปลี่ยนแปลงสถานะ</AlertDialogTitle>
            <AlertDialogDescription>
              คุณแน่ใจหรือไม่ที่จะเปลี่ยนสถานะของคำขอ {pendingChange?.id} เป็น {pendingChange?.status}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingChange(null)}>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmStatusChange}>ยืนยัน</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
