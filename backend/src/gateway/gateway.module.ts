import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { PresenceModule } from '../presence/presence.module';
import { MessageModule } from '../message/message.module';

@Module({
  imports: [PresenceModule, MessageModule],
  providers: [ChatGateway],
})
export class GatewayModule {}
