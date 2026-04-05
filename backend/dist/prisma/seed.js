"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🌱 Seeding database...');
    const workspaceA = await prisma.workspace.upsert({
        where: { slug: 'acme-corp' },
        update: {},
        create: {
            name: 'Acme Corp',
            slug: 'acme-corp',
        },
    });
    const aliceId = 'user_alice_acme';
    const bobId = 'user_bob_acme';
    await prisma.user.upsert({
        where: { email: 'alice@acme.com' },
        update: {},
        create: {
            id: aliceId,
            workspaceId: workspaceA.id,
            name: 'Alice',
            email: 'alice@acme.com',
            avatarColor: '#6366f1',
        },
    });
    await prisma.user.upsert({
        where: { email: 'bob@acme.com' },
        update: {},
        create: {
            id: bobId,
            workspaceId: workspaceA.id,
            name: 'Bob',
            email: 'bob@acme.com',
            avatarColor: '#f59e0b',
        },
    });
    const generalA = await prisma.channel.upsert({
        where: { workspaceId_name: { workspaceId: workspaceA.id, name: 'general' } },
        update: {},
        create: {
            workspaceId: workspaceA.id,
            name: 'general',
            description: 'General discussion for Acme Corp',
        },
    });
    await prisma.channel.upsert({
        where: { workspaceId_name: { workspaceId: workspaceA.id, name: 'engineering' } },
        update: {},
        create: {
            workspaceId: workspaceA.id,
            name: 'engineering',
            description: 'Engineering team channel',
        },
    });
    await prisma.message.createMany({
        skipDuplicates: true,
        data: [
            {
                id: 'msg_seed_a1',
                workspaceId: workspaceA.id,
                channelId: generalA.id,
                authorId: aliceId,
                content: 'Hey team! Welcome to Acme Corp workspace 👋',
            },
            {
                id: 'msg_seed_a2',
                workspaceId: workspaceA.id,
                channelId: generalA.id,
                authorId: bobId,
                content: 'Thanks Alice! Excited to collaborate here.',
            },
        ],
    });
    const workspaceB = await prisma.workspace.upsert({
        where: { slug: 'globex' },
        update: {},
        create: {
            name: 'Globex',
            slug: 'globex',
        },
    });
    const carolId = 'user_carol_globex';
    const daveId = 'user_dave_globex';
    await prisma.user.upsert({
        where: { email: 'carol@globex.com' },
        update: {},
        create: {
            id: carolId,
            workspaceId: workspaceB.id,
            name: 'Carol',
            email: 'carol@globex.com',
            avatarColor: '#10b981',
        },
    });
    await prisma.user.upsert({
        where: { email: 'dave@globex.com' },
        update: {},
        create: {
            id: daveId,
            workspaceId: workspaceB.id,
            name: 'Dave',
            email: 'dave@globex.com',
            avatarColor: '#ef4444',
        },
    });
    const generalB = await prisma.channel.upsert({
        where: { workspaceId_name: { workspaceId: workspaceB.id, name: 'general' } },
        update: {},
        create: {
            workspaceId: workspaceB.id,
            name: 'general',
            description: 'General discussion for Globex',
        },
    });
    await prisma.channel.upsert({
        where: { workspaceId_name: { workspaceId: workspaceB.id, name: 'product' } },
        update: {},
        create: {
            workspaceId: workspaceB.id,
            name: 'product',
            description: 'Product team channel',
        },
    });
    await prisma.message.createMany({
        skipDuplicates: true,
        data: [
            {
                id: 'msg_seed_b1',
                workspaceId: workspaceB.id,
                channelId: generalB.id,
                authorId: carolId,
                content: 'Hello Globex team! 🚀 Ready to build something great.',
            },
            {
                id: 'msg_seed_b2',
                workspaceId: workspaceB.id,
                channelId: generalB.id,
                authorId: daveId,
                content: 'Absolutely! Let\'s ship it.',
            },
        ],
    });
    console.log('✅ Seed complete.');
    console.log('');
    console.log('Tenant A — Acme Corp:');
    console.log(`  Workspace ID: ${workspaceA.id}`);
    console.log('  Users: alice@acme.com, bob@acme.com');
    console.log('');
    console.log('Tenant B — Globex:');
    console.log(`  Workspace ID: ${workspaceB.id}`);
    console.log('  Users: carol@globex.com, dave@globex.com');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map