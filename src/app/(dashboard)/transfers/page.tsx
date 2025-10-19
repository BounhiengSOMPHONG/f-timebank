import { TransfersView } from "@/components/transfers-view"
import { transfers } from "@/data/transfers"

export const dynamic = "force-static"

export default function TransfersPage() {
  return <TransfersView initialTransfers={transfers} />
}
