import { NextRequest, NextResponse } from "next/server";
import { getVideoDetailWithStatistics } from "../../dao/ytVideoStatisticsDao";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const video_id = searchParams.get("video_id");

  if (!video_id) {
    return NextResponse.json(
      { success: false, error: "video_id is required" },
      { status: 400 }
    );
  }

  const result = await getVideoDetailWithStatistics(video_id);
  return NextResponse.json(result);
}
