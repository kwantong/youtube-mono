"use client";

import { useState, useEffect } from "react";

const API_URL = "http://localhost:3002/api/admin/videoStatistic"; // Backend API URL

export default function VideoStatisticPage() {
  const [statistics, setStatistics] = useState([]);
  const [channelId, setChannelId] = useState("");
  const [videoId, setVideoId] = useState("");
  const [snapshotDate, setSnapshotDate] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(5);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // Fetch data
  const fetchStatistics = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
        ...(channelId && { channel_id: channelId }),
        ...(videoId && { video_id: videoId }),
        ...(snapshotDate && { snapshot_date: snapshotDate }),
      });

      const res = await fetch(`${API_URL}?${queryParams}`);
      const data = await res.json();

      if (data.success) {
        setStatistics(data.data);
        setHasMore(data.data.length === pageSize);
      } else {
        setStatistics([]);
        setHasMore(false);
      }
    } catch (error) {
      console.error("Failed to fetch statistics", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on page load
  useEffect(() => {
    fetchStatistics();
  }, [page]);

  // Handle search
  const handleSearch = () => {
    setPage(1);
    fetchStatistics();
  };

  // Previous page
  const handlePrevPage = () => {
    if (page > 1) setPage(page - 1);
  };

  // Next page
  const handleNextPage = () => {
    if (hasMore) setPage(page + 1);
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>YouTube Video Statistics</h1>

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
          value={snapshotDate}
          onChange={(e) => setSnapshotDate(e.target.value)}
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
              <th>Snapshot Date</th>
              <th>Comments</th>
              <th>Views</th>
              <th>Likes</th>
              <th>Favorites</th>
            </tr>
          </thead>
          <tbody>
            {statistics.length > 0 ? (
              statistics.map((stat: any) => (
                <tr key={stat.id}>
                  <td>{stat.id}</td>
                  <td>{stat.channel_id}</td>
                  <td>{stat.video_id}</td>
                  <td>{stat.snapshot_date}</td>
                  <td>{stat.total_comments}</td>
                  <td>{stat.total_views}</td>
                  <td>{stat.total_likes}</td>
                  <td>{stat.total_favorites}</td>
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
        <span style={styles.pageInfo}>Current Page: {page}</span>
        <button
          onClick={handleNextPage}
          disabled={!hasMore}
          style={{
            ...styles.pageButton,
            ...(!hasMore ? styles.disabledButton : {}),
          }}
        >
          Next Page
        </button>
      </div>
    </div>
  );
}

/** Styles */
const styles = {
  container: { padding: "20px", fontFamily: "Arial, sans-serif" },
  title: { fontSize: "24px", marginBottom: "20px" },
  searchSection: { display: "flex", gap: "10px", marginBottom: "20px" },
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
  noData: { textAlign: "center", padding: "10px" },
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
