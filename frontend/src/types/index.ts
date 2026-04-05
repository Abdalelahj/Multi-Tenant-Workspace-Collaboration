export interface Workspace {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  channels?: Channel[];
}

export interface User {
  id: string;
  workspaceId: string;
  name: string;
  email: string;
  avatarColor: string;
  createdAt: string;
}

export interface Channel {
  id: string;
  workspaceId: string;
  name: string;
  description?: string;
  createdAt: string;
}

export interface Message {
  id: string;
  workspaceId: string;
  channelId: string;
  authorId: string;
  content: string;
  editedAt?: string | null;
  createdAt: string;
  author: Pick<User, 'id' | 'name' | 'avatarColor'>;
}

export interface PresenceUser {
  id: string;
  name: string;
  avatarColor: string;
}

/** Shape sent by socket presence:update event */
export interface PresenceUpdate {
  userId: string;
  name: string;
  online: boolean;
}

/** Shape of user typing event */
export interface TypingEvent {
  userId: string;
  name: string;
  channelId: string;
}
