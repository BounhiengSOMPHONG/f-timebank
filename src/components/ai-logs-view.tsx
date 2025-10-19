'use client'

import { motion, Variants } from "framer-motion"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { useState, useMemo } from 'react'
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Search, Calendar, Activity, CheckCircle2, User, Star, ClipboardList } from "lucide-react"

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    }
  }
};

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 25
    }
  }
};

type Log = {
  requester: string;
  requesterId: string;
  age: number;
  requestType: string;
  requestDetail: string;
  provider: string;
  providerId: string;
  rating: number;
  date: string;
  matchScore: string;
  confidence: string;
  status: string;
};

export function AILogsView({ initialLogs }: { initialLogs: Log[] }) {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedLog, setSelectedLog] = useState<Log | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)

  const handleViewDetails = (log: Log) => {
    setSelectedLog(log)
    setIsDetailsOpen(true)
  }

  const filteredLogs = useMemo(() => {
    return initialLogs.filter(log => {
      const searchMatch = searchQuery === "" || 
        log.requester.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.provider.toLowerCase().includes(searchQuery.toLowerCase())
      
      const statusMatch = statusFilter === "all" || log.status === statusFilter

      return searchMatch && statusMatch
    })
  }, [initialLogs, searchQuery, statusFilter])

  return (
    <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Activity className="h-8 w-8" />
            AI Matching Logs
          </h1>
          <p className="text-muted-foreground">ตรวจสอบบันทึกการรับคู่ระหว่างผู้ร้องขอและผู้ให้บริการด้วย AI Algorithm</p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">ทั้งหมด</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{initialLogs.length}</div>
              <p className="text-xs text-muted-foreground mt-1 font-mono">matching attempts</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">สำเร็จ</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{initialLogs.filter(l => l.status === 'success').length}</div>
              <p className="text-xs text-muted-foreground mt-1 font-mono">successful matches</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">ล้มเหลว</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{initialLogs.filter(l => l.status === 'failed').length}</div>
              <p className="text-xs text-muted-foreground mt-1 font-mono">failed matches</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">คะแนนเฉลี่ย</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{`${(initialLogs.reduce((acc, l) => acc + parseFloat(l.matchScore), 0) / initialLogs.length).toFixed(1)}%`}</div>
              <p className="text-xs text-muted-foreground mt-1 font-mono">avg matching score</p>
            </CardContent>
          </Card>
        </div>

        {/* Filter Section */}
        <Card>
          <CardHeader>
            <CardTitle>ค้นหาและกรองข้อมูล</CardTitle>
            <CardDescription>filter logs by requester/provider names, status, and date range</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="ชื่อผู้ร้องขอ หรือ ผู้ให้บริการ..." className="pl-10" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="สถานะการรับคู่" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ทั้งหมด</SelectItem>
                  <SelectItem value="success">สำเร็จ</SelectItem>
                  <SelectItem value="failed">ล้มเหลว</SelectItem>
                </SelectContent>
              </Select>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input type="date" placeholder="วันที่เริ่มต้น" className="pl-10" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Logs Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Matching Logs ({filteredLogs.length} รายการ)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ผู้ร้องขอ</TableHead>
                  <TableHead>ชื่อความคำขอ</TableHead>
                  <TableHead>ผู้ให้บริการ</TableHead>
                  <TableHead>เวลารับคู่</TableHead>
                  <TableHead>Match Score</TableHead>
                  <TableHead>สถานะ</TableHead>
                  <TableHead>การจัดการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 text-sm font-semibold">
                          {log.requester.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium">{log.requester}</div>
                          <div className="text-xs text-muted-foreground">
                            ID: {log.requesterId} • Age: {log.age}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{log.requestType}</div>
                        <div className="text-xs text-muted-foreground">{log.requestDetail}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Activity className="h-4 w-4 text-blue-500" />
                        <div>
                          <div className="font-medium">{log.provider}</div>
                          <div className="text-xs text-muted-foreground">
                            ID: {log.providerId} • Rating: {log.rating}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{log.date}</TableCell>
                    <TableCell>
                      <div>
                        <div className="text-lg font-bold text-blue-600">{log.matchScore}</div>
                        <div className="text-xs text-muted-foreground font-mono">{log.confidence}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          log.status === "success"
                            ? "bg-green-100 text-green-700 hover:bg-green-100 gap-1"
                            : "bg-red-100 text-red-700 hover:bg-red-100 gap-1"
                        }
                      >
                        <CheckCircle2 className="h-3 w-3" />
                        {log.status === "success" ? "สำเร็จ" : "ล้มเหลว"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button size="sm" variant="ghost" onClick={() => handleViewDetails(log)}>
                        Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent>
            <motion.div variants={containerVariants} initial="hidden" animate="visible">
              {selectedLog && (
                <>
                  <motion.div variants={itemVariants}>
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-3 text-2xl">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback>{selectedLog.requester.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          {selectedLog.requester}
                          <DialogDescription>Requester ID: {selectedLog.requesterId}</DialogDescription>
                        </div>
                      </DialogTitle>
                    </DialogHeader>
                  </motion.div>
                  <motion.div variants={itemVariants} className="space-y-4 py-4">
                    <div className="space-y-2 rounded-lg border p-3">
                      <h4 className="font-medium text-muted-foreground">Request Details</h4>
                      <p className="flex items-center gap-2"><ClipboardList className="h-4 w-4" /> {selectedLog.requestDetail} ({selectedLog.requestType})</p>
                      <p className="flex items-center gap-2"><Calendar className="h-4 w-4" /> {selectedLog.date}</p>
                    </div>
                    <div className="space-y-2 rounded-lg border p-3">
                      <h4 className="font-medium text-muted-foreground">Match Details</h4>
                      <p className="flex items-center gap-2"><User className="h-4 w-4" /> Provider: {selectedLog.provider} ({selectedLog.providerId})</p>
                      <p className="flex items-center gap-2"><Star className="h-4 w-4" /> Provider Rating: {selectedLog.rating}</p>
                      <p>Match Score: {selectedLog.matchScore}</p>
                      <p>Confidence: {selectedLog.confidence}</p>
                      <p>Status: {selectedLog.status}</p>
                    </div>
                  </motion.div>
                  <motion.div variants={itemVariants}>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>Close</Button>
                    </DialogFooter>
                  </motion.div>
                </>
              )}
            </motion.div>
          </DialogContent>
        </Dialog>
    </div>
  )
}