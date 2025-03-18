import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

/**
 * 查询 YouTube 视频统计信息
 * @param channel_id 可选，按 channel_id 精确查询
 * @param video_id 可选，按 video_id 精确查询
 * @param snapshot_date 可选，按 snapshot_date 精确查询（YYYY-MM-DD）
 * @param page 默认第 1 页
 * @param pageSize 默认 10 条
 */
export async function searchVideoStatistics({
  channel_id,
  video_id,
  snapshot_date,
  page = 1,
  pageSize = 10,
}: {
  channel_id?: string;
  video_id?: string;
  snapshot_date?: string;
  page?: number;
  pageSize?: number;
}) {
  try {
    const offset = (page - 1) * pageSize;
    let query = `SELECT * FROM yt_video_statistics WHERE 1=1`;
    let countQuery = `SELECT COUNT(*) FROM yt_video_statistics WHERE 1=1`;
    const params: any[] = [];
    const countParams: any[] = [];

    if (channel_id) {
      query += ` AND channel_id = $${params.length + 1}`;
      countQuery += ` AND channel_id = $${countParams.length + 1}`;
      params.push(channel_id);
    }

    if (video_id) {
      query += ` AND video_id = $${params.length + 1}`;
      countQuery += ` AND video_id = $${countParams.length + 1}`;
      params.push(video_id);
    }

    if (snapshot_date) {
      query += ` AND snapshot_date = $${params.length + 1}`;
      countQuery += ` AND snapshot_date = $${countParams.length + 1}`;
      params.push(snapshot_date);
    }

    query += ` ORDER BY snapshot_date DESC LIMIT $${
      params.length + 1
    } OFFSET $${params.length + 2}`;
    params.push(pageSize, offset);

    const { rows } = await pool.query(query, params);
    const countResult = await pool.query(countQuery, countParams);
    const totalCount = parseInt(countResult.rows[0].count, 10);
    return { rows, totalCount };
  } catch (error) {
    console.error("Database query error:", error);
    throw new Error("Failed to fetch video statistics");
  }
}
