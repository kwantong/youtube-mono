import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // 你的 PostgreSQL 连接信息
});

/**
 * 按 `api_key` 搜索 API Key 使用情况，支持分页
 * @param apiKey 搜索的 API Key（可选）
 * @param startDate 起始日期（可选）
 * @param endDate 结束日期（可选）
 * @param page 当前页数
 * @param limit 每页条数
 * @returns API Key 使用情况（带分页）
 */
export async function findApiUsage(
  apiKey?: string,
  startDate?: string,
  endDate?: string,
  page: number = 1,
  limit: number = 10
) {
  const client = await pool.connect();
  try {
    const offset = (page - 1) * limit;
    const queryParams: any[] = [];
    let whereClause = "";

    if (apiKey) {
      whereClause += ` AND gak.api_key ILIKE $${queryParams.length + 1}`;
      queryParams.push(`%${apiKey}%`);
    }
    if (startDate) {
      whereClause += ` AND gau.usage_date >= $${queryParams.length + 1}`;
      queryParams.push(startDate);
    }
    if (endDate) {
      whereClause += ` AND gau.usage_date <= $${queryParams.length + 1}`;
      queryParams.push(endDate);
    }

    // 查询 API Key 使用情况
    const queryText = `
      SELECT 
        gak.api_key, 
        gau.usage_date, 
        gau.quota_limit, 
        gau.quota_used, 
        gau.last_used_at
      FROM google_api_usage gau
      INNER JOIN google_api_keys gak ON gau.google_api_key_id = gak.id
      WHERE 1=1 ${whereClause}
      ORDER BY gau.usage_date DESC
      LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2};
    `;

    queryParams.push(limit, offset);
    const { rows } = await client.query(queryText, queryParams);

    // 查询总数
    const countQuery = `
      SELECT COUNT(*) 
      FROM google_api_usage gau
      INNER JOIN google_api_keys gak ON gau.google_api_key_id = gak.id
      WHERE 1=1 ${whereClause};
    `;
    const { rows: countRows } = await client.query(
      countQuery,
      queryParams.slice(0, queryParams.length - 2)
    );

    const totalCount = parseInt(countRows[0].count, 10);
    const totalPages = Math.ceil(totalCount / limit);

    return { rows, totalCount, totalPages };
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  } finally {
    client.release();
  }
}
