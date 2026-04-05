'use client';

import { Message } from '@/types';
import { Avatar } from '@/components/ui/Avatar';
import { Spinner } from '@/components/ui/Spinner';
import { formatTime } from '@/lib/utils';

interface MessageListProps {
  messages: Message[];
  loading: boolean;
  currentUserId: string;
  bottomRef: React.RefObject<HTMLDivElement>;
  typingUsers: string[];
}

export function MessageList({
  messages,
  loading,
  currentUserId,
  bottomRef,
  typingUsers,
}: MessageListProps) {
  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  const grouped = groupByAuthor(messages);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-1">
      {messages.length === 0 && (
        <div className="flex flex-col items-center justify-center h-full text-gray-600">
          <p className="text-lg font-semibold">No messages yet</p>
          <p className="text-sm mt-1">Be the first to say something 👋</p>
        </div>
      )}

      {grouped.map((group) => (
        <div key={group.firstId} className="flex gap-3 mt-3 group">
          <Avatar
            name={group.author.name}
            color={group.author.avatarColor}
            size="md"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2 mb-0.5">
              <span
                className={`text-sm font-semibold ${
                  group.author.id === currentUserId ? 'text-indigo-400' : 'text-white'
                }`}
              >
                {group.author.id === currentUserId ? 'You' : group.author.name}
              </span>
              <span className="text-xs text-gray-600">
                {formatTime(group.messages[0].createdAt)}
              </span>
            </div>
            {group.messages.map((msg) => (
              <p
                key={msg.id}
                className={`text-sm leading-relaxed text-gray-200 break-words ${
                  msg.id.startsWith('opt_') ? 'opacity-60' : ''
                }`}
              >
                {msg.content}
              </p>
            ))}
          </div>
        </div>
      ))}

      {/* Typing indicator */}
      {typingUsers.length > 0 && (
        <div className="flex items-center gap-2 mt-2 text-gray-500 text-xs">
          <span className="flex gap-0.5">
            <span className="animate-bounce delay-0">•</span>
            <span className="animate-bounce delay-75">•</span>
            <span className="animate-bounce delay-150">•</span>
          </span>
          <span>
            {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing…
          </span>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}

interface MessageGroup {
  firstId: string;
  author: { id: string; name: string; avatarColor: string };
  messages: Message[];
}

function groupByAuthor(messages: Message[]): MessageGroup[] {
  const groups: MessageGroup[] = [];
  for (const msg of messages) {
    const last = groups[groups.length - 1];
    if (last && last.author.id === msg.authorId) {
      last.messages.push(msg);
    } else {
      groups.push({
        firstId: msg.id,
        author: msg.author,
        messages: [msg],
      });
    }
  }
  return groups;
}
