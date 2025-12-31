import { Loader2 } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="max-w-md w-full text-center">
        <CardHeader>
          <CardTitle>页面加载中</CardTitle>
          <CardDescription>正在为你准备内容，请稍候…</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">
            如果等待时间过长，可以尝试刷新页面。
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
