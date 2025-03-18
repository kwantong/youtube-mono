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

/**
 * 获取 `video_id` 的详细信息，并返回该视频的统计数据（每天的数据）
 * @param video_id 视频 ID
 */
export async function getVideoDetailWithStatistics(video_id: string) {
  const client = await pool.connect();
  try {
    // 查询视频详细信息
    const videoQuery = `
      SELECT *
      FROM yt_video
      WHERE video_id = $1;
    `;

    const videoResult = await client.query(videoQuery, [video_id]);
    if (videoResult.rows.length === 0) {
      return {
        success: false,
        error: "Video not found",
      };
    }

    const videoDetail = videoResult.rows[0];

    // 查询该视频的统计数据（按 `snapshot_date` 排序）
    const statisticsQuery = `
      SELECT snapshot_date, total_comments, total_views, total_likes, total_favorites
      FROM yt_video_statistics
      WHERE video_id = $1
      ORDER BY snapshot_date ASC;
    `;

    const statisticsResult = await client.query(statisticsQuery, [video_id]);

    return {
      success: true,
      video: {
        video_id: videoDetail.video_id,
        video_title: videoDetail.video_title,
        video_published_at: videoDetail.video_published_at,
        video_thumbnail_url: videoDetail.video_thumbnail_url,
        video_duration: videoDetail.video_duration,
        video_category_id: videoDetail.video_category_id,
        channel_id: videoDetail.channel_id,
        created_at: videoDetail.created_at,
        updated_at: videoDetail.updated_at,
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
