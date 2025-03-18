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
    let countQuery = `SELECT COUNT(*) FROM yt_video WHERE 1=1`;
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

    if (video_published_at) {
      query += ` AND video_published_at = $${params.length + 1}`;
      countQuery += ` AND video_published_at = $${countQuery.length + 1}`;
      params.push(video_published_at);
    }

    query += ` ORDER BY video_published_at DESC LIMIT $${
      params.length + 1
    } OFFSET $${params.length + 2}`;
    params.push(pageSize, offset);

    const { rows } = await pool.query(query, params);
    const countResult = await pool.query(countQuery, countParams);
    const totalCount = parseInt(countResult.rows[0].count, 10);
    return { rows, totalCount };
  } catch (error) {
    console.error("Database query error:", error);
    throw new Error("Failed to fetch video data");
  }
}

/**
 * 根据 `keyword_id` 搜索关联的所有视频（分页）
 * @param keyword_id 关键词 ID（UUID）
 * @param page 当前页
 * @param pageSize 每页条数
 */
export async function searchVideosByKeywordId({
  keyword_id,
  page = 1,
  pageSize = 10,
}: {
  keyword_id: string;
  page?: number;
  pageSize?: number;
}) {
  const client = await pool.connect();
  try {
    const offset = (page - 1) * pageSize;

    // 查询匹配的视频
    const query = `
      SELECT v.*
      FROM yt_video v
      JOIN keywords_videos kv ON v.video_id = kv.video_id
      WHERE kv.keyword_id = $1
      ORDER BY v.video_published_at DESC
      LIMIT $2 OFFSET $3;
    `;

    // 计算符合条件的总记录数
    const countQuery = `
      SELECT COUNT(*)
      FROM yt_video v
      JOIN keywords_videos kv ON v.video_id = kv.video_id
      WHERE kv.keyword_id = $1;
    `;

    // 获取总条数
    const countResult = await client.query(countQuery, [keyword_id]);
    const totalCount = parseInt(countResult.rows[0].count, 10);
    const totalPages = Math.ceil(totalCount / pageSize);

    // 查询数据
    const result = await client.query(query, [keyword_id, pageSize, offset]);

    return {
      data: result.rows,
      totalCount,
      totalPages,
    };
  } catch (error) {
    console.error("Database error:", error);
    return {
      data: [],
      totalCount: 0,
      totalPages: 0,
    };
  } finally {
    client.release();
  }
}

/**
 * 获取 `channel_id` 关联的所有视频（按 `video_published_at` 倒序）
 * @param channel_id 频道 ID
 */
export async function getVideosByChannelId(
  channel_id: string,
  page: number = 1,
  pageSize: number = 10
) {
  const client = await pool.connect();
  try {
    const offset = (page - 1) * pageSize;

    const videosQuery = `
      SELECT video_id, video_title, video_published_at, video_thumbnail_url, video_duration
      FROM yt_video
      WHERE channel_id = $1
      ORDER BY video_published_at DESC
      LIMIT $2 OFFSET $3;
    `;
    const result = await client.query(videosQuery, [
      channel_id,
      pageSize,
      offset,
    ]);

    const countQuery = `
      SELECT COUNT(*) FROM yt_video WHERE channel_id = $1;
    `;
    const countResult = await client.query(countQuery, [channel_id]);
    const totalCount = parseInt(countResult.rows[0].count, 10);
    const totalPages = Math.ceil(totalCount / pageSize);

    return {
      videos: result.rows,
      totalCount,
      totalPages,
      currentPage: page,
    };
  } catch (error) {
    console.error("Database error:", error);
    return { videos: [], totalCount: 0, totalPages: 0, currentPage: page };
  } finally {
    client.release();
  }
}
