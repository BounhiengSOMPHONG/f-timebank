import { Suspense } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, CreditCard, CheckCircle2, Clock, TrendingUp } from "lucide-react"

import { StatisticsChart } from "@/components/statistics-chart"

// Define types for our data
type HelpRequest = {
  status: string;
  date: string;
};

type Member = {
  credits: string;
};

// Mock Data
const mockHelpRequests: HelpRequest[] = [
  { status: 'matched', date: '15 พ.ค. 2567' },
  { status: 'pending', date: '22 มิ.ย. 2567' },
  { status: 'matched', date: '05 ก.ค. 2567' },
  { status: 'pending', date: '12 ก.ค. 2567' },
];

const mockMembers: Member[] = [
  { credits: '15 ชม.' },
  { credits: '20 ชม.' },
  { credits: '5 ชม.' },
];

export default function StatisticsPage() {
  const helpRequests = mockHelpRequests;
  const members = mockMembers;

  const totalMembers = members.length;
  const completedMissions = helpRequests.filter((r: HelpRequest) => r.status === 'matched').length;
  const pendingRequests = helpRequests.filter((r: HelpRequest) => r.status === 'pending').length;
  const totalCredits = members.reduce((acc: number, member: Member) => {
    const credits = parseInt(member.credits.split(' ')[0], 10);
    return acc + (isNaN(credits) ? 0 : credits);
  }, 0);

  const thaiMonthMap: { [key: string]: number } = {
    "ม.ค.": 0, "ก.พ.": 1, "มี.ค.": 2, "เม.ย.": 3, "พ.ค.": 4, "มิ.ย.": 5,
    "ก.ค.": 6, "ส.ค.": 7, "ก.ย.": 8, "ต.ค.": 9, "พ.ย.": 10, "ธ.ค.": 11
  };

  const monthlyData = Array.from({ length: 12 }, (_, i) => ({
    month: Object.keys(thaiMonthMap).find(key => thaiMonthMap[key] === i) || '',
    requests: 0,
    matches: 0,
  }));

  helpRequests.forEach((req: HelpRequest) => {
    const parts = req.date.split(' ');
    if (parts.length === 3) {
      const monthAbbr = parts[1];
      const monthIndex = thaiMonthMap[monthAbbr];
      if (monthIndex !== undefined) {
        monthlyData[monthIndex].requests++;
        if (req.status === 'matched') {
          monthlyData[monthIndex].matches++;
        }
      }
    }
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">ภาพรวมระบบ</h1>
        <p className="text-muted-foreground">ติดตามและจัดการข้อมูลของระบบ Time Bank</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">สมาชิกทั้งหมด</CardTitle>
            <Users className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalMembers}</div>
            <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
              {/* Trend data is not available, so this is a placeholder */}
              <TrendingUp className="h-3 w-3" />
              +12% จากเดือนที่แล้ว
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">เครดิตทั้งหมดในระบบ</CardTitle>
            <CreditCard className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalCredits} ชม.</div>
            <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3" />
              +8% จากเดือนที่แล้ว
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">ภารกิจสำเร็จ</CardTitle>
            <CheckCircle2 className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{completedMissions}</div>
            <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3" />
              +23% จากเดือนที่แล้ว
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">คำขอที่รอดำเนินการ</CardTitle>
            <Clock className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{pendingRequests}</div>
            <p className="mt-1 text-xs text-muted-foreground">คำขอที่รอการจับคู่</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>การวิเคราะห์คำขอและการรับคู่</CardTitle>
          <CardDescription>แสดงจำนวนคำขอความช่วยเหลือและการรับคู่ที่สำเร็จในแต่ละเดือน</CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div className="h-[400px] animate-pulse rounded-lg bg-muted" />}>
            <StatisticsChart data={monthlyData} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}
