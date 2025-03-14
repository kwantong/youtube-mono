import { NextRequest, NextResponse } from "next/server";
import { searchKeywordsVideos } from "../../dao/keywordsVideosDao";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const keyword_id = searchParams.get("keyword_id") || undefined;
    const video_id = searchParams.get("video_id") || undefined;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || "10", 10);

    const { rows, totalCount } = await searchKeywordsVideos({
      keyword_id,
      video_id,
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
