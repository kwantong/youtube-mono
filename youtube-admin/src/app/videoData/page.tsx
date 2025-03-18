"use client";

import { useState, useEffect } from "react";
import { PAGE_ITEM_COUNT } from "../common/const";

const API_URL = `${process.env.NEXT_PUBLIC_ADMIN_API_BASE_URL}/admin/videoData`;

export default function VideoDataPage() {
  const [videos, setVideos] = useState([]);
  const [channelId, setChannelId] = useState("");
  const [videoId, setVideoId] = useState("");
  const [videoPublishedAt, setVideoPublishedAt] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(PAGE_ITEM_COUNT);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  // Fetch data
  const fetchVideos = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
        ...(channelId && { channel_id: channelId }),
        ...(videoId && { video_id: videoId }),
        ...(videoPublishedAt && { video_published_at: videoPublishedAt }),
      });

      const res = await fetch(`${API_URL}?${queryParams}`);
      const data = await res.json();

      if (data.success) {
        setVideos(data.data);
        setTotalCount(data.totalCount);
        setTotalPages(data.totalPages);
      } else {
        setVideos([]);
        setTotalCount(0);
        setTotalPages(1);
      }
    } catch (error) {
      console.error("Failed to fetch videos", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on page load
  useEffect(() => {
    fetchVideos();
  }, [page]);

  // Handle search
  const handleSearch = () => {
    setPage(1);
    fetchVideos();
  };

  // Previous page
  const handlePrevPage = () => {
    if (page > 1) setPage(page - 1);
  };

  // Next page
  const handleNextPage = () => {
    if (page < totalPages) setPage(page + 1);
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>YouTube Video Data</h1>

      {/* Search section */}
      <div style={styles.searchSection}>
        <input
          type="text"
          placeholder="Enter Channel ID"
          value={channelId}
          onChange={(e) => setChannelId(e.target.value)}
          style={styles.input}
        />
        <input
          type="text"
          placeholder="Enter Video ID"
          value={videoId}
          onChange={(e) => setVideoId(e.target.value)}
          style={styles.input}
        />
        <input
          type="date"
          value={videoPublishedAt}
          onChange={(e) => setVideoPublishedAt(e.target.value)}
          style={styles.input}
        />
        <button onClick={handleSearch} style={styles.searchButton}>
          Search
        </button>
      </div>

      {/* Results table */}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Channel ID</th>
              <th>Video ID</th>
              <th>Title</th>
              <th>Published At</th>
              <th>Thumbnail</th>
              <th>Duration</th>
              <th>Category</th>
            </tr>
          </thead>
          <tbody>
            {videos.length > 0 ? (
              videos.map((video: any) => (
                <tr key={video.id}>
                  <td>{video.id}</td>
                  <td>{video.channel_id}</td>
                  <td>{video.video_id}</td>
                  <td>{video.video_title}</td>
                  <td>{video.video_published_at}</td>
                  <td>
                    <img
                      src={video.video_thumbnail_url}
                      alt="Thumbnail"
                      style={styles.thumbnail}
                    />
                  </td>
                  <td>{video.video_duration}</td>
                  <td>{video.video_category_id}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} style={styles.noData}>
                  No data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      {/* Pagination controls */}
      <div style={styles.pagination}>
        <button
          onClick={handlePrevPage}
          disabled={page === 1}
          style={{
            ...styles.pageButton,
            ...(page === 1 ? styles.disabledButton : {}),
          }}
        >
          Previous Page
        </button>
        <span style={styles.pageInfo}>
          Page {page} of {totalPages} | Total Records: {totalCount}
        </span>
        <button
          onClick={handleNextPage}
          disabled={page >= totalPages}
          style={{
            ...styles.pageButton,
            ...(page >= totalPages ? styles.disabledButton : {}),
          }}
        >
          Next Page
        </button>
      </div>
    </div>
  );
}

/** Styles */
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    padding: "20px",
    fontFamily: "Arial, sans-serif",
  },
  title: {
    fontSize: "24px",
    marginBottom: "20px",
  },
  searchSection: {
    display: "flex",
    gap: "10px",
    marginBottom: "20px",
  },
  input: {
    padding: "8px",
    border: "1px solid #ccc",
    borderRadius: "4px",
    flex: 1,
  },
  searchButton: {
    padding: "8px 16px",
    backgroundColor: "#4CAF50",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginBottom: "20px",
    border: "1px solid #ddd",
  },
  thumbnail: {
    width: "50px",
    height: "50px",
    objectFit: "cover",
  },
  noData: {
    textAlign: "center",
    padding: "10px",
  },
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
  disabledButton: {
    backgroundColor: "#ccc",
    cursor: "not-allowed",
  },
  pageInfo: {
    fontSize: "16px",
    fontWeight: "bold",
  },
};
