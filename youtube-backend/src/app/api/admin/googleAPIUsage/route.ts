import { NextRequest, NextResponse } from "next/server";
import { findApiUsage } from "../../dao/googleApiUsageDao";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const apiKey = searchParams.get("apiKey") ?? undefined;
    const startDate = searchParams.get("startDate") ?? undefined;
    const endDate = searchParams.get("endDate") ?? undefined;
    const page = parseInt(searchParams.get("page") ?? "1", 10);
    const limit = parseInt(searchParams.get("limit") ?? "10", 10);

    const { rows, totalCount, totalPages } = await findApiUsage(
      apiKey,
      startDate,
      endDate,
      page,
      limit
    );

    return NextResponse.json({
      success: true,
      data: rows,
      totalCount,
      totalPages,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
