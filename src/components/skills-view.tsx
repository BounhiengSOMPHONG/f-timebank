'use client'

import { useEffect, useState } from "react"
import axios from "axios"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"

interface Skill {
  id?: number | string
  name: string
  description?: string
}

export function SkillsView() {
  const { toast } = useToast()
  const [skills, setSkills] = useState<Skill[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null)
  const [saving, setSaving] = useState(false)

  const base = (process.env.NEXT_PUBLIC_API_BASE || process.env.NEXT_PUBLIC_API_URL || '')

  const fetchSkills = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const token = typeof window !== 'undefined'
        ? localStorage.getItem('accessToken') || (process.env.NEXT_PUBLIC_ADMIN_ACCESS_TOKEN as string | undefined)
        : undefined
      const authHeaders = token ? { Authorization: `Bearer ${token}` } : {}
      const res = await axios.get(`${base}/api/skills`, { headers: authHeaders })
      const data = res.data
      const arr: Skill[] = Array.isArray(data) ? data : (Array.isArray(data.skills) ? data.skills : [])
      setSkills(arr)
    } catch (err: any) {
      if (err?.response?.status === 401) {
        setError('Unauthorized (401)')
        toast({ title: 'ไม่ได้รับอนุญาต', description: 'โปรดล็อกอินก่อนใช้งาน', variant: 'destructive' })
      } else {
        setError(err?.message ?? 'Failed to load skills')
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchSkills()
  }, [])

  const openCreateDialog = () => {
    setEditingSkill({ name: '', description: '' })
    setIsDialogOpen(true)
  }

  const openEditDialog = (s: Skill) => {
    setEditingSkill({ ...s })
    setIsDialogOpen(true)
  }

  const handleSave = async () => {
    if (!editingSkill) return
    setSaving(true)
    try {
      const token = typeof window !== 'undefined'
        ? localStorage.getItem('accessToken') || (process.env.NEXT_PUBLIC_ADMIN_ACCESS_TOKEN as string | undefined)
        : undefined
      const authHeaders = token ? { Authorization: `Bearer ${token}` } : {}

      if (editingSkill.id) {
        await axios.put(`${base}/api/skills/${editingSkill.id}`, {
          name: editingSkill.name,
          description: editingSkill.description,
        }, { headers: { ...authHeaders, 'Content-Type': 'application/json' } })
        toast({ title: 'อัปเดตทักษะสำเร็จ' })
      } else {
        await axios.post(`${base}/api/skills`, {
          name: editingSkill.name,
          description: editingSkill.description,
        }, { headers: { ...authHeaders, 'Content-Type': 'application/json' } })
        toast({ title: 'เพิ่มทักษะใหม่สำเร็จ' })
      }
      setIsDialogOpen(false)
      setEditingSkill(null)
      await fetchSkills()
    } catch (err: any) {
      if (err?.response?.status === 401) {
        toast({ title: 'ไม่ได้รับอนุญาต', description: 'โปรดล็อกอินก่อนใช้งาน', variant: 'destructive' })
      } else {
        toast({ title: 'เกิดข้อผิดพลาด', description: err?.message ?? 'ไม่สามารถบันทึกได้', variant: 'destructive' })
      }
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id?: string | number) => {
    if (!id) return
    if (!confirm('ต้องการลบทักษะนี้หรือไม่?')) return
    try {
      const token = typeof window !== 'undefined'
        ? localStorage.getItem('accessToken') || (process.env.NEXT_PUBLIC_ADMIN_ACCESS_TOKEN as string | undefined)
        : undefined
      const authHeaders = token ? { Authorization: `Bearer ${token}` } : {}
      await axios.delete(`${base}/api/skills/${id}`, { headers: authHeaders })
      toast({ title: 'ลบทักษะเรียบร้อยแล้ว' })
      await fetchSkills()
    } catch (err: any) {
      if (err?.response?.status === 401) {
        toast({ title: 'ไม่ได้รับอนุญาต', description: 'โปรดล็อกอินก่อนใช้งาน', variant: 'destructive' })
      } else {
        toast({ title: 'เกิดข้อผิดพลาด', description: err?.message ?? 'ไม่สามารถลบได้', variant: 'destructive' })
      }
    }
  }

  return (
    <>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">จัดการทักษะ</h1>
          <p className="text-muted-foreground">เพิ่ม แก้ไข หรือลบทักษะที่ระบบใช้งาน</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>รายการทักษะ</CardTitle>
            <CardDescription>แสดงทักษะทั้งหมดในระบบ</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-end mb-4">
              <Button onClick={openCreateDialog}>เพิ่มทักษะใหม่</Button>
            </div>

            {isLoading ? (
              <div className="p-4">กำลังโหลด...</div>
            ) : error ? (
              <div className="p-4 text-destructive">เกิดข้อผิดพลาด: {error}</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ชื่อ</TableHead>
                    <TableHead>คำอธิบาย</TableHead>
                    <TableHead>การกระทำ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {skills.map((s) => (
                    <TableRow key={s.id ?? s.name} className="hover:bg-muted/50">
                      <TableCell>{s.name}</TableCell>
                      <TableCell className="max-w-[600px] truncate">{s.description}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => openEditDialog(s)}>แก้ไข</Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDelete(s.id)}>ลบ</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingSkill?.id ? 'แก้ไขทักษะ' : 'เพิ่มทักษะใหม่'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium mb-1">ชื่อทักษะ</label>
              <Input value={editingSkill?.name ?? ''} onChange={(e) => setEditingSkill((cur) => cur ? { ...cur, name: e.target.value } : null)} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">คำอธิบาย</label>
              <textarea
                value={editingSkill?.description ?? ''}
                onChange={(e) => setEditingSkill((cur) => cur ? { ...cur, description: e.target.value } : null)}
                rows={4}
                className="w-full rounded-md border p-2 text-sm"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => { setIsDialogOpen(false); setEditingSkill(null); }}>ยกเลิก</Button>
            <Button onClick={handleSave} disabled={saving || !(editingSkill?.name?.trim())}>
              บันทึก
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}


