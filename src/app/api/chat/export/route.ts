export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { auth } from '@clerk/nextjs/server';
import { eq, and } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

import { db } from '@/src/db';
import { therapists, users, chatChannels, chatMessages } from '@/src/db/schema';

// Feature flag check
const CHAT_FEATURE_ENABLED = process.env.NEXT_PUBLIC_ENABLE_CHAT_FEATURE === 'true';

export async function GET(request: NextRequest) {
  if (!CHAT_FEATURE_ENABLED) {
    return new Response('Chat feature disabled', { status: 404 });
  }

  try {
    const { userId } = await auth();
    if (!userId) {
      return new Response('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const channelId = searchParams.get('channelId');

    if (!channelId) {
      return NextResponse.json({ error: 'Channel ID is required' }, { status: 400 });
    }

    const channelIdNum = parseInt(channelId);
    if (isNaN(channelIdNum)) {
      return NextResponse.json({ error: 'Invalid channel ID' }, { status: 400 });
    }

    // Verify user has access to this channel
    const user = await db.select().from(users).where(eq(users.clerkId, userId)).limit(1);
    if (!user.length) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const dbUserId = user[0].id;

    // Check if user is therapist
    const isTherapist = await db
      .select()
      .from(therapists)
      .where(eq(therapists.userId, dbUserId))
      .limit(1);

    // Verify access to channel (only therapists can export for compliance)
    if (!isTherapist.length) {
      return NextResponse.json(
        { error: 'Only therapists can export chat messages' },
        { status: 403 },
      );
    }

    const channel = await db
      .select({
        id: chatChannels.id,
        therapistId: chatChannels.therapistId,
        prospectUserId: chatChannels.prospectUserId,
      })
      .from(chatChannels)
      .where(
        and(eq(chatChannels.id, channelIdNum), eq(chatChannels.therapistId, isTherapist[0].id)),
      )
      .limit(1);

    if (!channel.length) {
      return NextResponse.json({ error: 'Channel not found or access denied' }, { status: 403 });
    }

    // Get client information
    const clientInfo = await db
      .select({
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
      })
      .from(users)
      .where(eq(users.id, channel[0].prospectUserId))
      .limit(1);

    // Get therapist information
    const therapistInfo = await db
      .select({
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
      })
      .from(users)
      .where(eq(users.id, user[0].id))
      .limit(1);

    // Fetch all messages for the channel
    const messages = await db
      .select({
        id: chatMessages.id,
        messageId: chatMessages.chimeMessageId,
        senderId: chatMessages.senderId,
        content: chatMessages.content,
        messageType: chatMessages.messageType,
        status: chatMessages.status,
        sentAt: chatMessages.sentAt,
        senderFirstName: users.firstName,
        senderLastName: users.lastName,
        senderEmail: users.email,
      })
      .from(chatMessages)
      .innerJoin(users, eq(chatMessages.senderId, users.id))
      .where(eq(chatMessages.channelId, channelIdNum))
      .orderBy(chatMessages.sentAt);

    // Create export content
    const clientName = `${clientInfo[0]?.firstName || ''} ${clientInfo[0]?.lastName || ''}`.trim();
    const therapistName =
      `${therapistInfo[0]?.firstName || ''} ${therapistInfo[0]?.lastName || ''}`.trim();
    const exportDate = new Date().toLocaleString();

    const content = [
      '='.repeat(80),
      'CONFIDENTIAL CHAT TRANSCRIPT - FOR COMPLIANCE PURPOSES ONLY',
      '='.repeat(80),
      '',
      `Export Date: ${exportDate}`,
      `Therapist: ${therapistName} (${therapistInfo[0]?.email})`,
      `Client: ${clientName} (${clientInfo[0]?.email})`,
      `Channel ID: ${channelId}`,
      `Total Messages: ${messages.length}`,
      '',
      '='.repeat(80),
      'CHAT TRANSCRIPT',
      '='.repeat(80),
      '',
      ...messages
        .map((message) => [
          `[${message.sentAt.toLocaleString()}] ${message.senderFirstName} ${message.senderLastName}:`,
          message.content,
          '',
        ])
        .flat(),
      '',
      '='.repeat(80),
      'END OF TRANSCRIPT',
      '='.repeat(80),
      '',
      'This transcript is confidential and protected by therapist-client privilege.',
      'Unauthorized disclosure is prohibited by law.',
      `Generated on ${exportDate} for compliance and record-keeping purposes.`,
    ].join('\n');

    // Return the content as a downloadable file
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    const filename = `chat-transcript-${clientName.replace(/[^a-zA-Z0-9]/g, '-')}-${timestamp}.txt`;

    return new Response(content, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    console.error('❌ Chat export error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
