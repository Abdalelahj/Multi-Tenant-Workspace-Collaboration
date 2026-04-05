'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Send } from 'lucide-react';
import { Socket } from 'socket.io-client';
import { cn } from '@/lib/utils';

interface MessageInputProps {
  channelName: string;
  onSend: (content: string) => void;
  isRateLimited: boolean;
  socket: Socket | null;
  channelId: string;
  disabled?: boolean;
}

export function MessageInput({
  channelName,
  onSend,
  isRateLimited,
  socket,
  channelId,
  disabled,
}: MessageInputProps) {
  const [value, setValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const stopTyping = useCallback(() => {
    if (isTyping) {
      socket?.emit('typing_stop', { channelId });
      setIsTyping(false);
    }
  }, [isTyping, socket, channelId]);

  useEffect(() => {
    return () => {
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);

    if (!isTyping && e.target.value) {
      socket?.emit('typing_start', { channelId });
      setIsTyping(true);
    }

    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(stopTyping, 2000);

    if (!e.target.value) stopTyping();
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmed = value.trim();
    if (!trimmed || disabled || isRateLimited) return;

    onSend(trimmed);
    setValue('');
    stopTyping();
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="px-4 pb-4 pt-2">
      {isRateLimited && (
        <div className="mb-2 px-3 py-2 bg-red-900/40 border border-red-700 rounded-md text-xs text-red-400">
          ⚠ Slow down! Rate limit reached (10 messages / 10s). Please wait.
        </div>
      )}
      <form
        onSubmit={handleSubmit}
        className={cn(
          'flex items-end gap-2 bg-gray-800 border border-gray-700 rounded-xl px-3 py-2',
          'focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-all',
        )}
      >
        <textarea
          ref={inputRef}
          id="message-input"
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={`Message #${channelName}`}
          disabled={disabled || isRateLimited}
          rows={1}
          className="flex-1 bg-transparent text-sm text-white placeholder-gray-500 resize-none focus:outline-none max-h-36 overflow-y-auto"
          style={{ lineHeight: '1.5rem' }}
        />
        <button
          type="submit"
          disabled={!value.trim() || disabled || isRateLimited}
          className="shrink-0 p-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="Send message"
        >
          <Send size={16} />
        </button>
      </form>
      <p className="text-xs text-gray-600 mt-1 text-right">
        Enter to send · Shift+Enter for new line
      </p>
    </div>
  );
}
