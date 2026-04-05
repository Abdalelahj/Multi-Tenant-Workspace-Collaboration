'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Hash } from 'lucide-react';
import { Channel } from '@/types';
import { cn } from '@/lib/utils';

interface ChannelItemProps {
  channel: Channel;
  workspaceSlug: string;
  isOnline?: boolean;
}

export function ChannelItem({ channel, workspaceSlug }: ChannelItemProps) {
  const pathname = usePathname();
  const href = `/${workspaceSlug}/channels/${channel.id}`;
  const active = pathname === href;

  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors group',
        active
          ? 'bg-gray-700 text-white font-medium'
          : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200',
      )}
    >
      <Hash size={15} className="shrink-0 opacity-60" />
      <span className="truncate">{channel.name}</span>
    </Link>
  );
}
