import { NextRequest, NextResponse } from "next/server";
import { getAllKeywords } from "../../dao/managementDao";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const keyword = searchParams.get("keyword") || "";
  const page = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = parseInt(searchParams.get("pageSize") || "10", 10);

  const { data, totalCount } = await getAllKeywords({
    keyword,
    page,
    pageSize,
  });

  const totalPages = Math.ceil(totalCount / pageSize);

  return NextResponse.json({
    success: true,
    data: data,
    totalCount,
    totalPages,
  });
}
