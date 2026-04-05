'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SEED_USERS, SeedUser } from '@/lib/constants';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';

export function LandingClient() {
  const router = useRouter();
  const [selected, setSelected] = useState<SeedUser | null>(null);

  const handleEnter = () => {
    if (!selected) return;
    // Persist selection to sessionStorage for the workspace layout to read
    sessionStorage.setItem('reasonix_user_id', selected.id);
    sessionStorage.setItem('reasonix_workspace_slug', selected.workspaceSlug);
    router.push(`/${selected.workspaceSlug}`);
  };

  const tenantA = SEED_USERS.filter((u) => u.workspaceSlug === 'acme-corp');
  const tenantB = SEED_USERS.filter((u) => u.workspaceSlug === 'globex');

  return (
    <div className="w-full max-w-lg">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600 mb-4">
          <span className="text-2xl font-black text-white">R</span>
        </div>
        <h1 className="text-3xl font-bold text-white">Reasonix</h1>
        <p className="text-gray-400 mt-2 text-sm">
          Multi-tenant workspace collaboration platform
        </p>
      </div>

      {/* Workspace Selector */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-gray-800">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Tenant A — Acme Corp
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {tenantA.map((user) => (
              <UserCard
                key={user.id}
                user={user}
                selected={selected?.id === user.id}
                onSelect={() => setSelected(user)}
              />
            ))}
          </div>
        </div>

        <div className="p-5">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Tenant B — Globex
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {tenantB.map((user) => (
              <UserCard
                key={user.id}
                user={user}
                selected={selected?.id === user.id}
                onSelect={() => setSelected(user)}
              />
            ))}
          </div>
        </div>

        <div className="px-5 pb-5">
          <Button
            onClick={handleEnter}
            disabled={!selected}
            className="w-full justify-center py-2.5"
          >
            {selected
              ? `Enter as ${selected.name} →`
              : 'Select a user to continue'}
          </Button>
        </div>
      </div>

      <p className="text-center text-xs text-gray-600 mt-4">
        Users in different tenants cannot see each other&apos;s data.
      </p>
    </div>
  );
}

function UserCard({
  user,
  selected,
  onSelect,
}: {
  user: SeedUser;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
        selected
          ? 'border-indigo-500 bg-indigo-900/30'
          : 'border-gray-800 hover:border-gray-600 hover:bg-gray-800'
      }`}
    >
      <Avatar name={user.name} color={user.avatarColor} size="md" />
      <div className="min-w-0">
        <p className="text-sm font-semibold text-white truncate">{user.name}</p>
        <p className="text-xs text-gray-500 truncate">{user.email}</p>
      </div>
    </button>
  );
}
