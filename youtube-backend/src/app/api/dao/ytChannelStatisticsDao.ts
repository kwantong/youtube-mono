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
    let countQuery = `SELECT COUNT(*) FROM yt_channel_statistics WHERE 1=1`;
    const params: any[] = [];
    const countParams: any[] = [];

    if (channel_id) {
      query += ` AND channel_id = $${params.length + 1}`;
      countQuery += ` AND channel_id = $${countParams.length + 1}`;
      params.push(channel_id);
      countParams.push(channel_id);
    }

    if (snapshot_date) {
      query += ` AND snapshot_date = $${params.length + 1}`;
      countQuery += ` AND snapshot_date = $${countParams.length + 1}`;
      params.push(snapshot_date);
      countParams.push(snapshot_date);
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
    throw new Error("Failed to fetch channel statistics");
  }
}

/**
 * 根据 `channel_id` 获取频道详情和统计数据
 * @param channel_id 频道 ID
 */
export async function getChannelDetailWithStatistics(channel_id: string) {
  const client = await pool.connect();
  try {
    // 查询频道基本信息
    const channelQuery = `
      SELECT *
      FROM yt_channel
      WHERE channel_id = $1;
    `;

    const channelResult = await client.query(channelQuery, [channel_id]);

    if (channelResult.rows.length === 0) {
      return {
        success: false,
        error: "Channel not found",
      };
    }

    const channelDetail = channelResult.rows[0];

    // 查询该频道的统计数据（按 `snapshot_date` 排序）
    const statisticsQuery = `
      SELECT snapshot_date, subscriber_count, view_count, video_count
      FROM yt_channel_statistics
      WHERE channel_id = $1
      ORDER BY snapshot_date ASC;
    `;

    const statisticsResult = await client.query(statisticsQuery, [channel_id]);

    return {
      success: true,
      channel: {
        channel_id: channelDetail.channel_id,
        channel_name: channelDetail.channel_name,
        channel_created_at: channelDetail.channel_created_at,
        channel_description: channelDetail.channel_description,
        channel_thumbnail_url: channelDetail.channel_thumbnail_url,
        created_at: channelDetail.created_at,
        updated_at: channelDetail.updated_at,
      },
      statistics: statisticsResult.rows,
    };
  } catch (error) {
    console.error("Database error:", error);
    return {
      success: false,
      error: "Database query failed",
    };
  } finally {
    client.release();
  }
}
