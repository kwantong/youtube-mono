import { NextRequest, NextResponse } from "next/server";
import {
  getAllKeywords,
  insertKeyword,
  updateKeywordIsDeleted,
} from "../../dao/managementDao";

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

export async function POST(request: NextRequest) {
  try {
    const { keyword } = await request.json();
    if (!keyword) {
      return NextResponse.json(
        { error: "Keyword is required" },
        { status: 400 }
      );
    }
    await insertKeyword(keyword);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
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

    await updateKeywordIsDeleted(id, isDelete);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
