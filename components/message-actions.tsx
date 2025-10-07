import type { Message } from "ai";
import equal from "fast-deep-equal";
import { CopyIcon } from "lucide-react";
import { memo } from "react";
import { toast } from "sonner";
import { useCopyToClipboard } from "usehooks-ts";

import { Button } from "./ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { cn } from "@/lib/utils";

interface MessageActionsProps {
  message: Message;
  isLoading: boolean;
  className?: string;
}

function PureMessageActions({ message, isLoading, className }: MessageActionsProps) {
  const [, copyToClipboard] = useCopyToClipboard();

  if (isLoading) return null;
  if (message.role === "user") return null;

  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="icon"
            variant="ghost"
            className={cn("h-7 w-7 text-muted-foreground", className)}
            onClick={async () => {
              const textFromParts = message.parts
                ?.filter((part) => part.type === "text")
                .map((part) => part.text)
                .join("\n")
                .trim();

              if (!textFromParts) {
                toast.error("There's no text to copy!");
                return;
              }

              await copyToClipboard(textFromParts);
              toast.success("Copied to clipboard!");
            }}
          >
            <CopyIcon className="size-3.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Copy</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export const MessageActions = memo(PureMessageActions, (prev, next) => {
  if (prev.isLoading !== next.isLoading) return false;
  if (prev.className !== next.className) return false;
  if (!equal(prev.message.parts, next.message.parts)) return false;
  return true;
});
