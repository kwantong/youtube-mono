import { NextRequest, NextResponse } from "next/server";
import { searchVideosByKeywordId } from "../../../dao/ytVideoDataDao";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const keyword_id = searchParams.get("keyword_id");
  const page = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = parseInt(searchParams.get("pageSize") || "10", 10);

  if (!keyword_id) {
    return NextResponse.json(
      { success: false, error: "keyword_id is required" },
      { status: 400 }
    );
  }

  const { data, totalCount, totalPages } = await searchVideosByKeywordId({
    keyword_id,
    page,
    pageSize,
  });

  return NextResponse.json({
    success: true,
    data: data,
    totalCount,
    totalPages,
  });
}
