import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function getAllKeywords() {
  const client = await pool.connect();
  try {
    const result = await client.query(
      "SELECT id, keyword FROM keyword_setting WHERE is_deleted = 2;"
    );
    return result.rows.map((row) => {
      return {
        id: row.id,
        keyword: row.keyword,
      };
    });
  } catch (error) {
    console.error("Database error:", error);
    return [];
  } finally {
    client.release();
  }
}

export async function getAllChannelIds() {
  const client = await pool.connect();
  try {
    const result = await client.query(
      "SELECT channel_id FROM channel_setting WHERE is_deleted = 2;"
    );
    return result.rows.map((row) => row.channel_id);
  } catch (error) {
    console.error("Database error:", error);
    return [];
  } finally {
    client.release();
  }
}

export async function insertVideo(videos: any[]) {
  if (videos.length === 0) return;
  const client = await pool.connect();
  try {
    const queryText = `
      INSERT INTO yt_video (channel_id, video_id, video_title, video_published_at, video_thumbnail_url, video_duration, video_category_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (video_id)
      DO UPDATE SET video_title = EXCLUDED.video_title, video_thumbnail_url = EXCLUDED.video_thumbnail_url, video_duration = EXCLUDED.video_duration, video_category_id = EXCLUDED.video_category_id;
    `;

    for (const video of videos) {
      await client.query(queryText, [
        video.channel_id,
        video.video_id,
        video.video_title,
        video.video_published_at,
        video.video_thumbnail_url,
        video.video_duration,
        video.video_category_id,
      ]);
    }
  } catch (error) {
    console.error("Database error:", error);
  } finally {
    client.release();
  }
}

export async function insertVideoStatistics(videos: any[]) {
  if (videos.length === 0) return;
  const client = await pool.connect();
  try {
    const queryText = `
      INSERT INTO yt_video_statistics (channel_id, video_id, total_comments, total_views, total_likes, total_favorites)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (video_id, snapshot_date)
      DO UPDATE SET total_comments = EXCLUDED.total_comments, total_views = EXCLUDED.total_views, total_likes = EXCLUDED.total_likes, total_favorites = EXCLUDED.total_favorites;
    `;

    for (const video of videos) {
      await client.query(queryText, [
        video.channel_id,
        video.video_id,
        video.total_comments,
        video.total_views,
        video.total_likes,
        video.total_favorites,
      ]);
    }
  } catch (error) {
    console.error("Database error:", error);
  } finally {
    client.release();
  }
}

export async function insertChannel(channels: any[]) {
  if (channels.length === 0) return;
  const client = await pool.connect();
  try {
    const queryText = `
      INSERT INTO yt_channel (channel_id, channel_name, channel_created_at, channel_description, channel_thumbnail_url)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (channel_id)
      DO UPDATE SET channel_name = EXCLUDED.channel_name, channel_description = EXCLUDED.channel_description, channel_thumbnail_url = EXCLUDED.channel_thumbnail_url;
    `;

    for (const channel of channels) {
      await client.query(queryText, [
        channel.channel_id,
        channel.channel_name,
        channel.channel_created_at,
        channel.channel_description,
        channel.channel_thumbnail_url,
      ]);
    }
  } catch (error) {
    console.error("Database error:", error);
  } finally {
    client.release();
  }
}

export async function insertChannelStatistics(channels: any[]) {
  if (channels.length === 0) return;
  const client = await pool.connect();
  try {
    const queryText = `
      INSERT INTO yt_channel_statistics (channel_id, subscriber_count, view_count, video_count)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (channel_id, snapshot_date)
      DO UPDATE SET subscriber_count = EXCLUDED.subscriber_count, view_count = EXCLUDED.view_count, video_count = EXCLUDED.video_count;
    `;

    for (const channel of channels) {
      await client.query(queryText, [
        channel.channel_id,
        channel.subscriber_count,
        channel.view_count,
        channel.video_count,
      ]);
    }
  } catch (error) {
    console.error("Database error:", error);
  } finally {
    client.release();
  }
}

export async function insertKeywordsVideos(keywordsVideos: any[]) {
  if (keywordsVideos.length === 0) return;
  const client = await pool.connect();
  try {
    const queryText = `
      INSERT INTO keywords_videos (keyword_id, video_id)
      VALUES ($1, $2)
      ON CONFLICT (video_id, keyword_id) 
      DO UPDATE SET keyword_id = EXCLUDED.keyword_id;
    `;

    for (const keywordsVideo of keywordsVideos) {
      await client.query(queryText, [
        keywordsVideo.keyword_id,
        keywordsVideo.video_id,
      ]);
    }
  } catch (error) {
    console.error("Database error:", error);
  } finally {
    client.release();
  }
}

export async function getAvailableApiKey(requiredQuota: number) {
  try {
    // 先尝试获取当天已有的可用 API Key
    let apiUsage = await getTodayApiKey(requiredQuota);

    // 如果当天没有可用的 API Key，则获取新的 API Key
    if (!apiUsage) {
      apiUsage = await getNewApiKey();
    }
    return apiUsage;
  } catch (e) {
    console.error(e);
    return undefined;
  }
}

async function getTodayApiKey(requiredQuota: number) {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT au.id, ak.api_key, au.quota_used, au.quota_limit
         FROM google_api_usage au
         JOIN google_api_keys ak ON au.google_api_key_id = ak.id
         WHERE au.usage_date = CURRENT_DATE
         AND ak.is_active = TRUE
         AND (au.quota_limit - au.quota_used) > $1
         ORDER BY au.last_used_at ASC
         LIMIT 1`,
      [requiredQuota]
    );
    return result.rows.length > 0 ? result.rows[0] : null;
  } catch (error) {
    throw error;
  } finally {
    client.release();
  }
}

async function getNewApiKey() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // 选择一个新的 API Key
    const result = await client.query(
      `SELECT id, api_key FROM google_api_keys
         WHERE is_active = TRUE
         AND id NOT IN (
           SELECT google_api_key_id FROM google_api_usage WHERE usage_date = CURRENT_DATE
         )
         ORDER BY created_at ASC
         LIMIT 1`
    );

    if (result.rows.length === 0) {
      throw new Error("No active API keys available.");
    }

    const apiKeyData = result.rows[0];

    // 创建 `google_api_usage` 记录
    await client.query(
      `INSERT INTO google_api_usage (google_api_key_id, usage_date, quota_limit, quota_used, last_used_at)
         VALUES ($1, CURRENT_DATE, 10000, 0, NOW())`,
      [apiKeyData.id]
    );

    await client.query("COMMIT");

    return {
      id: apiKeyData.id,
      api_key: apiKeyData.api_key,
      quota_used: 0,
      quota_limit: 10000,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

// 更新 API Key 使用情况
export async function updateQuotaUsage(usageId: string, usedQuota: number) {
  const client = await pool.connect();
  try {
    await client.query(
      `UPDATE google_api_usage
         SET quota_used = quota_used + $1,
             last_used_at = NOW(),
             updated_at = NOW()
         WHERE id = $2`,
      [usedQuota, usageId]
    );
  } finally {
    client.release();
  }
}
