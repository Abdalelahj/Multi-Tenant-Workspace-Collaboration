'use client';

import { useState } from 'react';
import { SEED_USERS, SeedUser } from '@/lib/constants';
import { Avatar } from '@/components/ui/Avatar';
import { ChevronDown } from 'lucide-react';

interface UserSwitcherProps {
  currentUser: SeedUser;
  onSwitch: (user: SeedUser) => void;
}

export function UserSwitcher({ currentUser, onSwitch }: UserSwitcherProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 w-full p-2 rounded-lg hover:bg-gray-800 transition-colors"
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <Avatar name={currentUser.name} color={currentUser.avatarColor} size="sm" />
        <div className="flex-1 min-w-0 text-left">
          <p className="text-sm font-semibold text-white truncate">{currentUser.name}</p>
          <p className="text-xs text-gray-400 truncate">{currentUser.workspaceSlug}</p>
        </div>
        <ChevronDown
          size={14}
          className={`text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute bottom-full left-0 right-0 mb-1 bg-gray-900 border border-gray-700 rounded-lg shadow-xl overflow-hidden z-50"
        >
          <p className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-800">
            Switch User
          </p>
          {SEED_USERS.map((user) => (
            <button
              key={user.id}
              role="option"
              aria-selected={user.id === currentUser.id}
              onClick={() => {
                onSwitch(user);
                setOpen(false);
              }}
              className={`flex items-center gap-3 w-full px-3 py-2.5 text-left hover:bg-gray-800 transition-colors ${
                user.id === currentUser.id ? 'bg-gray-800' : ''
              }`}
            >
              <Avatar name={user.name} color={user.avatarColor} size="sm" />
              <div className="min-w-0">
                <p className="text-sm text-white font-medium">{user.name}</p>
                <p className="text-xs text-gray-400">{user.email}</p>
              </div>
              <span
                className={`ml-auto text-xs px-1.5 py-0.5 rounded font-medium ${
                  user.workspaceSlug === 'acme-corp'
                    ? 'bg-indigo-900 text-indigo-300'
                    : 'bg-emerald-900 text-emerald-300'
                }`}
              >
                {user.workspaceSlug}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
