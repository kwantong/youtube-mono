import { NextRequest, NextResponse } from "next/server";
import {
  getAllChannelIds,
  insertChannelId,
  updateChannelIdIsDeleted,
} from "../../dao/dao";

export async function GET(request: NextRequest) {
  const res = await getAllChannelIds();
  return NextResponse.json(res);
}

export async function POST(request: NextRequest) {
  try {
    const { channelId, channelName } = await request.json();
    if (!channelId) {
      return NextResponse.json(
        { error: "channelId is required" },
        { status: 400 }
      );
    }
    await insertChannelId(channelId, channelName);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id, isDelete } = await request.json();

    if (!id || isDelete === undefined) {
      return NextResponse.json(
        { error: "ID and isDelete are required" },
        { status: 400 }
      );
    }

    if (![1, 2].includes(isDelete)) {
      return NextResponse.json(
        { error: "isDelete must be 1 or 2" },
        { status: 400 }
      );
    }

    await updateChannelIdIsDeleted(id, isDelete);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
