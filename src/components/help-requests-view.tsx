'use client'

import { motion, type Variants } from "framer-motion"
import { useMemo, useState, useEffect } from "react"
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

interface Job {
  id: number
  title: string
  description: string
  required_skills: string[]
  location_lat: number
  location_lon: number
  time_balance_hours: string
  broadcasted: boolean
  created_at: string
  creator_user_id: number
  creator_email: string
  creator_first_name: string
  creator_last_name: string
}

interface Application {
  id: number
  status: string
  applied_at: string
  job_id: number
  title: string
  description: string
  required_skills: string[]
  location_lat: number
  location_lon: number
  employer_name: string
  employer_email: string
  employer_phone: string
}

interface SkilledUser {
  id: number
  first_name: string
  last_name: string
  email: string
  skills: string[]
  current_lat: number
  current_lon: number
  distance_km: number
}

interface Match {
  id: number
  job_id: number
  user_id: number
  reason?: string
  created_at?: string
  job_title?: string
  user_email?: string
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
  const [jobs, setJobs] = useState<Job[]>([])
  const [isLoadingJobs, setIsLoadingJobs] = useState(false)
  const [jobsError, setJobsError] = useState<string | null>(null)
  const [matches, setMatches] = useState<Match[]>([])
  const [isLoadingMatches, setIsLoadingMatches] = useState(false)
  const [matchesError, setMatchesError] = useState<string | null>(null)
  const [applications, setApplications] = useState<Application[]>([])
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [isJobOpen, setIsJobOpen] = useState(false)
  const [isMatching, setIsMatching] = useState(false)
  const [matchReason, setMatchReason] = useState<string>('')
  const [selectedApp, setSelectedApp] = useState<Application | null>(null)
  const [isAppOpen, setIsAppOpen] = useState(false)
  const [skilledUsers, setSkilledUsers] = useState<SkilledUser[]>([])
  const [isFetchingSkilledUsers, setIsFetchingSkilledUsers] = useState(false)
  const [selectedSkilledUserId, setSelectedSkilledUserId] = useState<number | null>(null)
  const [isLoadingApps, setIsLoadingApps] = useState(false)
  const [appsError, setAppsError] = useState<string | null>(null)
  // Debug: raw fetch responses for troubleshooting
  const [showFetchDebug, setShowFetchDebug] = useState(false)
  const [rawJobsResponse, setRawJobsResponse] = useState<any | null>(null)
  const [rawAppsResponse, setRawAppsResponse] = useState<any | null>(null)

