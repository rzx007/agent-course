"use client";

import { useState, useMemo } from "react";
import { usePathname } from "next/navigation";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
} from "@/components/animate-ui/components/radix/sidebar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/animate-ui/components/radix/alert-dialog";
import { ChatItem, type ChatItemData } from "./sidebar-history-item";
import { useSession } from "@/lib/auth-client";
import { isToday, isYesterday } from "date-fns";
import { toast } from "sonner";
import {
  useChatHistory,
  useDeleteChat,
  type Chat,
} from "@/hooks/use-chat-history";

type GroupedChats = {
  today: ChatItemData[];
  yesterday: ChatItemData[];
  older: ChatItemData[];
};

// 根据时间分组聊天记录
const groupChatsByDate = (chats: Chat[]): GroupedChats => {
  const grouped: GroupedChats = {
    today: [],
    yesterday: [],
    older: [],
  };

  chats.forEach((chat) => {
    const chatDate = new Date(chat.createdAt);
    const chatItem: ChatItemData = {
      id: chat.id,
      title: chat.title,
    };

    if (isToday(chatDate)) {
      grouped.today.push(chatItem);
    } else if (isYesterday(chatDate)) {
      grouped.yesterday.push(chatItem);
    } else {
      grouped.older.push(chatItem);
    }
  });

  return grouped;
};

export function SidebarHistory() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // 从 URL 路径中获取当前活跃的聊天 ID
  const activeChatId = pathname?.startsWith("/chat/")
    ? pathname.split("/chat/")[1]
    : null;

  // 使用 React Query 获取聊天历史
  const { data, isLoading, error } = useChatHistory(100);

  // 使用 React Query 删除聊天
  const deleteChatMutation = useDeleteChat();

  // 使用 useMemo 计算分组聊天，避免不必要的重新计算
  const groupedChats = useMemo(() => {
    if (!data?.chats) {
      return {
        today: [],
        yesterday: [],
        older: [],
      };
    }
    return groupChatsByDate(data.chats);
  }, [data?.chats]);

  // 显示错误提示
  if (error) {
    toast.error("加载聊天历史失败");
  }

  const handleDelete = (chatId: string) => {
    setDeleteId(chatId);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;

    try {
      await deleteChatMutation.mutateAsync(deleteId);
      toast.success("聊天记录已删除");
    } catch (error) {
      console.error("Failed to delete chat:", error);
      toast.error("删除失败");
    } finally {
      setShowDeleteDialog(false);
      setDeleteId(null);
    }
  };

  return (
    <>
      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu>
            {!session?.user?.id || isLoading ? (
              <div className="px-2 py-4 text-center text-sidebar-foreground/50 text-sm">
                加载中...
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                {groupedChats.today.length > 0 && (
                  <div>
                    <div className="px-2 py-1 text-sidebar-foreground/50 text-xs">
                      今天
                    </div>
                    {groupedChats.today.map((chat) => (
                      <ChatItem
                        chat={chat}
                        isActive={chat.id === activeChatId}
                        key={chat.id}
                        onDelete={handleDelete}
                      />
                    ))}
                  </div>
                )}

                {groupedChats.yesterday.length > 0 && (
                  <div>
                    <div className="px-2 py-1 text-sidebar-foreground/50 text-xs">
                      昨天
                    </div>
                    {groupedChats.yesterday.map((chat) => (
                      <ChatItem
                        chat={chat}
                        isActive={chat.id === activeChatId}
                        key={chat.id}
                        onDelete={handleDelete}
                      />
                    ))}
                  </div>
                )}

                {groupedChats.older.length > 0 && (
                  <div>
                    <div className="px-2 py-1 text-sidebar-foreground/50 text-xs">
                      更早
                    </div>
                    {groupedChats.older.map((chat) => (
                      <ChatItem
                        chat={chat}
                        isActive={chat.id === activeChatId}
                        key={chat.id}
                        onDelete={handleDelete}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      <AlertDialog onOpenChange={setShowDeleteDialog} open={showDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确定要删除吗？</AlertDialogTitle>
            <AlertDialogDescription>
              这个操作不能撤销。这将永久删除你的
              聊天记录并从我们的服务器中移除。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>继续</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
