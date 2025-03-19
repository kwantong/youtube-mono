import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // 连接 PostgreSQL
});

/**
 * 按 `api_key` 搜索 API Keys，支持分页
 */
export async function findApiKeys(
  apiKey?: string,
  page: number = 1,
  limit: number = 10
) {
  const client = await pool.connect();
  try {
    const offset = (page - 1) * limit;
    const queryParams: any[] = [];
    let whereClause = "";

    if (apiKey) {
      whereClause = `WHERE api_key ILIKE $1`;
      queryParams.push(`%${apiKey}%`);
    }

    const queryText = `
      SELECT id, api_key, is_active, created_at, updated_at 
      FROM google_api_keys 
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2};
    `;

    queryParams.push(limit, offset);
    const { rows } = await client.query(queryText, queryParams);

    const countQuery = `SELECT COUNT(*) FROM google_api_keys ${whereClause};`;
    const { rows: countRows } = await client.query(
      countQuery,
      whereClause ? [queryParams[0]] : []
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

/**
 * 新增 Google API Key
 */
export async function insertApiKey(apiKey: string) {
  const client = await pool.connect();
  try {
    const queryText = `
      INSERT INTO google_api_keys (api_key, is_active)
      VALUES ($1, TRUE)
      ON CONFLICT (api_key) DO NOTHING RETURNING *;
    `;
    const { rows } = await client.query(queryText, [apiKey]);
    return rows[0] || null; // 如果已存在，不返回数据
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * 更新 Google API Key 的 `is_active` 状态
 */
export async function updateApiKeyStatus(apiKey: string, isActive: boolean) {
  const client = await pool.connect();
  try {
    const queryText = `
      UPDATE google_api_keys 
      SET is_active = $1, updated_at = CURRENT_TIMESTAMP
      WHERE api_key = $2
      RETURNING *;
    `;
    const { rows } = await client.query(queryText, [isActive, apiKey]);
    return rows[0] || null; // 如果 API Key 不存在，返回 null
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  } finally {
    client.release();
  }
}
