"use client";

import { useState, useEffect } from "react";

const API_URL = "http://localhost:3002/api/admin/channelData"; // Backend API URL

export default function ChannelPage() {
  const [channels, setChannels] = useState([]);
  const [channelId, setChannelId] = useState("");
  const [channelName, setChannelName] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(5); // 5 items per page
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true); // 是否有下一页

  // Fetch data
  const fetchChannels = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
        ...(channelId && { channel_id: channelId }),
        ...(channelName && { channel_name: channelName }),
      });

      const res = await fetch(`${API_URL}?${queryParams}`);
      const data = await res.json();

      if (data.success) {
        setChannels(data.data);
        setHasMore(data.data.length === pageSize);
      } else {
        setChannels([]);
        setHasMore(false);
      }
    } catch (error) {
      console.error("Failed to fetch channels", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on page load
  useEffect(() => {
    fetchChannels();
  }, [page]);

  // Handle search
  const handleSearch = () => {
    setPage(1); // Reset to page 1 when searching
    fetchChannels();
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
      <h1 style={styles.title}>YouTube Channel Management</h1>

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
          placeholder="Enter Channel Name"
          value={channelName}
          onChange={(e) => setChannelName(e.target.value)}
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
              <th>Channel Name</th>
              <th>Channel Created At</th>
              <th>Created At</th>
              <th>Updated At</th>
              <th>Thumbnail</th>
            </tr>
          </thead>
          <tbody>
            {channels.length > 0 ? (
              channels.map((channel: any) => (
                <tr key={channel.id}>
                  <td>{channel.id}</td>
                  <td>{channel.channel_id}</td>
                  <td>{channel.channel_name}</td>
                  <td>{channel.channel_created_at}</td>
                  <td>{channel.created_at}</td>
                  <td>{channel.updated_at}</td>
                  <td>
                    <img
                      src={channel.channel_thumbnail_url}
                      alt="Thumbnail"
                      style={{ width: "50px", height: "50px" }}
                    />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} style={{ textAlign: "center" }}>
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
    backgroundColor: "#cccccc",
    cursor: "not-allowed",
  },
  pageInfo: {
    fontSize: "16px",
    fontWeight: "bold",
  },
};
