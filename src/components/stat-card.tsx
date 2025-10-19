import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description: string;
  className?: string;
}

export function StatCard({ title, value, icon, description, className }: StatCardProps) {
  return (
    <Card className={cn("relative overflow-hidden transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-2xl", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-white/80">{title}</CardTitle>
        <div className="text-white/80">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-4xl font-bold text-white">{value}</div>
        <p className="text-xs text-white/60">{description}</p>
      </CardContent>
    </Card>
  );
}
