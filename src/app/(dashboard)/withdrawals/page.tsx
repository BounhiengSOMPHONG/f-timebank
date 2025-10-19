import { WithdrawalsView } from "@/components/withdrawals-view"
import { withdrawals } from "@/data/withdrawals"

export const dynamic = "force-static"

export default function WithdrawalsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">การถอนเครดิต</h1>
        <p className="text-muted-foreground">จัดการคำขอถอนเครดิตของสมาชิก</p>
      </div>
      <WithdrawalsView initialWithdrawals={withdrawals} />
    </div>
  )
}
