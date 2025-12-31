import Link from "next/link";
import { SearchX } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="max-w-md w-full text-center">
        <CardHeader>
          <CardTitle>页面未找到</CardTitle>
          <CardDescription>你访问的页面不存在或已被移除。</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-3">
          <SearchX className="h-10 w-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            请检查地址是否正确，或者返回首页继续使用聊天机器人。
          </p>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button asChild>
            <Link href="/">返回首页</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
