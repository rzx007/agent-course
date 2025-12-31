"use client";

import { useState } from "react";
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

type GroupedChats = {
  today: ChatItemData[];
  yesterday: ChatItemData[];
  lastWeek: ChatItemData[];
  lastMonth: ChatItemData[];
  older: ChatItemData[];
};

// 生成随机历史记录
const generateMockChats = (): GroupedChats => {
  const chatTitles = [
    "如何学习 React",
    "Next.js 路由配置",
    "TypeScript 最佳实践",
    "数据库设计技巧",
    "API 开发指南",
    "前端性能优化",
    "Tailwind CSS 使用",
    "状态管理方案",
    "单元测试编写",
    "代码重构建议",
    "Git 工作流",
    "Docker 部署",
    "安全性考虑",
    "响应式设计",
    "组件库开发",
  ];

  return {
    today: [
      { id: "1", title: chatTitles[0] },
      { id: "2", title: chatTitles[1] },
      { id: "3", title: chatTitles[2] },
    ],
    yesterday: [
      { id: "4", title: chatTitles[3] },
      { id: "5", title: chatTitles[4] },
    ],
    lastWeek: [
      { id: "6", title: chatTitles[5] },
      { id: "7", title: chatTitles[6] },
      { id: "8", title: chatTitles[7] },
    ],
    lastMonth: [
      { id: "9", title: chatTitles[8] },
      { id: "10", title: chatTitles[9] },
      { id: "11", title: chatTitles[10] },
    ],
    older: [
      { id: "12", title: chatTitles[11] },
      { id: "13", title: chatTitles[12] },
      { id: "14", title: chatTitles[13] },
      { id: "15", title: chatTitles[14] },
    ],
  };
};

export function SidebarHistory() {
  const groupedChats = generateMockChats();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleDelete = (chatId: string) => {
    setDeleteId(chatId);
    setShowDeleteDialog(true);
  };

  return (
    <>
      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu>
            <div className="flex flex-col gap-6">
              {groupedChats.today.length > 0 && (
                <div>
                  <div className="px-2 py-1 text-sidebar-foreground/50 text-xs">
                    Today
                  </div>
                  {groupedChats.today.map((chat, index) => (
                    <ChatItem
                      chat={chat}
                      isActive={index === 0}
                      key={chat.id}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              )}

              {groupedChats.yesterday.length > 0 && (
                <div>
                  <div className="px-2 py-1 text-sidebar-foreground/50 text-xs">
                    Yesterday
                  </div>
                  {groupedChats.yesterday.map((chat) => (
                    <ChatItem
                      chat={chat}
                      isActive={false}
                      key={chat.id}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              )}

              {groupedChats.lastWeek.length > 0 && (
                <div>
                  <div className="px-2 py-1 text-sidebar-foreground/50 text-xs">
                    Last 7 days
                  </div>
                  {groupedChats.lastWeek.map((chat) => (
                    <ChatItem
                      chat={chat}
                      isActive={false}
                      key={chat.id}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              )}

              {groupedChats.lastMonth.length > 0 && (
                <div>
                  <div className="px-2 py-1 text-sidebar-foreground/50 text-xs">
                    Last 30 days
                  </div>
                  {groupedChats.lastMonth.map((chat) => (
                    <ChatItem
                      chat={chat}
                      isActive={false}
                      key={chat.id}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              )}

              {groupedChats.older.length > 0 && (
                <div>
                  <div className="px-2 py-1 text-sidebar-foreground/50 text-xs">
                    Older than last month
                  </div>
                  {groupedChats.older.map((chat) => (
                    <ChatItem
                      chat={chat}
                      isActive={false}
                      key={chat.id}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              )}
            </div>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      <AlertDialog onOpenChange={setShowDeleteDialog} open={showDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              chat and remove it from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => setShowDeleteDialog(false)}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
