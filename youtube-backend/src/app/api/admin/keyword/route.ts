import { NextRequest, NextResponse } from "next/server";
import {
  getAllKeywords,
  insertKeyword,
  updateKeywordIsDeleted,
} from "../../dao/dao";

export async function GET(request: NextRequest) {
  const res = await getAllKeywords();
  return NextResponse.json(res);
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