  useEffect(() => {
    let mounted = true

    const fetchAll = async () => {
      setIsLoadingJobs(true)
      setJobsError(null)
      setIsLoadingApps(true)
      setAppsError(null)

      const token = typeof window !== 'undefined'
        ? localStorage.getItem('accessToken') || (process.env.NEXT_PUBLIC_ADMIN_ACCESS_TOKEN as string | undefined)
        : undefined

      const base = (process.env.NEXT_PUBLIC_API_BASE || process.env.NEXT_PUBLIC_API_URL || '')
      const jobsUrl = `${base}/api/admin/jobs`
      const appsUrl = `${base}/api/jobapp`
      const matchesUrl = `${base}/api/admin/matches`

      try {
        setIsLoadingMatches(true)
        setMatchesError(null)

        const [jobsRes, appsRes, matchesRes] = await Promise.all([
          fetch(jobsUrl, { headers: token ? { Authorization: `Bearer ${token}` } : undefined }),
          fetch(appsUrl, { headers: token ? { Authorization: `Bearer ${token}` } : undefined }),
          fetch(matchesUrl, { headers: token ? { Authorization: `Bearer ${token}` } : undefined }),
        ])

        if (!jobsRes.ok) throw new Error(`Jobs HTTP ${jobsRes.status}`)
        if (!appsRes.ok) throw new Error(`Applications HTTP ${appsRes.status}`)
        if (!matchesRes.ok) throw new Error(`Matches HTTP ${matchesRes.status}`)

        const jobsData = await jobsRes.json()
        const appsData = await appsRes.json()
        const matchesData = await matchesRes.json()

        // store raw responses for debug panel
        if (mounted) {
          setRawJobsResponse(jobsData)
          setRawAppsResponse(appsData)
        }

        const fetchedJobs: Job[] = Array.isArray(jobsData.jobs) ? jobsData.jobs : []
        const fetchedApps: Application[] = Array.isArray(appsData.applications) ? appsData.applications : []
        const fetchedMatches: Match[] = Array.isArray(matchesData.matches)
          ? matchesData.matches
          : Array.isArray(matchesData)
            ? matchesData
            : []

        // Remove jobs that have already been matched
        if (mounted) {
          const matchedJobIds = new Set<number>(fetchedMatches.map((m) => m.job_id).filter((id): id is number => typeof id === 'number'))
          setJobs(fetchedJobs.filter((j) => !matchedJobIds.has(j.id)))
          setApplications(fetchedApps)
          setMatches(fetchedMatches)
        }
      } catch (err: any) {
        if (mounted) {
          setJobsError(err?.message ?? 'Failed to fetch jobs')
          setAppsError(err?.message ?? 'Failed to fetch applications')
          setMatchesError(err?.message ?? 'Failed to fetch matches')
        }
      } finally {
        if (mounted) {
          setIsLoadingJobs(false)
          setIsLoadingApps(false)
          setIsLoadingMatches(false)
        }
      }
    }

    fetchAll()
    return () => { mounted = false }
  }, [])

  const filteredRequests = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase()

