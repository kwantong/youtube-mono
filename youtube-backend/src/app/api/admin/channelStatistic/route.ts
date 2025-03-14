import { NextRequest, NextResponse } from "next/server";
import { searchChannelStatistics } from "../../dao/ytChannelStatisticsDao";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const channel_id = searchParams.get("channel_id") || undefined;
    const snapshot_date = searchParams.get("snapshot_date") || undefined;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || "10", 10);

    const data = await searchChannelStatistics({
      channel_id,
      snapshot_date,
      page,
      pageSize,
    });
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
