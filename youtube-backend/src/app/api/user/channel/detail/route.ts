import { NextRequest, NextResponse } from "next/server";
import { getChannelDetailWithStatistics } from "../../../dao/ytChannelStatisticsDao";
import { getVideosByChannelId } from "../../../dao/ytVideoDataDao";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const channel_id = searchParams.get("channel_id");
  const page = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = parseInt(searchParams.get("pageSize") || "10", 10);

  if (!channel_id) {
    return NextResponse.json(
      { success: false, error: "channel_id is required" },
      { status: 400 }
    );
  }

  try {
    // 获取频道信息 & 统计数据
    const channelResult = await getChannelDetailWithStatistics(channel_id);

    if (!channelResult.success) {
      return NextResponse.json(channelResult, { status: 404 });
    }

    // 获取分页视频
    const videosResult = await getVideosByChannelId(channel_id, page, pageSize);

    return NextResponse.json({
      success: true,
      channel: channelResult.channel,
      statistics: channelResult.statistics,
      videos: videosResult.videos,
      videoPagination: {
        totalCount: videosResult.totalCount,
        totalPages: videosResult.totalPages,
        currentPage: videosResult.currentPage,
      },
    });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
