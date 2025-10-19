'use client'

import { motion, Variants } from "framer-motion"
import { useToast } from "@/hooks/use-toast"
import { useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, Eye, MoreVertical, User, MapPin, CreditCard, Wrench } from "lucide-react"

type Member = {
  id: string
  name: string
  age: string
  location: string
  credits: string
  skills: string
  status: string
}

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

export function MembersView({ initialMembers }: { initialMembers: Member[] }) {
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)

  const handleViewDetails = (member: Member) => {
    setSelectedMember(member)
    setIsDetailsOpen(true)
  }

  const filteredMembers = useMemo(
    () =>
      initialMembers.filter(
        (member) =>
          member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          member.location.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    [initialMembers, searchQuery],
  )

  return (
    <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">สมาชิกทั้งหมด</h1>
          <p className="text-muted-foreground">จัดการข้อมูลสมาชิกในระบบ Time Bank (ทั้งหมด {initialMembers.length} คน)</p>
        </div>

        {/* Search and Filter */}
        <Card>
          <CardHeader>
            <CardTitle>ค้นหาและกรองข้อมูล</CardTitle>
            <CardDescription>ค้นหาสมาชิกตามชื่อหรือชื่อหรือจังหวัด และใช้ตัวกรองเพื่อจำกัดผลลัพธ์</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="ค้นหาตามชื่อสมาชิกหรือจังหวัด..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button variant="outline" className="gap-2 bg-transparent" onClick={() => setSearchQuery("")}>
                <Filter className="h-4 w-4" />
                แสดงทั้งหมด
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Members Table */}
        <Card>
          <CardHeader>
            <CardTitle>รายชื่อสมาชิก ({filteredMembers.length} คน)</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ชื่อสมาชิก</TableHead>
                  <TableHead>อายุ</TableHead>
                  <TableHead>จังหวัด</TableHead>
                  <TableHead>เครดิตคงเหลือ</TableHead>
                  <TableHead>ความสามารถ</TableHead>
                  <TableHead>สถานะ</TableHead>
                  <TableHead>การจัดการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMembers.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{member.name}</div>
                        <div className="text-sm text-muted-foreground">{member.id}</div>
                      </div>
                    </TableCell>
                    <TableCell>{member.age}</TableCell>
                    <TableCell>{member.location}</TableCell>
                    <TableCell className="text-blue-600 font-medium">{member.credits}</TableCell>
                    <TableCell className="max-w-[200px]">
                      <div className="text-sm">{member.skills}</div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={member.status === "active" ? "default" : "secondary"}
                        className={
                          member.status === "active"
                            ? "bg-green-100 text-green-700 hover:bg-green-100"
                            : "bg-red-100 text-red-700 hover:bg-red-100"
                        }
                      >
                        {member.status === "active" ? "ใช้งาน" : "ใกล้หมด"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button size="sm" className="gap-1" onClick={() => handleViewDetails(member)}>
                          <Eye className="h-3 w-3" />
                          ดูรายละเอียด
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="icon" variant="ghost">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => toast({ title: "แก้ไขสมาชิก", description: "ฟังก์ชันแก้ไขสมาชิกยังไม่พร้อมใช้งาน" })}>
                              แก้ไข
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => toast({ title: "ปิดใช้งานสมาชิก", description: "ฟังก์ชันปิดใช้งานสมาชิกยังไม่พร้อมใช้งาน" })}>
                              ปิดใช้งาน
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.div variants={itemVariants}>
                <DialogHeader>
                    {selectedMember && (
                        <div className="flex items-center gap-4 pt-4">
                            <Avatar className="h-16 w-16">
                                <AvatarFallback className="text-2xl">{selectedMember.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <DialogTitle className="text-2xl">{selectedMember.name}</DialogTitle>
                                <DialogDescription>{selectedMember.id}</DialogDescription>
                            </div>
                        </div>
                    )}
                </DialogHeader>
              </motion.div>
              {selectedMember && (
                <div className="space-y-6 py-4">
                  <motion.div variants={itemVariants}>
                    <div className="space-y-2">
                      <h4 className="font-medium text-muted-foreground">ข้อมูลส่วนตัว</h4>
                      <div className="space-y-2 rounded-lg border p-3">
                        <div className="flex items-center gap-2"><User className="h-4 w-4 text-muted-foreground" /> <span className="font-medium">อายุ:</span> {selectedMember.age}</div>
                        <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-muted-foreground" /> <span className="font-medium">จังหวัด:</span> {selectedMember.location}</div>
                      </div>
                    </div>
                  </motion.div>
                  <motion.div variants={itemVariants}>
                    <div className="space-y-2">
                      <h4 className="font-medium text-muted-foreground">ข้อมูล Time Bank</h4>
                      <div className="space-y-2 rounded-lg border p-3">
                        <div className="flex items-center gap-2"><CreditCard className="h-4 w-4 text-muted-foreground" /> <span className="font-medium">เครดิต:</span> {selectedMember.credits}</div>
                        <div className="flex items-start gap-2"><Wrench className="h-4 w-4 mt-1 text-muted-foreground" /> <span className="font-medium">ความสามารถ:</span> {selectedMember.skills}</div>
                        <div className="flex items-center gap-2"><span className="font-medium">สถานะ:</span> <Badge
                            variant={selectedMember.status === "active" ? "default" : "secondary"}
                            className={
                              selectedMember.status === "active"
                                ? "bg-green-100 text-green-700 hover:bg-green-100"
                                : "bg-red-100 text-red-700 hover:bg-red-100"
                            }
                          >
                            {selectedMember.status === "active" ? "ใช้งาน" : "ใกล้หมด"}
                          </Badge></div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              )}
              <motion.div variants={itemVariants}>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>ปิด</Button>
                </DialogFooter>
              </motion.div>
            </motion.div>
          </DialogContent>
        </Dialog>
    </div>
  )
}
