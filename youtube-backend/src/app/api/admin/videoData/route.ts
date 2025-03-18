import { NextRequest, NextResponse } from "next/server";
import { searchVideos } from "../../dao/ytVideoDataDao";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const channel_id = searchParams.get("channel_id") || undefined;
    const video_id = searchParams.get("video_id") || undefined;
    const video_published_at =
      searchParams.get("video_published_at") || undefined;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || "10", 10);

    const { rows, totalCount } = await searchVideos({
      channel_id,
      video_id,
      video_published_at,
      page,
      pageSize,
    });
    const totalPages = Math.ceil(totalCount / pageSize);

    return NextResponse.json({
      success: true,
      data: rows,
      totalCount,
      totalPages,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
