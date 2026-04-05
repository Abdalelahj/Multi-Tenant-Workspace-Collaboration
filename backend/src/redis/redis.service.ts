import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

const PRESENCE_TTL_SECONDS = 35; // slightly more than 30s heartbeat
const RATE_LIMIT_WINDOW_SECONDS = 10;
const RATE_LIMIT_MAX_MESSAGES = 10;

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly client: Redis;

  constructor(private readonly config: ConfigService) {
    this.client = new Redis({
      host: this.config.get<string>('REDIS_HOST', 'localhost'),
      port: this.config.get<number>('REDIS_PORT', 6379),
      lazyConnect: true,
    });
    this.client.connect().catch(console.error);
  }

  async onModuleDestroy() {
    await this.client.quit();
  }

  // ── Presence ──────────────────────────────────────────────

  /**
   * Mark a user as online in a workspace.
   * Uses a Redis Set per workspace. Each member is a userId.
   * TTL is maintained via a separate expiry key (heartbeat pattern).
   */
  async setPresence(workspaceId: string, userId: string): Promise<void> {
    const key = `presence:${workspaceId}`;
    const memberKey = `presence:${workspaceId}:${userId}`;

    await Promise.all([
      this.client.sadd(key, userId),
      // Individual TTL key — if heartbeat stops, user auto-expires
      this.client.set(memberKey, '1', 'EX', PRESENCE_TTL_SECONDS),
    ]);
  }

  /**
   * Remove a user from the presence set (on disconnect).
   */
  async removePresence(workspaceId: string, userId: string): Promise<void> {
    const key = `presence:${workspaceId}`;
    const memberKey = `presence:${workspaceId}:${userId}`;

    await Promise.all([
      this.client.srem(key, userId),
      this.client.del(memberKey),
    ]);
  }

  /**
   * Get all online user IDs in a workspace.
   * Filters out members whose TTL key has expired (stale members).
   */
  async getPresence(workspaceId: string): Promise<string[]> {
    const key = `presence:${workspaceId}`;
    const members = await this.client.smembers(key);

    if (members.length === 0) return [];

    // Check which members still have a live TTL key
    const ttlChecks = await Promise.all(
      members.map((uid) =>
        this.client.exists(`presence:${workspaceId}:${uid}`),
      ),
    );

    const expired: string[] = [];
    const online: string[] = [];

    members.forEach((uid, i) => {
      if (ttlChecks[i] === 1) {
        online.push(uid);
      } else {
        expired.push(uid);
      }
    });

    // Clean up stale members lazily
    if (expired.length > 0) {
      await this.client.srem(key, ...expired);
    }

    return online;
  }

  // ── Rate Limiting ────────────────────────────────────────

  /**
   * Sliding-window rate limit: max 10 messages per 10 seconds per user.
   * Returns true if the action is ALLOWED, false if rate-limited.
   *
   * Pattern: atomic INCR + EXPIRE.
   * First call sets the counter to 1 and the TTL starts.
   * Subsequent calls within the window increment the counter.
   */
  async checkRateLimit(workspaceId: string, userId: string): Promise<boolean> {
    const key = `ratelimit:${workspaceId}:${userId}`;

    const count = await this.client.incr(key);

    if (count === 1) {
      // First message in this window — set expiry
      await this.client.expire(key, RATE_LIMIT_WINDOW_SECONDS);
    }

    return count <= RATE_LIMIT_MAX_MESSAGES;
  }

  // ── Pub/Sub (for horizontal scaling) ────────────────────

  /**
   * Returns a dedicated Redis client for pub/sub.
   * Socket.io Redis adapter uses this for multi-instance scale-out.
   */
  createPubSubClient(): Redis {
    return new Redis({
      host: this.client.options.host,
      port: this.client.options.port,
    });
  }
}
