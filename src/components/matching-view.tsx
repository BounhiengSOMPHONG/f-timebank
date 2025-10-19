'use client'

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import { CreateMatchDialog } from "./create-match-dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"

type Job = {
  job_id: string
  job_title: string
  job_description: string
}

type Applicant = {
  user_id: string
  first_name: string
  last_name: string
  job_id: string // Added to associate applicants with jobs
}

const mockJobs: Job[] = [
  { job_id: "JOB-001", job_title: "ดูแลผู้สูงอายุ", job_description: "ช่วยดูแลผู้สูงอายุที่บ้าน" },
  { job_id: "JOB-002", job_title: "สอนพิเศษคณิตศาสตร์", job_description: "สอนพิเศษคณิตศาสตร์ ม.ปลาย" },
  { job_id: "JOB-003", job_title: "ทำสวน", job_description: "ช่วยดูแลสวนในบ้าน" },
];

const mockApplicants: Applicant[] = [
  { user_id: "USR-001", first_name: "สมชาย", last_name: "ใจดี", job_id: "JOB-001" },
  { user_id: "USR-004", first_name: "มานี", last_name: "มีนา", job_id: "JOB-001" },
  { user_id: "USR-002", first_name: "สมหญิง", last_name: "รักไทย", job_id: "JOB-002" },
  { user_id: "USR-005", first_name: "ปิติ", last_name: "ชูใจ", job_id: "JOB-003" },
];

export function MatchingView() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [applicants, setApplicants] = useState<Applicant[]>([])
  const [isLoadingJobs, setIsLoadingJobs] = useState(true)
  const [isLoadingApplicants, setIsLoadingApplicants] = useState(false)
  const [isCreateMatchDialogOpen, setIsCreateMatchDialogOpen] = useState(false)

  useEffect(() => {
    setIsLoadingJobs(true);
    setTimeout(() => {
      setJobs(mockJobs);
      setIsLoadingJobs(false);
    }, 500);
  }, [])

  const handleSelectJob = (job: Job) => {
    setSelectedJob(job)
    setIsLoadingApplicants(true)
    setTimeout(() => {
      const jobApplicants = mockApplicants.filter(app => app.job_id === job.job_id);
      setApplicants(jobApplicants);
      setIsLoadingApplicants(false);
    }, 500);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">จับคู่งาน</h1>
          <p className="text-muted-foreground">จับคู่งานกับสมาชิกในระบบ</p>
        </div>
        <Button onClick={() => setIsCreateMatchDialogOpen(true)} disabled={!selectedJob}>
          <PlusCircle className="mr-2 h-4 w-4" />
          สร้างการจับคู่ใหม่
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>รายการงาน</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingJobs ? (
              <p>Loading...</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ชื่องาน</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {jobs.map((job) => (
                    <TableRow key={job.job_id} onClick={() => handleSelectJob(job)} className={selectedJob?.job_id === job.job_id ? 'bg-muted' : ''}>
                      <TableCell>{job.job_title}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>ผู้สมัครสำหรับงาน: {selectedJob?.job_title}</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingApplicants ? (
              <p>Loading...</p>
            ) : selectedJob && applicants.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ชื่อ</TableHead>
                    <TableHead>นามสกุล</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {applicants.map((applicant) => (
                    <TableRow key={applicant.user_id}>
                      <TableCell>{applicant.first_name}</TableCell>
                      <TableCell>{applicant.last_name}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-muted-foreground">เลือกงานเพื่อดูผู้สมัคร</p>
            )}
          </CardContent>
        </Card>
      </div>

      <CreateMatchDialog open={isCreateMatchDialogOpen} onOpenChange={setIsCreateMatchDialogOpen} jobId={selectedJob?.job_id} />
    </div>
  )
}
