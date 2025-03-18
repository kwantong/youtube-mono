"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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

const API_URL = `${process.env.NEXT_PUBLIC_USER_API_BASE_URL}/user/channel/detail`;

const formatDate = (dateString: string) => {
  return dayjs(dateString).format("YYYY-MM-DD HH:mm");
};

export default function ChannelDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const channelId = params.id;
  const [channel, setChannel] = useState<any>(null);
  const [statistics, setStatistics] = useState<any[]>([]);
  const [videos, setVideos] = useState<any[]>([]);
  const [videoPagination, setVideoPagination] = useState<any>({
    totalPages: 1,
    currentPage: 1,
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const fetchChannelDetail = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams({
          channel_id: channelId,
          page: String(page),
        });
        const res = await fetch(`${API_URL}?${queryParams}`);
        const data = await res.json();

        if (data.success) {
          setChannel(data.channel);
          setStatistics(data.statistics);
          setVideos(data.videos);
          setVideoPagination(data.videoPagination);
        }
      } catch (error) {
        console.error("Failed to fetch channel details", error);
      } finally {
        setLoading(false);
      }
    },
    [channelId]
  );

  useEffect(() => {
    fetchChannelDetail();
  }, [channelId]);

  if (loading || !channel) {
    return <p>Loading...</p>;
  }

  // 切换分页
  const handlePageChange = (newPage: number) => {
    fetchChannelDetail(newPage);
  };

  return (
    <div style={styles.container}>
      <div style={styles.channelInfoContainer}>
        <div style={styles.thumbnailWrapper}>
          <img
            src={channel.channel_thumbnail_url}
            alt={channel.channel_name}
            style={styles.thumbnail}
          />
        </div>
        <div style={styles.channelDetails}>
          <h1 style={styles.channelTitle}>{channel.channel_name}</h1>
          <p style={styles.channelMeta}>
            📅 Created At: {formatDate(channel.channel_created_at)}
          </p>
          <p style={styles.channelMeta}>
            📝 Description:{" "}
            {channel.channel_description || "No description available"}
          </p>
          <p style={styles.channelMeta}>
            🔄 Last Updated: {formatDate(channel.updated_at)}
          </p>
        </div>
      </div>

      <div style={styles.chartsContainer}>
        <div style={styles.chart}>
          <Line
            data={{
              labels: statistics.map((s) => formatDate(s.snapshot_date)),
              datasets: [
                {
                  label: "Subscribers",
                  data: statistics.map((s) => s.subscriber_count),
                  borderColor: "rgb(75, 192, 192)",
                  backgroundColor: "rgba(75, 192, 192, 0.2)",
                },
              ],
            }}
          />
        </div>
        <div style={styles.chart}>
          <Line
            data={{
              labels: statistics.map((s) => formatDate(s.snapshot_date)),
              datasets: [
                {
                  label: "Views",
                  data: statistics.map((s) => s.view_count),
                  borderColor: "rgb(255, 99, 132)",
                  backgroundColor: "rgba(255, 99, 132, 0.2)",
                },
              ],
            }}
          />
        </div>
        <div style={styles.chart}>
          <Line
            data={{
              labels: statistics.map((s) => formatDate(s.snapshot_date)),
              datasets: [
                {
                  label: "Videos",
                  data: statistics.map((s) => s.video_count),
                  borderColor: "rgb(54, 162, 235)",
                  backgroundColor: "rgba(54, 162, 235, 0.2)",
                },
              ],
            }}
          />
        </div>
      </div>

      <h2 style={styles.sectionTitle}>Videos</h2>
      <div style={styles.videoGrid}>
        {videos.map((video) => (
          <div key={video.video_id} style={styles.videoCard}>
            <Link href={`/video/${video.video_id}`} style={styles.videoLink}>
              <img
                src={video.video_thumbnail_url}
                alt={video.video_title}
                style={styles.videoThumbnail}
              />
              <h3 style={styles.videoTitle}>{video.video_title}</h3>
              <p style={styles.videoMeta}>
                📅 {formatDate(video.video_published_at)}
              </p>
            </Link>
          </div>
        ))}
      </div>

      <div style={styles.pagination}>
        <button
          onClick={() => handlePageChange(videoPagination.currentPage - 1)}
          disabled={videoPagination.currentPage === 1}
        >
          Previous
        </button>
        <span>
          Page {videoPagination.currentPage} of {videoPagination.totalPages}
        </span>
        <button
          onClick={() => handlePageChange(videoPagination.currentPage + 1)}
          disabled={videoPagination.currentPage === videoPagination.totalPages}
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
    maxWidth: "1000px",
    margin: "auto",
  },
  channelInfoContainer: {
    display: "flex",
    gap: "20px",
    alignItems: "center",
    marginBottom: "30px",
  },
  thumbnailWrapper: { position: "relative", display: "inline-block" },
  thumbnail: { width: "200px", height: "200px", borderRadius: "8px" },
  channelDetails: { flex: 1 },
  channelTitle: { fontSize: "24px", fontWeight: "bold", marginBottom: "10px" },
  channelMeta: { fontSize: "16px", marginBottom: "5px", color: "#555" },
  chartsContainer: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: "20px",
    marginTop: "20px",
  },
  chart: {
    backgroundColor: "#f9f9f9",
    padding: "20px",
    borderRadius: "8px",
    boxShadow: "0 0 5px rgba(0,0,0,0.1)",
  },
  sectionTitle: { fontSize: "20px", fontWeight: "bold", margin: "20px 0" },
  videoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(5, 1fr)",
    gap: "10px",
  },
  videoCard: {
    textAlign: "center",
    backgroundColor: "#f9f9f9",
    padding: "10px",
    borderRadius: "8px",
    boxShadow: "0 0 5px rgba(0,0,0,0.1)",
  },
  videoThumbnailContainer: { position: "relative" },
  videoThumbnail: { width: "100%", borderRadius: "8px" },
  videoDuration: {
    position: "absolute",
    bottom: "8px",
    right: "8px",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    color: "white",
    padding: "4px",
    fontSize: "12px",
    borderRadius: "4px",
  },
  videoTitle: { fontSize: "14px", fontWeight: "bold", margin: "10px 0" },
  videoMeta: { fontSize: "12px", color: "#555" },
  videoLink: { textDecoration: "none", color: "black" },
  pagination: {
    display: "flex",
    justifyContent: "center",
    gap: "10px",
    marginTop: "20px",
  },
};
