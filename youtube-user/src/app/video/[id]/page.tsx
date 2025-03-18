"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import dayjs from "dayjs";

// 注册 Chart.js 组件
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const API_URL = `${process.env.NEXT_PUBLIC_USER_API_BASE_URL}/user/video`;

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

export default function VideoDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const videoId = params.id;
  const [video, setVideo] = useState<any>(null);
  const [statistics, setStatistics] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // 获取视频详细信息 + 统计数据
  const fetchVideoDetail = useCallback(async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({ video_id: videoId });
      const res = await fetch(`${API_URL}?${queryParams}`);
      const data = await res.json();

      if (data.success) {
        setVideo(data.video);
        setStatistics(data.statistics);
      }
    } catch (error) {
      console.error("Failed to fetch video details", error);
    } finally {
      setLoading(false);
    }
  }, [videoId]);

  useEffect(() => {
    fetchVideoDetail();
  }, [fetchVideoDetail, videoId]);

  if (loading || !video) {
    return <p>Loading...</p>;
  }

  // 格式化统计数据用于图表
  const labels = statistics.map((stat) =>
    dayjs(stat.snapshot_date).format("YYYY-MM-DD")
  );
  const commentsData = statistics.map((stat) => stat.total_comments);
  const viewsData = statistics.map((stat) => stat.total_views);
  const likesData = statistics.map((stat) => stat.total_likes);
  const favoritesData = statistics.map((stat) => stat.total_favorites);

  const generateChartData = (label: string, data: number[]) => ({
    labels,
    datasets: [
      {
        label,
        data,
        borderColor: "rgb(75, 192, 192)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        tension: 0.4,
      },
    ],
  });

  return (
    <div style={styles.container}>
      {/* 视频信息 */}
      <div style={styles.videoInfoContainer}>
        {/* 左侧：视频封面 */}
        <a
          href={`https://www.youtube.com/watch?v=${video.video_id}`}
          target="_blank"
          rel="noopener noreferrer"
          style={styles.videoLink}
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
        </a>

        {/* 右侧：视频详细信息 */}
        <div style={styles.videoDetails}>
          <h1 style={styles.videoTitle}>{video.video_title}</h1>
          <p style={styles.videoMeta}>
            📅 Published: {formatPublishedAt(video.video_published_at)}
          </p>
          <p style={styles.videoMeta}>
            📌 Category ID: {video.video_category_id}
          </p>
          <p style={styles.videoMeta}>
            🔄 Last Updated: {formatPublishedAt(video.updated_at)}
          </p>
        </div>
      </div>

      {/* 统计数据图表 */}
      <div style={styles.chartsContainer}>
        <div style={styles.chart}>
          <Line data={generateChartData("Total Comments", commentsData)} />
        </div>
        <div style={styles.chart}>
          <Line data={generateChartData("Total Views", viewsData)} />
        </div>
        <div style={styles.chart}>
          <Line data={generateChartData("Total Likes", likesData)} />
        </div>
        <div style={styles.chart}>
          <Line data={generateChartData("Total Favorites", favoritesData)} />
        </div>
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
  videoInfoContainer: {
    display: "flex",
    gap: "20px",
    alignItems: "center",
    marginBottom: "30px",
  },
  thumbnailWrapper: { position: "relative", display: "inline-block" },
  thumbnail: { width: "320px", height: "180px", borderRadius: "8px" },
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
  videoLink: { textDecoration: "none", color: "black" },
  videoDetails: { flex: 1 },
  videoTitle: { fontSize: "24px", fontWeight: "bold", marginBottom: "10px" },
  videoMeta: { fontSize: "16px", marginBottom: "5px", color: "#555" },
  chartsContainer: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "20px",
    marginTop: "20px",
  },
  chart: {
    backgroundColor: "#f9f9f9",
    padding: "20px",
    borderRadius: "8px",
    boxShadow: "0 0 5px rgba(0,0,0,0.1)",
  },
};
