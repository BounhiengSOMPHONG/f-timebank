'use client'

import { motion, type Variants } from "framer-motion"
import { useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { help_requests } from "@/data/help-requests"
import {
  CheckCircle2,
  Eye,
  Users,
} from "lucide-react"

interface HelpRequest {
  id: number
  requester: {
    name: string
    age: number
    credits: number
    category: string
  }
  detail: {
    title: string
    duration: number
  }
  location: {
    city: string
    district: string
  }
  date: string
  time: string
  status: string
  borderColor: string
}

interface Provider {
  id: string;
  name: string;
  skills: string;
  credits: string;
}

const mockProviders: Provider[] = [
  { id: "PROV-001", name: "อาสา ใจดี", skills: "ดูแลผู้สูงอายุ, ทำอาหาร", credits: "150 ชม." },
  { id: "PROV-002", name: "อาสา บำเพ็ญประโยชน์", skills: "ทำสวน, ซ่อมแซมเล็กน้อย", credits: "250 ชม." },
  { id: "PROV-003", name: "อาสา พัฒนา", skills: "สอนหนังสือ, ขับรถ", credits: "80 ชม." },
];

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

export function HelpRequestsView() {
  const { toast } = useToast()
  const [searchQuery] = useState("")
  const [categoryFilter] = useState("all")
  const [statusFilter] = useState("all")
  const [selectedRequest, setSelectedRequest] = useState<HelpRequest | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [providers, setProviders] = useState<Provider[]>([])
  const [isFetchingProviders, setIsFetchingProviders] = useState(false)
  const [selectedProviderId, setSelectedProviderId] = useState<string | null>(null)

  const filteredRequests = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase()

    return help_requests.filter((request) => {
      const matchesSearch =
        !normalizedQuery ||
        request.requester.name.toLowerCase().includes(normalizedQuery) ||
        request.detail.title.toLowerCase().includes(normalizedQuery)

      const matchesCategory =
        categoryFilter === "all" ||
        request.requester.category.toLowerCase().includes(categoryFilter.toLowerCase())

      const matchesStatus = statusFilter === "all" || request.status === statusFilter

      return matchesSearch && matchesCategory && matchesStatus
    })
  }, [searchQuery, categoryFilter, statusFilter])

  const openDetails = (request: HelpRequest) => {
    setSelectedRequest(request)
    setIsDetailsOpen(true)
    // Reset and fetch providers
    setSelectedProviderId(null)
    setProviders([])
    loadProviders()
  }

  const loadProviders = () => {
    setIsFetchingProviders(true);
    setTimeout(() => {
      setProviders(mockProviders);
      setIsFetchingProviders(false);
    }, 1000);
  };

  const handleProceedToMatch = () => {
    if (!selectedProviderId) {
      toast({
        title: "โปรดเลือกผู้ให้บริการ",
        description: "คุณต้องเลือกผู้ให้บริการก่อนทำการจับคู่",
        variant: "destructive",
      });
      return;
    }
    // Mock API call
    const provider = mockProviders.find(p => p.id === selectedProviderId);
    toast({
      title: "จับคู่สำเร็จ",
      description: `คำขอของ ${selectedRequest?.requester.name} ถูกจับคู่กับ ${provider?.name} แล้ว`,
      variant: "default",
    });
    setIsDetailsOpen(false);
  };

  const handleCancelClick = () => {
    // Mock API call
    toast({
      title: "ยกเลิกคำขอสำเร็จ",
      description: `คำขอของ ${selectedRequest?.requester.name} ถูกยกเลิกแล้ว`,
    });
    setIsDetailsOpen(false);
  }

  return (
    <>
      <div className="space-y-8 overflow-x-hidden">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">คำขอความช่วยเหลือ</h1>
          <p className="text-lg text-muted-foreground">ตรวจสอบและจัดการคำขอความช่วยเหลือจากสมาชิกในระบบ</p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* ... stats cards from previous version ... */}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>ค้นหาและกรองคำขอ</CardTitle>
            <CardDescription>ค้นหาคำขอและใช้ตัวกรองเพื่อจัดการคำขอได้ง่ายขึ้น</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* ... filter controls from previous version ... */}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>รายการคำขอทั้งหมด</CardTitle>
            <CardDescription>แสดงรายการคำขอความช่วยเหลือทั้งหมดในระบบ</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ผู้ขอ</TableHead>
                  <TableHead>รายละเอียด</TableHead>
                  <TableHead>สถานที่</TableHead>
                  <TableHead>วันที่/เวลา</TableHead>
                  <TableHead>สถานะ</TableHead>
                  <TableHead className="text-right">การจัดการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.map((request) => (
                  <TableRow
                    key={request.id}
                    className="hover:bg-muted/50 cursor-pointer"
                    onClick={() => openDetails(request)}
                  >
                    <TableCell>
                      <div className="font-medium">{request.requester.name}</div>
                      <div className="text-sm text-muted-foreground">อายุ {request.requester.age} ปี</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{request.requester.category}</div>
                      <div className="text-sm text-muted-foreground max-w-[300px] truncate">
                        {request.detail.title}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>{request.location.city}</div>
                      <div className="text-sm text-muted-foreground">{request.location.district}</div>
                    </TableCell>
                    <TableCell>
                      <div>{request.date}</div>
                      <div className="text-sm text-muted-foreground">{request.time}</div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          request.status === "urgent"
                            ? "destructive"
                            : request.status === "pending"
                              ? "outline"
                              : "default"
                        }
                      >
                        {request.status === "urgent"
                          ? "เร่งด่วน"
                          : request.status === "pending"
                            ? "รอดำเนินการ"
                            : "จับคู่แล้ว"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); openDetails(request); }}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-4xl">
          <motion.div variants={containerVariants} initial="hidden" animate="visible">
            <motion.div variants={itemVariants}>
              <DialogHeader>
                <DialogTitle className="text-2xl">รายละเอียดคำขอ</DialogTitle>
                <DialogDescription>จัดการรายละเอียดคำขอและดำเนินการจับคู่</DialogDescription>
              </DialogHeader>
            </motion.div>
            {selectedRequest && (
              <div className="space-y-6 py-4">
                <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="rounded-lg border p-4 space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">{selectedRequest.requester.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          อายุ {selectedRequest.requester.age} ปี • เครดิต {selectedRequest.requester.credits} ชั่วโมง
                        </p>
                      </div>
                      <Badge>{selectedRequest.requester.category}</Badge>
                    </div>
                    <div className="text-sm space-y-2">
                      <p><strong className="font-medium">รายละเอียด:</strong> {selectedRequest.detail.title}</p>
                      <p><strong className="font-medium">เวลาที่ต้องการ:</strong> {selectedRequest.detail.duration} ชั่วโมง</p>
                      <p><strong className="font-medium">สถานที่:</strong> {selectedRequest.location.city}, {selectedRequest.location.district}</p>
                      <p><strong className="font-medium">วันที่/เวลา:</strong> {selectedRequest.date} • {selectedRequest.time}</p>
                    </div>
                  </div>
                  <div className="rounded-lg border p-4">
                    <h3 className="text-lg font-semibold mb-4">ข้อมูลผู้ให้บริการที่เสนอ</h3>
                    {isFetchingProviders ? (
                      <div className="flex h-full items-center justify-center">
                        <svg
                          className="h-6 w-6 animate-spin text-muted-foreground"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                        </svg>
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                        {providers.map((provider) => (
                          <div
                            key={provider.id}
                            className={`flex items-center justify-between rounded-lg border p-3 cursor-pointer transition-colors hover:bg-muted/50 ${
                              selectedProviderId === provider.id ? 'border-primary bg-muted' : ''
                            }`}
                            onClick={() => setSelectedProviderId(provider.id)}
                          >
                            <div>
                              <p className="font-medium">{provider.name}</p>
                              <p className="text-sm text-muted-foreground">{provider.skills}</p>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="font-medium text-sm">{provider.credits}</p>
                              <Button
                                variant={selectedProviderId === provider.id ? 'default' : 'outline'}
                                size="sm"
                                className="mt-1 h-7 px-2 text-xs"
                              >
                                เลือก
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
                <motion.div variants={itemVariants}>
                  <DialogFooter className="gap-2">
                    <Button variant="destructive" onClick={handleCancelClick}>
                      <Users className="mr-2 h-4 w-4" />
                      ยกเลิกคำขอ
                    </Button>
                    <Button onClick={handleProceedToMatch} disabled={!selectedProviderId}>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      จับคู่ทันที
                    </Button>
                  </DialogFooter>
                </motion.div>
              </div>
            )}
          </motion.div>
        </DialogContent>
      </Dialog>
    </>
  )
}

