import { NextRequest, NextResponse } from "next/server";
import { search } from "../../dao/ytChannelDataDao";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const channel_id = searchParams.get("channel_id") || undefined;
    const channel_name = searchParams.get("channel_name") || undefined;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || "10", 10);

    const { rows, totalCount } = await search({
      channel_id,
      channel_name,
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
