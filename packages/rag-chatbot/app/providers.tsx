"use client";

import { AuthUIProviderTanstack } from "@daveyplate/better-auth-ui/tanstack";
import { AuthQueryProvider } from "@daveyplate/better-auth-tanstack";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

import { authClient } from "@/lib/auth-client";
import { zhCN } from "@/lib/auth-localization-zh";

export function Providers({ children }: { children: ReactNode }) {
  const router = useRouter();

  return (
    <AuthQueryProvider>
      <AuthUIProviderTanstack
        authClient={authClient}
        navigate={router.push}
        replace={router.replace}
        onSessionChange={() => {
          // Clear router cache (protected routes)
          router.refresh();
        }}
        Link={Link}
        localization={zhCN} // 完整的中文本地化配置
      >
        {children}
      </AuthUIProviderTanstack>
    </AuthQueryProvider>
  );
}
