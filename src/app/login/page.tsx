'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

export default function LoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [email, setEmail] = useState('')    // ไม่ใช้ null
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: email, password, remember }),
      });

      if (response.ok) {
        toast({ title: "เข้าสู่ระบบสำเร็จ", description: "กำลังเปลี่ยนเส้นทางไปหน้าแดชบอร์ด..." });
        router.push('/'); // Redirect to dashboard
      } else {
        setError('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
        toast({ title: "เกิดข้อผิดพลาด", description: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง', variant: 'destructive' });
      }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">ลงชื่อเข้าใช้</CardTitle>
          <CardDescription>ยินดีต้อนรับสู่ระบบจัดการ Time Bank</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">อีเมล</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">รหัสผ่าน</Label>
              <Input
                id="password"
                type="password"
                placeholder="admin"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
                <span>จำฉันไว้</span>
              </label>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full">เข้าสู่ระบบ</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
