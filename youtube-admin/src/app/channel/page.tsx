"use client";

import { useCallback, useEffect, useState } from "react";

const API_URL = `${process.env.NEXT_PUBLIC_ADMIN_API_BASE_URL}/admin/channelId`;

export default function Page() {
  const [channelIdDataset, setChannelIdDataset] = useState<
    {
      id: string;
      channel_id: string;
      channel_name: string;
      is_deleted: number;
    }[]
  >([]);
  const [newChannelId, setNewChannelId] = useState("");
  const [newChannelName, setNewChannelName] = useState("");
  const [searchChannelId, setSearchChannelId] = useState("");
  const [searchChannelName, setSearchChannelName] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const fetchChannelIds = useCallback(async () => {
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
        setChannelIdDataset(data.data);
        setTotalPages(data.totalPages);
      }
    } catch (error) {
      console.error("Failed to fetch ChannelIds", error);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, searchChannelId, searchChannelName]);

  useEffect(() => {
    fetchChannelIds();
  }, [fetchChannelIds, page]); // 当页码变化时，重新获取数据

  const addChannelId = useCallback(async () => {
    if (!newChannelId.trim()) return alert("Please insert ChannelId");
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channelId: newChannelId,
          channelName: newChannelName,
        }),
      });
      if (res.ok) {
        setNewChannelId("");
        setNewChannelName("");
        fetchChannelIds();
      } else {
        alert("Failed to add ChannelId");
      }
    } catch (error) {
      console.error("Failed to add ChannelId", error);
    }
  }, [newChannelId, newChannelName, fetchChannelIds]);

  const toggleIsDelete = useCallback(
    async (id: string, isDelete: number) => {
      try {
        const res = await fetch(API_URL, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, isDelete: isDelete === 1 ? 2 : 1 }), // 1->2, 2->1
        });
        if (res.ok) {
          fetchChannelIds();
        } else {
          alert("Failed to update channelId status");
        }
      } catch (error) {
        console.error("Failed to update channelId status", error);
      }
    },
    [fetchChannelIds]
  );

  // 上一页
  const handlePrevPage = () => {
    if (page > 1) setPage(page - 1);
  };

  // 下一页
  const handleNextPage = () => {
    if (page < totalPages) setPage(page + 1);
  };

  // 触发搜索
  const handleSearch = () => {
    setPage(1);
    fetchChannelIds();
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Channel ID Management</h1>

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

      {/* 添加 Channel ID */}
      <div style={styles.addSection}>
        <input
          type="text"
          placeholder="Channel ID"
          value={newChannelId}
          onChange={(e) => setNewChannelId(e.target.value)}
          style={styles.input}
        />
        <input
          type="text"
          placeholder="Channel Name (Optional)"
          value={newChannelName}
          onChange={(e) => setNewChannelName(e.target.value)}
          style={styles.input}
        />
        <button onClick={addChannelId} style={styles.addButton}>
          Add
        </button>
      </div>

      {/* 关键词列表 */}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Channel ID</th>
              <th>Channel Name</th>
              <th>Status</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {channelIdDataset.length > 0 ? (
              channelIdDataset.map((item) => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>{item.channel_id}</td>
                  <td>{item.channel_name}</td>
                  <td>{item.is_deleted === 1 ? "Deleted" : "Running"}</td>
                  <td>
                    <button
                      onClick={() => toggleIsDelete(item.id, item.is_deleted)}
                      style={styles.toggleButton}
                    >
                      {item.is_deleted === 1 ? "Restore" : "Delete"}
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} style={styles.noData}>
                  No data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
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
  container: { padding: "20px", fontFamily: "Arial, sans-serif" },
  title: { fontSize: "24px", marginBottom: "20px" },
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
