import { AILogsView } from "@/components/ai-logs-view";
import { ai_logs } from "@/data/ai-logs";

export default function AILogsPage() {
  return <AILogsView initialLogs={ai_logs} />;
}