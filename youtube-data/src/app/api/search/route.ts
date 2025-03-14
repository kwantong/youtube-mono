import { NextRequest, NextResponse } from "next/server";
import { fetchDataByChannel, fetchDataByKeyword } from "../service/service";

export async function GET(request: NextRequest) {
  try {
    await fetchDataByChannel();
    await fetchDataByKeyword();
  } catch (e) {
    return NextResponse.json(e);
  }
  return NextResponse.json({});
}
