import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

/**
 * 查询关键词与视频的关联数据
 * @param keyword_id 可选，按 keyword_id 精确查询
 * @param video_id 可选，按 video_id 精确查询
 * @param page 默认第 1 页
 * @param pageSize 默认 10 条
 */
export async function searchKeywordsVideos({
  keyword_id,
  video_id,
  page = 1,
  pageSize = 10,
}: {
  keyword_id?: string;
  video_id?: string;
  page?: number;
  pageSize?: number;
}) {
  try {
    const offset = (page - 1) * pageSize;
    let query = `SELECT * FROM keywords_videos WHERE 1=1`;
    let countQuery = `SELECT COUNT(*) FROM keywords_videos WHERE 1=1`;
    const params: any[] = [];
    const countParams: any[] = [];

    if (keyword_id) {
      query += ` AND keyword_id = $${params.length + 1}`;
      countQuery += ` AND keyword_id = $${countParams.length + 1}`;
      params.push(keyword_id);
      countParams.push(keyword_id);
    }

    if (video_id) {
      query += ` AND video_id = $${params.length + 1}`;
      countQuery += ` AND video_id = $${countParams.length + 1}`;
      params.push(video_id);
      countParams.push(video_id);
    }

    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${
      params.length + 2
    }`;
    params.push(pageSize, offset);

    const { rows } = await pool.query(query, params);
    const countResult = await pool.query(countQuery, countParams);
    const totalCount = parseInt(countResult.rows[0].count, 10);

    return { rows, totalCount };
  } catch (error) {
    console.error("Database query error:", error);
    throw new Error("Failed to fetch keyword-video relationships");
  }
}
