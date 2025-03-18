"use client";

import { useEffect, useState, useCallback } from "react";
import dayjs from "dayjs";
import { router } from "next/client";
import { useRouter } from "next/navigation";

const API_URL = `${process.env.NEXT_PUBLIC_USER_API_BASE_URL}/user/channel`;

/**
 * 格式化 `Created At` 日期
 * @param dateString 2014-11-18T04:25:23Z
 * @returns 2014-11-18 04:25
 */
const formatCreatedAt = (dateString: string) => {
  return dayjs(dateString).format("YYYY-MM-DD HH:mm");
};

export default function ChannelSearchPage() {
  const [channels, setChannels] = useState<
    {
      id: string;
      channel_id: string;
      channel_name: string;
      channel_created_at: string;
      channel_description: string;
      channel_thumbnail_url: string;
    }[]
  >([]);
  const [searchChannelId, setSearchChannelId] = useState("");
  const [searchChannelName, setSearchChannelName] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  // 获取频道数据
  const fetchChannels = useCallback(async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
        ...(searchChannelId && { channel_id: searchChannelId }),
        ...(searchChannelName && { channel_name: searchChannelName }),
      });

      const res = await fetch(`${API_URL}?${queryParams}`);
      const data = await res.json();

      if (data.success) {
        setChannels(data.data);
        setTotalPages(data.totalPages);
      }
    } catch (error) {
      console.error("Failed to fetch channels", error);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, searchChannelId, searchChannelName]);

  useEffect(() => {
    fetchChannels();
  }, [page]);

  // 触发搜索
  const handleSearch = () => {
    setPage(1);
    fetchChannels();
  };

  // 上一页
  const handlePrevPage = () => {
    if (page > 1) setPage(page - 1);
  };

  // 下一页
  const handleNextPage = () => {
    if (page < totalPages) setPage(page + 1);
  };

  const router = useRouter();

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Channel Search</h1>

      {/* 搜索区域 */}
      <div style={styles.searchSection}>
        <input
          type="text"
          placeholder="Search by Channel ID"
          value={searchChannelId}
          onChange={(e) => setSearchChannelId(e.target.value)}
          style={styles.input}
        />
        <input
          type="text"
          placeholder="Search by Channel Name"
          value={searchChannelName}
          onChange={(e) => setSearchChannelName(e.target.value)}
          style={styles.input}
        />
        <button onClick={handleSearch} style={styles.searchButton}>
          Search
        </button>
      </div>

      {/* 频道列表 */}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div style={styles.channelList}>
          {channels.length > 0 ? (
            channels.map((channel) => (
              <div
                key={channel.id}
                style={styles.channelItem}
                onClick={() => {
                  router.push(`/channel/detail/${channel.channel_id}`);
                }}
              >
                {/* 左侧封面图 */}
                <img
                  src={channel.channel_thumbnail_url}
                  alt={channel.channel_name}
                  style={styles.thumbnail}
                />

                {/* 右侧信息 */}
                <div style={styles.channelInfo}>
                  <h3 style={styles.channelName}>{channel.channel_name}</h3>
                  <p style={styles.channelMeta}>
                    📅 Created At: {formatCreatedAt(channel.channel_created_at)}
                  </p>
                  <p style={styles.channelDescription}>
                    {channel.channel_description || "No description available"}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p>No channels found.</p>
          )}
        </div>
      )}

      {/* 分页控件 */}
      <div style={styles.pagination}>
        <button
          onClick={handlePrevPage}
          disabled={page === 1}
          style={{
            ...styles.pageButton,
            ...(page === 1 ? styles.disabledButton : {}),
          }}
        >
          Previous
        </button>
        <span style={styles.pageInfo}>
          Page {page} of {totalPages}
        </span>
        <button
          onClick={handleNextPage}
          disabled={page >= totalPages}
          style={{
            ...styles.pageButton,
            ...(page >= totalPages ? styles.disabledButton : {}),
          }}
        >
          Next
        </button>
      </div>
    </div>
  );
}

/** Styles */
const styles = {
  container: {
    padding: "20px",
    fontFamily: "Arial, sans-serif",
    maxWidth: "800px",
    margin: "auto",
  },
  title: { fontSize: "24px", marginBottom: "20px", textAlign: "center" },
  searchSection: { display: "flex", gap: "10px", marginBottom: "20px" },
  input: {
    width: "300px",
    padding: "8px",
    border: "1px solid #ccc",
    borderRadius: "4px",
  },
  searchButton: {
    padding: "8px 16px",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },

  /** 频道列表样式 */
  channelList: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    marginTop: "20px",
  },
  channelItem: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    padding: "10px",
    borderRadius: "8px",
    boxShadow: "0 0 5px rgba(0,0,0,0.1)",
  },
  thumbnail: {
    width: "120px",
    height: "120px",
    borderRadius: "8px",
    marginRight: "20px",
  },
  channelInfo: { flex: 1 },
  channelName: { fontSize: "18px", fontWeight: "bold", marginBottom: "5px" },
  channelMeta: { fontSize: "14px", color: "#555", marginBottom: "5px" },
  channelDescription: {
    fontSize: "14px",
    color: "#777",
    display: "-webkit-box",
    WebkitBoxOrient: "vertical",
    WebkitLineClamp: 3,
    overflow: "hidden",
    textOverflow: "ellipsis",
  },

  /** 分页样式 */
  pagination: {
    display: "flex",
    justifyContent: "center",
    gap: "10px",
    marginTop: "20px",
  },
  pageButton: {
    padding: "6px 12px",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  disabledButton: { backgroundColor: "#ccc", cursor: "not-allowed" },
  pageInfo: { fontSize: "16px", fontWeight: "bold" },
};