    return help_requests.filter((request: HelpRequest) => {
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

  const loadSkilledUsers = async (jobId: number) => {
    setIsFetchingSkilledUsers(true)
    setSelectedSkilledUserId(null)
    setSkilledUsers([])
    try {
      const token = typeof window !== 'undefined'
        ? localStorage.getItem('accessToken') || (process.env.NEXT_PUBLIC_ADMIN_ACCESS_TOKEN as string | undefined)
        : undefined
      const base = (process.env.NEXT_PUBLIC_API_BASE || process.env.NEXT_PUBLIC_API_URL || '')
      const url = `${base}/api/admin/jobs/${jobId}/applicants`
      const res = await fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : undefined })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()

      const applicants = Array.isArray(data.applicants) ? data.applicants : []

      // find job coordinates to compute distance
      const job = jobs.find((j) => j.id === jobId)

      const toKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        const toRad = (v: number) => (v * Math.PI) / 180
        const R = 6371 // km
        const dLat = toRad(lat2 - lat1)
        const dLon = toRad(lon2 - lon1)
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
          Math.sin(dLon / 2) * Math.sin(dLon / 2)
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
        return R * c
      }

      const users = applicants.map((a: any) => {
        const lat = typeof a.profile_lat === 'number' ? a.profile_lat : NaN
        const lon = typeof a.profile_lon === 'number' ? a.profile_lon : NaN
        const distance = job && typeof job.location_lat === 'number' && typeof job.location_lon === 'number' && !isNaN(lat) && !isNaN(lon)
          ? toKm(job.location_lat, job.location_lon, lat, lon)
          : NaN

        return {
          id: a.user_id,
          first_name: a.first_name,
          last_name: a.last_name,
          email: a.email,
          skills: Array.isArray(a.profile_skills) ? a.profile_skills.map((s: any) => s.name) : [],
          current_lat: lat,
          current_lon: lon,
          distance_km: distance,
        } as SkilledUser
      })

      setSkilledUsers(users)
    } catch (err) {
      setSkilledUsers([])
    } finally {
      setIsFetchingSkilledUsers(false)
    }
  }

  const loadMatches = async () => {
    setIsLoadingMatches(true)
    setMatchesError(null)
    try {
      const token = typeof window !== 'undefined'
        ? localStorage.getItem('accessToken') || (process.env.NEXT_PUBLIC_ADMIN_ACCESS_TOKEN as string | undefined)
        : undefined
      const base = (process.env.NEXT_PUBLIC_API_BASE || process.env.NEXT_PUBLIC_API_URL || '')
      const url = `${base}/api/admin/matches`
      const res = await fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : undefined })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      const fetchedMatches: Match[] = Array.isArray(data.matches)
        ? data.matches
        : Array.isArray(data)
          ? data
          : []
      setMatches(fetchedMatches)
    } catch (err: any) {
      setMatches([])
      setMatchesError(err?.message ?? 'Failed to fetch matches')
    } finally {
      setIsLoadingMatches(false)
    }
  }

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
          <p className="text-lg text-muted-foreground">รายการรับคู่</p>
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

      {/* Debug fetch responses removed */}

        <Card>
          <CardHeader>
            <CardTitle>รายการคำขอทั้งหมด</CardTitle>
            <CardDescription>แสดงรายการคำขอความช่วยเหลือทั้งหมดในระบบ</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Jobs table fetched from API */}
            {isLoadingJobs ? (
              <div className="p-4">กำลังโหลดงาน...</div>
            ) : jobsError ? (
              <div className="p-4 text-destructive">เกิดข้อผิดพลาด: {jobsError}</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>หัวข้อ</TableHead>
                    <TableHead>คำอธิบาย</TableHead>
                    <TableHead>ทักษะที่ต้องการ</TableHead>
                    <TableHead>ตำแหน่ง (lat, lon)</TableHead>
                    <TableHead>เครดิต (ชม.)</TableHead>
                    <TableHead>สร้างโดย</TableHead>
                    <TableHead>เผยแพร่</TableHead>
                    <TableHead>วันที่สร้าง</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {jobs.map((job) => (
                    <TableRow key={job.id} className="hover:bg-muted/50 cursor-pointer" onClick={() => { setSelectedJob(job); setIsJobOpen(true); loadSkilledUsers(job.id); }}>
                      <TableCell>{job.id}</TableCell>
                      <TableCell>
                        <button className="text-left underline" onClick={(e) => { e.stopPropagation(); setSelectedJob(job); setIsJobOpen(true); loadSkilledUsers(job.id); }}>{job.title}</button>
                      </TableCell>
                      <TableCell className="max-w-[300px] truncate">{job.description}</TableCell>
                      <TableCell>{job.required_skills.join(', ')}</TableCell>
                      <TableCell>{job.location_lat}, {job.location_lon}</TableCell>
                      <TableCell>{job.time_balance_hours}</TableCell>
                      <TableCell>{job.creator_first_name} {job.creator_last_name} ({job.creator_email})</TableCell>
                      <TableCell>{job.broadcasted ? 'ใช่' : 'ไม่'}</TableCell>
                      <TableCell>{new Date(job.created_at).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>รายการงานที่จับคู่แล้ว</CardTitle>
            <CardDescription>แสดงรายการการจับคู่ที่สร้างจากระบบ</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingMatches ? (
              <div className="p-4">กำลังโหลดรายการจับคู่...</div>
            ) : matchesError ? (
              <div className="p-4 text-destructive">เกิดข้อผิดพลาด: {matchesError}</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Match ID</TableHead>
                    <TableHead>Job ID</TableHead>
                    <TableHead>หัวข้อ</TableHead>
                    <TableHead>ผู้ถูกจับคู่</TableHead>
                    <TableHead>อีเมล</TableHead>
                    <TableHead>เหตุผล</TableHead>
                    <TableHead>วันที่จับคู่</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {matches.map((m, idx) => (
                    <TableRow key={m.id ?? idx} className="hover:bg-muted/50">
                      <TableCell>{m.id ?? '-'}</TableCell>
                      <TableCell>{m.job_id ?? '-'}</TableCell>
                      <TableCell>{m.job_title ?? '-'}</TableCell>
                      <TableCell>{m.user_id ? (m.user_email ? m.user_email.split('@')[0] : '-') : '-'}</TableCell>
                      <TableCell>{m.user_email ?? '-'}</TableCell>
                      <TableCell className="max-w-[300px] truncate">{m.reason ?? '-'}</TableCell>
                      <TableCell>{m.created_at ? new Date(m.created_at).toLocaleString() : '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Job detail dialog */}
      <Dialog open={isJobOpen} onOpenChange={setIsJobOpen}>
        <DialogContent className="max-w-4xl">
          <motion.div variants={containerVariants} initial="hidden" animate="visible">
            <motion.div variants={itemVariants}>
              <DialogHeader>
                <DialogTitle className="text-2xl">รายละเอียดงาน</DialogTitle>
                <DialogDescription>รายละเอียดงานและข้อมูลผู้สร้างงาน</DialogDescription>
              </DialogHeader>
            </motion.div>
            {selectedJob ? (
              <div className="space-y-6 py-4">
                <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="rounded-lg border p-4 space-y-4">
                    <h3 className="text-lg font-semibold">{selectedJob.title}</h3>
                    <div>
                      <p className="text-sm text-muted-foreground">{selectedJob.description}</p>
                      <div className="mt-3 text-sm">
                        <p className="font-medium">ผู้สร้างงาน: {selectedJob.creator_first_name} {selectedJob.creator_last_name}</p>
                        <p className="text-sm text-muted-foreground">{selectedJob.creator_email}</p>
                      </div>
                    </div>
                    <p className="mt-2"><strong>ทักษะที่ต้องการ:</strong> {selectedJob.required_skills.join(', ')}</p>
                    <p><strong>เครดิต:</strong> {selectedJob.time_balance_hours}</p>
                    <p><strong>วัน/เวลา:</strong> {new Date(selectedJob.created_at).toLocaleString()}</p>
                  </div>
                  <div className="rounded-lg border p-4">
                    <h5 className="text-sm font-medium mb-2">ผู้ให้บริการที่เสนอ</h5>
                    {isFetchingSkilledUsers ? (
                      <div className="text-sm text-muted-foreground">กำลังโหลดผู้ให้บริการ...</div>
                    ) : (
                      <div className="space-y-2 max-h-[240px] overflow-y-auto">
                        {skilledUsers.map((u) => (
                          <div key={u.id} className={`rounded-lg border p-3 flex items-center justify-between ${selectedSkilledUserId === u.id ? 'bg-muted border-primary' : ''}`}>
                            <div>
                              <p className="font-medium">{u.first_name} {u.last_name}</p>
                              <p className="text-sm text-muted-foreground">{u.skills.join(', ')}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm">{typeof u.distance_km === 'number' && !isNaN(u.distance_km) ? `${u.distance_km.toFixed(2)} กม.` : 'ไม่ระบุ'}</p>
                              <Button size="sm" variant={selectedSkilledUserId === u.id ? 'default' : 'outline'} onClick={() => setSelectedSkilledUserId(u.id)}>เลือก</Button>
                            </div>
                          </div>
                        ))}
                        {skilledUsers.length === 0 && <div className="text-sm text-muted-foreground">ไม่มีผู้ให้บริการที่ตรงกับทักษะ</div>}
                      </div>
                    )}
                  </div>
                </motion.div>
                <motion.div variants={itemVariants}>
                  <div className="mt-3">
                    <label className="block text-sm font-medium mb-1">เหตุผลในการจับคู่ (ไม่บังคับ)</label>
                    <textarea
                      value={matchReason}
                      onChange={(e) => setMatchReason(e.target.value)}
                      placeholder="ใส่เหตุผลหรือหมายเหตุสำหรับการจับคู่..."
                      rows={3}
                      className="w-full rounded-md border p-2 text-sm"
                    />
                  </div>
                </motion.div>
                <motion.div variants={itemVariants}>
                    <DialogFooter>
                      <Button
                        variant="default"
                        disabled={!selectedSkilledUserId || isMatching}
                        onClick={async () => {
                          if (!selectedJob || !selectedSkilledUserId) return
                          setIsMatching(true)
                          try {
                            const token = typeof window !== 'undefined'
                              ? localStorage.getItem('accessToken') || (process.env.NEXT_PUBLIC_ADMIN_ACCESS_TOKEN as string | undefined)
                              : undefined
                            const base = (process.env.NEXT_PUBLIC_API_BASE || process.env.NEXT_PUBLIC_API_URL || '')
                            const url = `${base}/api/admin/matches`
                            const body = {
                              job_id: selectedJob.id,
                              user_id: selectedSkilledUserId,
                              reason: matchReason || 'Matched from admin UI'
                            }
                            const res = await fetch(url, {
                              method: 'POST',
                              headers: {
                                'Content-Type': 'application/json',
                                ...(token ? { Authorization: `Bearer ${token}` } : {})
                              },
                              body: JSON.stringify(body)
                            })
                            if (!res.ok) throw new Error(`HTTP ${res.status}`)
                            const createdMatch = await res.json().catch(() => null)
                            // remove matched job from list
                            setJobs((prev) => prev.filter((j) => j.id !== selectedJob.id))
                            // refresh matches list from server to ensure authoritative data
                            await loadMatches()
                            toast({ title: 'จับคู่สำเร็จ', description: `งาน ${selectedJob.title} ถูกจับคู่กับผู้ให้บริการแล้ว` })
                            setMatchReason('')
                            setIsJobOpen(false)
                            setSelectedJob(null)
                          } catch (err: any) {
                            toast({ title: 'เกิดข้อผิดพลาด', description: err?.message ?? 'ไม่สามารถจับคู่ได้', variant: 'destructive' })
                          } finally {
                            setIsMatching(false)
                          }
                        }}
                      >
                        จับคู่ทันที
                      </Button>
                    </DialogFooter>
                </motion.div>
              </div>
            ) : (
              <div className="p-4">ไม่มีข้อมูล</div>
            )}
          </motion.div>
        </DialogContent>
      </Dialog>

      {/* Application detail dialog */}
      <Dialog open={isAppOpen} onOpenChange={setIsAppOpen}>
        <DialogContent className="max-w-4xl">
          <motion.div variants={containerVariants} initial="hidden" animate="visible">
            <motion.div variants={itemVariants}>
              <DialogHeader>
                <DialogTitle className="text-2xl">รายละเอียดใบสมัคร</DialogTitle>
                <DialogDescription>รายละเอียดใบสมัครและข้อมูลนายจ้าง</DialogDescription>
              </DialogHeader>
            </motion.div>
            {selectedApp ? (
              <div className="space-y-6 py-4">
                <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="rounded-lg border p-4 space-y-4">
                    <h3 className="text-lg font-semibold">{selectedApp.title}</h3>
                    <p className="text-sm text-muted-foreground">{selectedApp.description}</p>
                    <p className="mt-2"><strong>ทักษะที่ต้องการ:</strong> {selectedApp.required_skills.join(', ')}</p>
                    <p><strong>วันที่สมัคร:</strong> {new Date(selectedApp.applied_at).toLocaleString()}</p>
                  </div>
                  <div className="rounded-lg border p-4">
                    <h4 className="text-md font-semibold">นายจ้าง</h4>
                    <p>{selectedApp.employer_name}</p>
                    <p className="text-sm text-muted-foreground">{selectedApp.employer_email}<br/>{selectedApp.employer_phone}</p>
                  </div>
                </motion.div>
                <motion.div variants={itemVariants}>
                  <DialogFooter>
                    <Button variant="destructive" onClick={() => { setIsAppOpen(false); setSelectedApp(null); }}>ยกเลิก</Button>
                    <Button onClick={() => { setIsAppOpen(false); }}>ปิด</Button>
                  </DialogFooter>
                </motion.div>
              </div>
            ) : (
              <div className="p-4">ไม่มีข้อมูล</div>
            )}
          </motion.div>
        </DialogContent>
      </Dialog>

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

