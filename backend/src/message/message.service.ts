import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { CreateMessageDto } from './dto/create-message.dto';

const PAGE_SIZE = 50;

@Injectable()
export class MessageService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  /**
   * Paginated message history for a channel.
   * Cursor-based pagination: pass `before` (a message ID) to get older messages.
   */
  async findAll(
    workspaceId: string,
    channelId: string,
    requesterWorkspaceId: string,
    before?: string,
  ) {
    if (workspaceId !== requesterWorkspaceId) {
      throw new ForbiddenException('Access denied');
    }

    // Verify channel belongs to this workspace
    const channel = await this.prisma.channel.findUnique({
      where: { id: channelId },
      select: { workspaceId: true },
    });

    if (!channel || channel.workspaceId !== workspaceId) {
      throw new NotFoundException('Channel not found');
    }

    let cursor: { id: string } | undefined;
    if (before) {
      cursor = { id: before };
    }

    const messages = await this.prisma.message.findMany({
      where: { channelId, workspaceId },
      include: {
        author: {
          select: { id: true, name: true, avatarColor: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: PAGE_SIZE,
      ...(cursor ? { skip: 1, cursor } : {}),
    });

    // Return chronological order
    return messages.reverse();
  }

  /**
   * Create a message — applies Redis rate limit before persisting.
   * Rate limit: 10 messages per 10 seconds per user.
   */
  async create(
    workspaceId: string,
    channelId: string,
    dto: CreateMessageDto,
    authorId: string,
    requesterWorkspaceId: string,
  ) {
    if (workspaceId !== requesterWorkspaceId) {
      throw new ForbiddenException('Access denied');
    }

    // ── Redis rate limit ───────────────────────────────────
    const allowed = await this.redis.checkRateLimit(workspaceId, authorId);
    if (!allowed) {
      throw new HttpException(
        'Message rate limit exceeded. Max 10 messages per 10 seconds.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // Verify channel belongs to workspace
    const channel = await this.prisma.channel.findUnique({
      where: { id: channelId },
      select: { workspaceId: true },
    });

    if (!channel || channel.workspaceId !== workspaceId) {
      throw new NotFoundException('Channel not found');
    }

    return this.prisma.message.create({
      data: {
        workspaceId,
        channelId,
        authorId,
        content: dto.content,
      },
      include: {
        author: {
          select: { id: true, name: true, avatarColor: true },
        },
      },
    });
  }
}
