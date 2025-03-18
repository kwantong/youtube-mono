"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";

const API_URL = `${process.env.NEXT_PUBLIC_USER_API_BASE_URL}/user/keyword/detail`;

/**
 * 格式化发布时间 (2025-03-17T19:30:43Z -> 2025-03-17 19:30)
 */
const formatPublishedAt = (dateString: string) => {
  return dayjs(dateString).format("YYYY-MM-DD HH:mm");
};

/**
 * 格式化视频时长 (PT3H12M6S -> 3:12:06)
 */
const formatDuration = (duration: string) => {
  const matches = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  if (!matches) return "0:00";

  const hours = matches[1] ? parseInt(matches[1].replace("H", ""), 10) : 0;
  const minutes = matches[2] ? parseInt(matches[2].replace("M", ""), 10) : 0;
  const seconds = matches[3] ? parseInt(matches[3].replace("S", ""), 10) : 0;

  return hours > 0
    ? `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
        2,
        "0"
      )}`
    : `${minutes}:${String(seconds).padStart(2, "0")}`;
};

export default function KeywordDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const keywordId = params.id;
  const [videos, setVideos] = useState<
    {
      video_id: string;
      video_title: string;
      video_published_at: string;
      video_thumbnail_url: string;
      video_duration: string;
    }[]
  >([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  // 获取视频数据
  const fetchVideos = useCallback(async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        keyword_id: keywordId,
        page: String(page),
        pageSize: String(pageSize),
      });

      const res = await fetch(`${API_URL}?${queryParams}`);
      const data = await res.json();

      if (data.success) {
        setVideos(data.data);
        setTotalPages(data.totalPages);
      }
    } catch (error) {
      console.error("Failed to fetch videos", error);
    } finally {
      setLoading(false);
    }
  }, [keywordId, page, pageSize]);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos, page]);

  // 上一页
  const handlePrevPage = () => {
    if (page > 1) setPage(page - 1);
  };

  // 下一页
  const handleNextPage = () => {
    if (page < totalPages) setPage(page + 1);
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Keyword Videos</h1>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div style={styles.videoGrid}>
          {videos.length > 0 ? (
            videos.map((video) => (
              <div
                key={video.video_id}
                style={styles.videoCard}
                onClick={() => {
                  router.push(`/video/${video.video_id}`);
                }}
              >
                <div style={styles.thumbnailWrapper}>
                  <img
                    src={video.video_thumbnail_url}
                    alt={video.video_title}
                    style={styles.thumbnail}
                  />
                  <span style={styles.durationOverlay}>
                    {formatDuration(video.video_duration)}
                  </span>
                </div>
                <h3 style={styles.videoTitle}>{video.video_title}</h3>
                <p style={styles.videoInfo}>
                  {formatPublishedAt(video.video_published_at)}
                </p>
              </div>
            ))
          ) : (
            <p>No videos found.</p>
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
    maxWidth: "1200px",
    margin: "auto",
  },
  title: { fontSize: "24px", marginBottom: "20px", textAlign: "center" },
  videoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(5, 1fr)",
    gap: "20px",
    marginTop: "20px",
  },
  videoCard: {
    backgroundColor: "#f9f9f9",
    padding: "10px",
    borderRadius: "8px",
    textAlign: "center",
    boxShadow: "0 0 5px rgba(0,0,0,0.1)",
  },
  thumbnailWrapper: { position: "relative", display: "inline-block" },
  thumbnail: { width: "100%", height: "auto", borderRadius: "4px" },
  durationOverlay: {
    position: "absolute",
    bottom: "8px",
    left: "8px",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    color: "white",
    padding: "4px 6px",
    fontSize: "12px",
    borderRadius: "4px",
  },
  videoTitle: { fontSize: "16px", margin: "10px 0", fontWeight: "bold" },
  videoInfo: { fontSize: "14px", color: "#555" },
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
