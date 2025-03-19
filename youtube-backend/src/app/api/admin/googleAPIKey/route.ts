import { NextRequest, NextResponse } from "next/server";
import {
  findApiKeys,
  insertApiKey,
  updateApiKeyStatus,
} from "../../dao/googleAPIKeyDao";

/**
 * 处理 `GET` 请求，获取 API Keys（支持分页、搜索）
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const apiKey = searchParams.get("apiKey") ?? undefined;
    const page = parseInt(searchParams.get("page") ?? "1", 10);
    const limit = parseInt(searchParams.get("limit") ?? "10", 10);

    const { rows, totalCount, totalPages } = await findApiKeys(
      apiKey,
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

/**
 * 处理 `POST` 请求，新增 Google API Key
 */
export async function POST(request: NextRequest) {
  try {
    const { apiKey } = await request.json();
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: "apiKey is required" },
        { status: 400 }
      );
    }

    const newApiKey = await insertApiKey(apiKey);
    if (!newApiKey) {
      return NextResponse.json(
        { success: false, error: "API Key already exists" },
        { status: 409 }
      );
    }

    return NextResponse.json({ success: true, data: newApiKey });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

/**
 * 处理 `PUT` 请求，更新 API Key 的 `is_active` 状态
 */
export async function PUT(request: NextRequest) {
  try {
    const { apiKey, isActive } = await request.json();
    if (!apiKey || typeof isActive !== "boolean") {
      return NextResponse.json(
        { success: false, error: "Invalid parameters" },
        { status: 400 }
      );
    }

    const updatedKey = await updateApiKeyStatus(apiKey, isActive);
    if (!updatedKey) {
      return NextResponse.json(
        { success: false, error: "API Key not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: updatedKey });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
