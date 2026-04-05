import {
  Injectable,
  ForbiddenException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateChannelDto } from './dto/create-channel.dto';

@Injectable()
export class ChannelService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(workspaceId: string, requesterWorkspaceId: string) {
    if (workspaceId !== requesterWorkspaceId) {
      throw new ForbiddenException('Access denied');
    }
    return this.prisma.channel.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findOne(channelId: string, workspaceId: string) {
    const channel = await this.prisma.channel.findUnique({
      where: { id: channelId },
    });

    if (!channel || channel.workspaceId !== workspaceId) {
      throw new NotFoundException('Channel not found');
    }

    return channel;
  }

  async create(
    workspaceId: string,
    dto: CreateChannelDto,
    requesterWorkspaceId: string,
  ) {
    if (workspaceId !== requesterWorkspaceId) {
      throw new ForbiddenException('Access denied');
    }

    const slug = dto.name.toLowerCase().replace(/\s+/g, '-');

    try {
      return await this.prisma.channel.create({
        data: {
          workspaceId,
          name: slug,
          description: dto.description,
        },
      });
    } catch (e: unknown) {
      if ((e as { code?: string }).code === 'P2002') {
        throw new ConflictException(
          `Channel "${slug}" already exists in this workspace`,
        );
      }
      throw e;
    }
  }
}
