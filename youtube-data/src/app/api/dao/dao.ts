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
