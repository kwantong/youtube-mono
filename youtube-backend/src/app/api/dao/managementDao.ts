import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function getAllKeywords({
  keyword = "",
  page = 1,
  pageSize = 10,
}: {
  keyword?: string;
  page?: number;
  pageSize?: number;
}) {
  const client = await pool.connect();
  try {
    const offset = (page - 1) * pageSize;
    let query = `SELECT * FROM keyword_setting WHERE 1=1`;
    let countQuery = `SELECT COUNT(*) FROM keyword_setting WHERE 1=1`;
    const values: any[] = [];

    if (keyword) {
      query += ` AND keyword ILIKE $${values.length + 1}`;
      countQuery += ` AND keyword ILIKE $${values.length + 1}`;
      values.push(`%${keyword}%`);
    }

    query += ` ORDER BY created_at DESC LIMIT $${values.length + 1} OFFSET $${
      values.length + 2
    }`;
    values.push(pageSize, offset);

    const countResult = await client.query(
      countQuery,
      values.slice(0, values.length - 2)
    );
    const totalCount = parseInt(countResult.rows[0].count, 10);
    const totalPages = Math.ceil(totalCount / pageSize);

    const result = await client.query(query, values);

    return {
      data: result.rows,
      totalCount,
      totalPages,
      currentPage: page,
    };
  } catch (error) {
    console.error("Database error:", error);
    return { data: [], totalCount: 0, totalPages: 0, currentPage: page };
  } finally {
    client.release();
  }
}

export async function insertKeyword(keyword: string) {
  const client = await pool.connect();
  try {
    const queryText = `
      INSERT INTO keyword_setting (keyword, is_deleted)
      VALUES ($1, $2)
      ON CONFLICT (keyword) DO NOTHING;
    `;
    await client.query(queryText, [keyword, 2]);
  } catch (error) {
    console.error("Database error:", error);
  } finally {
    client.release();
  }
}

export async function updateKeywordIsDeleted(id: string, isDeleted: number) {
  const client = await pool.connect();
  try {
    const queryText = `
            UPDATE keyword_setting 
            SET is_deleted = $1
            WHERE id = $2;
        `;
    await client.query(queryText, [isDeleted, id]);
  } catch (error) {
    console.error("Database error:", error);
  } finally {
    client.release();
  }
}

export async function getAllChannelIds({
  channel_id = "",
  channel_name = "",
  page = 1,
  pageSize = 10,
}: {
  channel_id?: string;
  channel_name?: string;
  page?: number;
  pageSize?: number;
}) {
  const client = await pool.connect();
  try {
    const offset = (page - 1) * pageSize;
    let query = `SELECT * FROM channel_setting WHERE 1=1`;
    let countQuery = `SELECT COUNT(*) FROM channel_setting WHERE 1=1`;
    const values: any[] = [];

    if (channel_id) {
      query += ` AND channel_id = $${values.length + 1}`;
      countQuery += ` AND channel_id = $${values.length + 1}`;
      values.push(channel_id);
    }

    if (channel_name) {
      query += ` AND channel_name ILIKE $${values.length + 1}`;
      countQuery += ` AND channel_name ILIKE $${values.length + 1}`;
      values.push(`%${channel_name}%`);
    }

    query += ` ORDER BY created_at DESC LIMIT $${values.length + 1} OFFSET $${
      values.length + 2
    }`;
    values.push(pageSize, offset);

    const countResult = await client.query(
      countQuery,
      values.slice(0, values.length - 2)
    );
    const totalCount = parseInt(countResult.rows[0].count, 10);
    const totalPages = Math.ceil(totalCount / pageSize);

    const result = await client.query(query, values);

    return {
      data: result.rows,
      totalCount,
      totalPages,
      currentPage: page,
    };
  } catch (error) {
    console.error("Database error:", error);
    return { data: [], totalCount: 0, totalPages: 0, currentPage: page };
  } finally {
    client.release();
  }
}

export async function insertChannelId(
  channelId: string,
  channelName?: string | undefined | null
) {
  const client = await pool.connect();
  try {
    const queryText = `
      INSERT INTO channel_setting (channel_id, channel_name, is_deleted)
      VALUES ($1, $2, $3)
      ON CONFLICT (channel_id) DO NOTHING;
    `;
    await client.query(queryText, [channelId, channelName ?? "", 2]);
  } catch (error) {
    console.error("Database error:", error);
  } finally {
    client.release();
  }
}

export async function updateChannelIdIsDeleted(id: string, isDeleted: number) {
  const client = await pool.connect();
  try {
    const queryText = `
            UPDATE channel_setting 
            SET is_deleted = $1
            WHERE id = $2;
        `;
    await client.query(queryText, [isDeleted, id]);
  } catch (error) {
    console.error("Database error:", error);
  } finally {
    client.release();
  }
}
