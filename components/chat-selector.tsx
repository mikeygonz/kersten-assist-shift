import { MenuIcon } from 'lucide-react';
import { Button } from './ui/button';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from './ui/command';
import { useState } from 'react';
import { CommandLoading } from 'cmdk';
import { useChatHistory } from '@/hooks/use-chat-history';

interface ChatSelectorProps {
  className?: string;
  icon?: React.ReactNode;
  popoverAlign?: 'start' | 'center' | 'end';
  sideOffset?: number;
}

export function ChatSelector({ className, icon, popoverAlign = 'end', sideOffset = 6 }: ChatSelectorProps) {
  const [open, setOpen] = useState(false);
  const { sessions, selectChat, isLoaded } = useChatHistory();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          role="combobox"
          aria-expanded={open}
          className={className}
        >
          {icon ?? <MenuIcon className="size-4" />}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[300px] p-0 rounded-lg border-[#DADCE0] shadow-[0_8px_24px_rgba(0,0,0,0.08)]"
        align={popoverAlign}
        sideOffset={sideOffset}
      >
        <Command>
          <CommandInput placeholder="Search chats..." />
          <CommandList>
            <CommandEmpty>No chat found.</CommandEmpty>
            <CommandGroup>
              {!isLoaded && <CommandLoading>Loading...</CommandLoading>}
              {sessions.map((chat) => (
                <CommandItem
                  key={chat.id}
                  value={chat.id}
                  onSelect={() => {
                    if (!isLoaded) {
                      return;
                    }
                    selectChat(chat.id);
                    setOpen(false);
                  }}
                >
                  {chat.title}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
