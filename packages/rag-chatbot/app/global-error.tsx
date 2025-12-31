"use client";

import { useEffect } from "react";
import Link from "next/link";
import { OctagonAlert } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <html lang="zh-CN">
      <body className="bg-background text-foreground">
        <div className="flex min-h-screen items-center justify-center p-4">
          <Card className="max-w-md w-full text-center">
            <CardHeader>
              <CardTitle>应用发生严重错误</CardTitle>
              <CardDescription>
                很抱歉，整个应用出现了未处理的异常。
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-3">
              <OctagonAlert className="h-10 w-10 text-destructive" />
              <p className="text-sm text-muted-foreground">
                你可以尝试重新加载应用，或返回首页重新开始对话。
              </p>
              {error?.message && (
                <p className="text-xs text-muted-foreground wrap-break-word">
                  错误信息：{error.message}
                </p>
              )}
            </CardContent>
            <CardFooter className="flex flex-col gap-2 sm:flex-row sm:justify-end">
              <Button variant="outline" onClick={() => reset()}>
                重试
              </Button>
              <Button asChild>
                <Link href="/">返回首页</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </body>
    </html>
  );
}
