"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
} from "@/components/ui/sidebar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ChatItem, type ChatItemData } from "./sidebar-history-item";
import { useSession } from "@/lib/auth-client";
import {
  isToday,
  isYesterday,
  isWithinInterval,
  subDays,
  subMonths,
  startOfDay,
} from "date-fns";
import { toast } from "sonner";

type GroupedChats = {
  today: ChatItemData[];
  yesterday: ChatItemData[];
  lastWeek: ChatItemData[];
  lastMonth: ChatItemData[];
  older: ChatItemData[];
};

type Chat = {
  id: string;
  title: string;
  createdAt: Date;
};

// 根据时间分组聊天记录
const groupChatsByDate = (chats: Chat[]): GroupedChats => {
  const now = new Date();
  const yesterday = subDays(startOfDay(now), 1);
  const lastWeekStart = subDays(startOfDay(now), 7);
  const lastMonthStart = subMonths(startOfDay(now), 1);

  const grouped: GroupedChats = {
    today: [],
    yesterday: [],
    lastWeek: [],
    lastMonth: [],
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
    } else if (
      isWithinInterval(chatDate, {
        start: lastWeekStart,
        end: yesterday,
      })
    ) {
      grouped.lastWeek.push(chatItem);
    } else if (
      isWithinInterval(chatDate, {
        start: lastMonthStart,
        end: lastWeekStart,
      })
    ) {
      grouped.lastMonth.push(chatItem);
    } else {
      grouped.older.push(chatItem);
    }
  });

  return grouped;
};

export function SidebarHistory() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [groupedChats, setGroupedChats] = useState<GroupedChats>({
    today: [],
    yesterday: [],
    lastWeek: [],
    lastMonth: [],
    older: [],
  });
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 从 URL 路径中获取当前活跃的聊天 ID
  const activeChatId = pathname?.startsWith("/chat/")
    ? pathname.split("/chat/")[1]
    : null;

  // 获取聊天历史
  const fetchChatHistory = async () => {
    if (!session?.user?.id) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/history?limit=100");
      if (!response.ok) {
        throw new Error("Failed to fetch chat history");
      }
      const data = await response.json();
      const grouped = groupChatsByDate(data.chats || []);
      setGroupedChats(grouped);
    } catch (error) {
      console.error("Failed to fetch chat history:", error);
      toast.error("加载聊天历史失败");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchChatHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.id]);

  const handleDelete = (chatId: string) => {
    setDeleteId(chatId);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;

    try {
      const response = await fetch(`/api/history?id=${deleteId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete chat");
      }

      toast.success("聊天记录已删除");
      await fetchChatHistory();
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
            {isLoading ? (
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

                {groupedChats.lastWeek.length > 0 && (
                  <div>
                    <div className="px-2 py-1 text-sidebar-foreground/50 text-xs">
                      最近7天
                    </div>
                    {groupedChats.lastWeek.map((chat) => (
                      <ChatItem
                        chat={chat}
                        isActive={chat.id === activeChatId}
                        key={chat.id}
                        onDelete={handleDelete}
                      />
                    ))}
                  </div>
                )}

                {groupedChats.lastMonth.length > 0 && (
                  <div>
                    <div className="px-2 py-1 text-sidebar-foreground/50 text-xs">
                      最近30天
                    </div>
                    {groupedChats.lastMonth.map((chat) => (
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
                      30天以上
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
