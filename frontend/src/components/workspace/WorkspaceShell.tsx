'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Workspace, Channel, PresenceUser } from '@/types';
import { WorkspaceSidebar } from '@/components/sidebar/WorkspaceSidebar';
import { SEED_USERS, SeedUser } from '@/lib/constants';
import { getSocket } from '@/lib/socket';
import { usePresence } from '@/hooks/usePresence';

interface WorkspaceShellProps {
  workspace: Workspace;
  channels: Channel[];
  children: React.ReactNode;
}

/**
 * WorkspaceShell — CSR wrapper around the SSR-fetched workspace data.
 * Manages the active user session (from sessionStorage) and provides
 * the context (userId, workspaceId) down to all child components.
 */
export function WorkspaceShell({ workspace, channels, children }: WorkspaceShellProps) {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<SeedUser | null>(null);

  useEffect(() => {
    const userId = sessionStorage.getItem('reasonix_user_id');
    const slug = sessionStorage.getItem('reasonix_workspace_slug');

    if (!userId || slug !== workspace.slug) {
      router.replace('/');
      return;
    }

    const user = SEED_USERS.find((u) => u.id === userId) ?? null;
    if (!user) {
      router.replace('/');
      return;
    }

    setCurrentUser(user);
  }, [workspace.slug, router]);

  const socket = currentUser
    ? getSocket(currentUser.id, workspace.id)
    : null;

  const { onlineUsers } = usePresence({
    workspaceId: workspace.id,
    userId: currentUser?.id ?? '',
    socket,
  });

  const handleUserSwitch = (user: SeedUser) => {
    sessionStorage.setItem('reasonix_user_id', user.id);
    sessionStorage.setItem('reasonix_workspace_slug', user.workspaceSlug);
    
    // Always do a hard reload when switching users to cleanly reset sockets and state
    if (user.workspaceSlug !== workspace.slug) {
      window.location.href = `/${user.workspaceSlug}`;
    } else {
      window.location.reload();
    }
  };

  if (!currentUser) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-950">
        <div className="animate-spin w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-950 overflow-hidden">
      <WorkspaceSidebar
        workspace={workspace}
        channels={channels}
        currentUser={currentUser}
        onUserSwitch={handleUserSwitch}
        onlineUsers={onlineUsers}
      />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {children}
      </div>
    </div>
  );
}
