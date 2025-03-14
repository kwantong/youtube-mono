import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function getAllKeywords() {
  const client = await pool.connect();
  try {
    const result = await client.query(
      "SELECT * FROM keyword_setting ORDER BY created_at desc;"
    );
    return result.rows;
  } catch (error) {
    console.error("Database error:", error);
    return [];
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

export async function getAllChannelIds() {
  const client = await pool.connect();
  try {
    const result = await client.query(
      "SELECT * FROM channel_setting ORDER BY created_at desc;"
    );
    return result.rows;
  } catch (error) {
    console.error("Database error:", error);
    return [];
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
