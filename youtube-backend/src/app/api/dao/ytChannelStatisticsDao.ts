import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

/**
 * 查询频道统计信息
 * @param channel_id 可选，按 channel_id 精确查询
 * @param snapshot_date 可选，按 snapshot_date 查询（YYYY-MM-DD）
 * @param page 默认第 1 页
 * @param pageSize 默认 10 条
 */
export async function searchChannelStatistics({
  channel_id,
  snapshot_date,
  page = 1,
  pageSize = 10,
}: {
  channel_id?: string;
  snapshot_date?: string;
  page?: number;
  pageSize?: number;
}) {
  try {
    const offset = (page - 1) * pageSize;
    let query = `SELECT * FROM yt_channel_statistics WHERE 1=1`;
    const params: any[] = [];

    if (channel_id) {
      query += ` AND channel_id = $${params.length + 1}`;
      params.push(channel_id);
    }

    if (snapshot_date) {
      query += ` AND snapshot_date = $${params.length + 1}`;
      params.push(snapshot_date);
    }

    query += ` ORDER BY snapshot_date DESC LIMIT $${
      params.length + 1
    } OFFSET $${params.length + 2}`;
    params.push(pageSize, offset);

    const { rows } = await pool.query(query, params);
    return rows;
  } catch (error) {
    console.error("Database query error:", error);
    throw new Error("Failed to fetch channel statistics");
  }
}
