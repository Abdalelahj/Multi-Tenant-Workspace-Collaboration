"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const ioredis_1 = __importDefault(require("ioredis"));
const PRESENCE_TTL_SECONDS = 35;
const RATE_LIMIT_WINDOW_SECONDS = 10;
const RATE_LIMIT_MAX_MESSAGES = 10;
let RedisService = class RedisService {
    config;
    client;
    constructor(config) {
        this.config = config;
        this.client = new ioredis_1.default({
            host: this.config.get('REDIS_HOST', 'localhost'),
            port: this.config.get('REDIS_PORT', 6379),
            lazyConnect: true,
        });
        this.client.connect().catch(console.error);
    }
    async onModuleDestroy() {
        await this.client.quit();
    }
    async setPresence(workspaceId, userId) {
        const key = `presence:${workspaceId}`;
        const memberKey = `presence:${workspaceId}:${userId}`;
        await Promise.all([
            this.client.sadd(key, userId),
            this.client.set(memberKey, '1', 'EX', PRESENCE_TTL_SECONDS),
        ]);
    }
    async removePresence(workspaceId, userId) {
        const key = `presence:${workspaceId}`;
        const memberKey = `presence:${workspaceId}:${userId}`;
        await Promise.all([
            this.client.srem(key, userId),
            this.client.del(memberKey),
        ]);
    }
    async getPresence(workspaceId) {
        const key = `presence:${workspaceId}`;
        const members = await this.client.smembers(key);
        if (members.length === 0)
            return [];
        const ttlChecks = await Promise.all(members.map((uid) => this.client.exists(`presence:${workspaceId}:${uid}`)));
        const expired = [];
        const online = [];
        members.forEach((uid, i) => {
            if (ttlChecks[i] === 1) {
                online.push(uid);
            }
            else {
                expired.push(uid);
            }
        });
        if (expired.length > 0) {
            await this.client.srem(key, ...expired);
        }
        return online;
    }
    async checkRateLimit(workspaceId, userId) {
        const key = `ratelimit:${workspaceId}:${userId}`;
        const count = await this.client.incr(key);
        if (count === 1) {
            await this.client.expire(key, RATE_LIMIT_WINDOW_SECONDS);
        }
        return count <= RATE_LIMIT_MAX_MESSAGES;
    }
    createPubSubClient() {
        return new ioredis_1.default({
            host: this.client.options.host,
            port: this.client.options.port,
        });
    }
};
exports.RedisService = RedisService;
exports.RedisService = RedisService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], RedisService);
//# sourceMappingURL=redis.service.js.map