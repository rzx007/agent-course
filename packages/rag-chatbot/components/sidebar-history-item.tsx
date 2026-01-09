import { memo, useState } from "react";
import Link from "next/link";
import { SidebarMenuButton, SidebarMenuItem } from "./ui/sidebar";
import {
  MoreHorizontal,
  Share2,
  Lock,
  Globe,
  CheckCircle,
  Trash2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { SidebarMenuAction } from "./ui/sidebar";

export type ChatItemData = {
  id: string;
  title: string;
};

const PureChatItem = ({
  chat,
  isActive,
  onDelete,
}: {
  chat: ChatItemData;
  isActive: boolean;
  onDelete?: (chatId: string) => void;
}) => {
  const [visibilityType, setVisibilityType] = useState<"private" | "public">(
    "private"
  );

  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={isActive}>
        <Link href={`/chat/${chat.id}`}>
          <span>{chat.title}</span>
        </Link>
      </SidebarMenuButton>

      <DropdownMenu modal={true}>
        <DropdownMenuTrigger asChild>
          <SidebarMenuAction
            className="mr-0.5 data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            showOnHover={!isActive}
          >
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">More</span>
          </SidebarMenuAction>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" side="bottom">
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="cursor-pointer">
              <Share2 className="h-4 w-4" />
              <span>Share</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <DropdownMenuItem
                  className="cursor-pointer flex-row justify-between"
                  onClick={() => setVisibilityType("private")}
                >
                  <div className="flex flex-row items-center gap-2">
                    <Lock className="h-3 w-3" />
                    <span>Private</span>
                  </div>
                  {visibilityType === "private" ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : null}
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer flex-row justify-between"
                  onClick={() => setVisibilityType("public")}
                >
                  <div className="flex flex-row items-center gap-2">
                    <Globe className="h-3 w-3" />
                    <span>Public</span>
                  </div>
                  {visibilityType === "public" ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : null}
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>

          <DropdownMenuItem
            className="cursor-pointer text-destructive focus:bg-destructive/15 focus:text-destructive dark:text-red-500"
            onSelect={() => onDelete?.(chat.id)}
          >
            <Trash2 className="h-4 w-4" />
            <span>删除</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  );
};

export const ChatItem = memo(PureChatItem, (prevProps, nextProps) => {
  if (prevProps.isActive !== nextProps.isActive) {
    return false;
  }
  return true;
});
