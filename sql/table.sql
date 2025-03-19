CREATE
OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at
= CURRENT_TIMESTAMP;
RETURN NEW;
END;
$$
LANGUAGE plpgsql;

CREATE TABLE keyword_setting
(
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),     -- 自动生成 UUID
    keyword    TEXT     NOT NULL UNIQUE,                       -- string 类型，TEXT 在 PostgreSQL 中比 VARCHAR 更高效
    is_deleted SMALLINT NOT NULL CHECK (is_deleted IN (1, 2)), -- 1: yes, 2: no
    created_at TIMESTAMP        DEFAULT CURRENT_TIMESTAMP,     -- 插入时自动生成时间
    updated_at TIMESTAMP        DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER trigger_update_updated_at
    BEFORE UPDATE
    ON keyword_setting
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE channel_setting
(
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),     -- 自动生成 UUID
    channel_id   TEXT     NOT NULL UNIQUE,                       -- string 类型
    channel_name TEXT,                                           -- string 类型
    is_deleted   SMALLINT NOT NULL CHECK (is_deleted IN (1, 2)), -- 1: yes, 2: no
    created_at   TIMESTAMP        DEFAULT CURRENT_TIMESTAMP,     -- 插入时自动生成时间
    updated_at   TIMESTAMP        DEFAULT CURRENT_TIMESTAMP      -- 默认值，但需要触发器自动更新
);

CREATE TRIGGER trigger_update_updated_at_channel_setting
    BEFORE UPDATE
    ON channel_setting
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();


CREATE TABLE yt_channel
(
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- 自动生成 UUID
    channel_id            TEXT NOT NULL UNIQUE,                       -- string 类型
    channel_name          TEXT NOT NULL,                              -- string 类型
    channel_created_at    TEXT NOT NULL,                              -- string 类型
    channel_description   TEXT,                                       -- string 类型
    channel_thumbnail_url TEXT,                                       -- string 类型
    created_at            TIMESTAMP        DEFAULT CURRENT_TIMESTAMP, -- 插入时自动生成时间
    updated_at            TIMESTAMP        DEFAULT CURRENT_TIMESTAMP  -- 需要触发器自动更新
);

CREATE TRIGGER trigger_update_updated_at_yt_channel
    BEFORE UPDATE
    ON yt_channel
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();


CREATE TABLE yt_channel_statistics
(
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),          -- 自动生成 UUID
    channel_id       TEXT   NOT NULL,                                     -- string 类型
    snapshot_date    DATE   NOT NULL  DEFAULT CURRENT_DATE,               -- 自动填充当天零点
    subscriber_count BIGINT NOT NULL,                                     -- 数字类型
    view_count       BIGINT NOT NULL,                                     -- 数字类型
    video_count      BIGINT NOT NULL,                                     -- 数字类型
    created_at       TIMESTAMP        DEFAULT CURRENT_TIMESTAMP,          -- 插入时自动生成时间
    updated_at       TIMESTAMP        DEFAULT CURRENT_TIMESTAMP,          -- 需要触发器自动更新
    CONSTRAINT unique_channel_snapshot UNIQUE (channel_id, snapshot_date) -- 联合唯一键
);


CREATE TRIGGER trigger_update_updated_at_yt_channel_statistics
    BEFORE UPDATE
    ON yt_channel_statistics
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();


CREATE TABLE yt_video
(
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- 自动生成 UUID
    channel_id          TEXT NOT NULL,                              -- 关联的频道 ID
    video_id            TEXT NOT NULL UNIQUE,                       -- YouTube 视频 ID，确保唯一
    video_title         TEXT NOT NULL,                              -- 视频标题
    video_published_at  TEXT NOT NULL,                              -- 视频发布时间
    video_thumbnail_url TEXT,                                       -- 视频缩略图 URL
    video_duration      TEXT,                                       -- 视频时长
    video_category_id   TEXT,                                       -- 视频类别 ID
    created_at          TIMESTAMP        DEFAULT CURRENT_TIMESTAMP, -- 插入时自动生成时间
    updated_at          TIMESTAMP        DEFAULT CURRENT_TIMESTAMP  -- 需要触发器自动更新
);

CREATE TRIGGER trigger_update_updated_at_yt_video
    BEFORE UPDATE
    ON yt_video
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE yt_video_statistics
(
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    channel_id      TEXT   NOT NULL,
    video_id        TEXT   NOT NULL,
    snapshot_date   DATE   NOT NULL  DEFAULT CURRENT_DATE, -- 自动填充当天零点
    total_comments  BIGINT NOT NULL,
    total_views     BIGINT NOT NULL,
    total_likes     BIGINT NOT NULL,
    total_favorites BIGINT NOT NULL,
    created_at      TIMESTAMP        DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP        DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_video_snapshot UNIQUE (video_id, snapshot_date)
);

CREATE TRIGGER trigger_update_updated_at_yt_video_statistics
    BEFORE UPDATE
    ON yt_video_statistics
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE keywords_videos
(
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),        -- 自动生成 UUID
    keyword_id UUID NOT NULL,                                     -- 关键词 ID（UUID）
    video_id   TEXT NOT NULL,                                     -- 视频 ID（string）
    created_at TIMESTAMP        DEFAULT CURRENT_TIMESTAMP,        -- 插入时自动生成时间
    updated_at TIMESTAMP        DEFAULT CURRENT_TIMESTAMP,        -- 需要触发器自动更新
    CONSTRAINT unique_keyword_video UNIQUE (video_id, keyword_id) -- 联合唯一键
);

CREATE TRIGGER trigger_update_updated_at_keywords_videos
    BEFORE UPDATE
    ON keywords_videos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE google_api_keys
(
    id         UUID PRIMARY KEY     DEFAULT gen_random_uuid(), -- 自动生成 UUID
    api_key    TEXT UNIQUE NOT NULL,
    is_active  BOOLEAN     NOT NULL DEFAULT TRUE,              -- Only for manual control (e.g., if API key is banned)
    created_at TIMESTAMP            DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP            DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER trigger_update_updated_at_google_api_keys
    BEFORE UPDATE
    ON google_api_keys
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();


CREATE TABLE google_api_usage
(
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- 自动生成 UUID
    google_api_key_id UUID NOT NULL,                              -- Link to api_keys table
    usage_date        DATE NOT NULL    DEFAULT CURRENT_DATE,      -- One record per day
    quota_limit       INT  NOT NULL    DEFAULT 10000,             -- Daily quota limit
    quota_used        INT  NOT NULL    DEFAULT 0,                 -- Track used quota
    last_used_at      TIMESTAMP        DEFAULT NOW(),
    created_at        TIMESTAMP        DEFAULT CURRENT_TIMESTAMP,
    updated_at        TIMESTAMP        DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (google_api_key_id, usage_date)                        -- Ensure one record per day
);

CREATE TRIGGER trigger_update_updated_at_google_api_usage
    BEFORE UPDATE
    ON google_api_usage
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();