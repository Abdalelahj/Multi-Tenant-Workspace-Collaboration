'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Channel, Workspace } from '@/types';
import { PresenceUser } from '@/types';
import { Avatar } from '@/components/ui/Avatar';
import { ChannelItem } from './ChannelItem';
import { UserSwitcher } from '@/components/workspace/UserSwitcher';
import { SeedUser } from '@/lib/constants';
import { apiFetch } from '@/lib/api';
import { useRouter } from 'next/navigation';

interface WorkspaceSidebarProps {
  workspace: Workspace;
  channels: Channel[];
  currentUser: SeedUser;
  onUserSwitch: (user: SeedUser) => void;
  onlineUsers: PresenceUser[];
}

export function WorkspaceSidebar({
  workspace,
  channels,
  currentUser,
  onUserSwitch,
  onlineUsers,
}: WorkspaceSidebarProps) {
  const router = useRouter();
  const [newChannelName, setNewChannelName] = useState('');
  const [creating, setCreating] = useState(false);
  const [showInput, setShowInput] = useState(false);

  const handleCreateChannel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChannelName.trim()) return;
    setCreating(true);

    try {
      await apiFetch<Channel>(
        `/workspaces/${workspace.id}/channels`,
        {
          method: 'POST',
          body: JSON.stringify({ name: newChannelName.trim() }),
          userId: currentUser.id,
          workspaceId: workspace.id,
        },
      );
      setNewChannelName('');
      setShowInput(false);
      router.refresh(); // trigger SSR revalidation
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  return (
    <aside className="w-60 shrink-0 bg-gray-900 border-r border-gray-800 flex flex-col h-full">
      {/* Workspace Header */}
      <div className="px-4 py-3 border-b border-gray-800">
        <h1 className="font-bold text-white truncate">{workspace.name}</h1>
        <p className="text-xs text-gray-500 truncate">{workspace.slug}</p>
      </div>

      {/* Channels */}
      <div className="flex-1 overflow-y-auto py-3">
        <div className="px-3 mb-1 flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Channels
          </span>
          <button
            onClick={() => setShowInput((v) => !v)}
            className="text-gray-500 hover:text-white transition-colors"
            title="Create channel"
          >
            <Plus size={15} />
          </button>
        </div>

        {showInput && (
          <form onSubmit={handleCreateChannel} className="px-3 mb-2">
            <input
              autoFocus
              value={newChannelName}
              onChange={(e) => setNewChannelName(e.target.value)}
              placeholder="channel-name"
              disabled={creating}
              className="w-full rounded bg-gray-800 border border-gray-700 px-2 py-1 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </form>
        )}

        <nav className="px-2 flex flex-col gap-0.5">
          {channels.map((ch) => (
            <ChannelItem
              key={ch.id}
              channel={ch}
              workspaceSlug={workspace.slug}
            />
          ))}
        </nav>

        {/* Online Members */}
        {onlineUsers.length > 0 && (
          <div className="mt-4 px-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Online — {onlineUsers.length}
            </p>
            <div className="flex flex-col gap-1.5">
              {onlineUsers.map((u) => (
                <div key={u.id} className="flex items-center gap-2">
                  <Avatar name={u.name} color={u.avatarColor} size="sm" online />
                  <span className="text-xs text-gray-300 truncate">{u.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* User Switcher */}
      <div className="p-2 border-t border-gray-800">
        <UserSwitcher currentUser={currentUser} onSwitch={onUserSwitch} />
      </div>
    </aside>
  );
}
