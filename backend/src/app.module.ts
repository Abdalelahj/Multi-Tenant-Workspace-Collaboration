import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis/redis.module';
import { WorkspaceModule } from './workspace/workspace.module';
import { ChannelModule } from './channel/channel.module';
import { MessageModule } from './message/message.module';
import { PresenceModule } from './presence/presence.module';
import { GatewayModule } from './gateway/gateway.module';

@Module({
  imports: [
    // Config — makes env vars available app-wide
    ConfigModule.forRoot({ isGlobal: true }),

    // Data layers (global — injected everywhere without re-importing)
    PrismaModule,
    RedisModule,

    // Feature modules
    WorkspaceModule,
    ChannelModule,
    MessageModule,
    PresenceModule,

    // WebSocket gateway
    GatewayModule,
  ],
})
export class AppModule {}
