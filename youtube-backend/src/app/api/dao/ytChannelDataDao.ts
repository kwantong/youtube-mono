import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function search({
  channel_id,
  channel_name,
  page = 1,
  pageSize = 10,
}: {
  channel_id?: string;
  channel_name?: string;
  page?: number;
  pageSize?: number;
}) {
  try {
    const offset = (page - 1) * pageSize;
    let query = `SELECT * FROM yt_channel WHERE 1=1`;
    let countQuery = `SELECT COUNT(*) FROM yt_channel WHERE 1=1`;
    const params: any[] = [];
    const countParams: any[] = [];

    if (channel_id) {
      query += ` AND channel_id = $${params.length + 1}`;
      countQuery += ` AND channel_id = $${countParams.length + 1}`;
      params.push(channel_id);
      countParams.push(channel_id);
    }

    if (channel_name) {
      query += ` AND channel_name ILIKE $${params.length + 1}`;
      countQuery += ` AND channel_name ILIKE $${countParams.length + 1}`;
      params.push(`%${channel_name}%`);
      countParams.push(`%${channel_name}%`);
    }

    query += ` ORDER BY updated_at DESC LIMIT $${params.length + 1} OFFSET $${
      params.length + 2
    }`;
    params.push(pageSize, offset);

    const { rows } = await pool.query(query, params);
    const countResult = await pool.query(countQuery, countParams);
    const totalCount = parseInt(countResult.rows[0].count, 10);
    return { rows, totalCount };
  } catch (error) {
    console.error("Database query error:", error);
    throw new Error("Failed to fetch data");
  }
}
