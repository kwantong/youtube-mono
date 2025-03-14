import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

/**
 * 查询 YouTube 视频信息
 * @param channel_id 可选，按 channel_id 精确查询
 * @param video_id 可选，按 video_id 精确查询
 * @param video_published_at 可选，按 video_published_at 精确查询
 * @param page 默认第 1 页
 * @param pageSize 默认 10 条
 */
export async function searchVideos({
  channel_id,
  video_id,
  video_published_at,
  page = 1,
  pageSize = 10,
}: {
  channel_id?: string;
  video_id?: string;
  video_published_at?: string;
  page?: number;
  pageSize?: number;
}) {
  try {
    const offset = (page - 1) * pageSize;
    let query = `SELECT * FROM yt_video WHERE 1=1`;
    const params: any[] = [];

    if (channel_id) {
      query += ` AND channel_id = $${params.length + 1}`;
      params.push(channel_id);
    }

    if (video_id) {
      query += ` AND video_id = $${params.length + 1}`;
      params.push(video_id);
    }

    if (video_published_at) {
      query += ` AND video_published_at = $${params.length + 1}`;
      params.push(video_published_at);
    }

    query += ` ORDER BY video_published_at DESC LIMIT $${
      params.length + 1
    } OFFSET $${params.length + 2}`;
    params.push(pageSize, offset);

    const { rows } = await pool.query(query, params);
    return rows;
  } catch (error) {
    console.error("Database query error:", error);
    throw new Error("Failed to fetch video data");
  }
}
