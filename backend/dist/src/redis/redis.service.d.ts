import { OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
export declare class RedisService implements OnModuleDestroy {
    private readonly config;
    private readonly client;
    constructor(config: ConfigService);
    onModuleDestroy(): Promise<void>;
    setPresence(workspaceId: string, userId: string): Promise<void>;
    removePresence(workspaceId: string, userId: string): Promise<void>;
    getPresence(workspaceId: string): Promise<string[]>;
    checkRateLimit(workspaceId: string, userId: string): Promise<boolean>;
    createPubSubClient(): Redis;
}
