"use client";

import { useCallback, useEffect, useState } from "react";

const API_URL = `${process.env.NEXT_PUBLIC_ADMIN_API_BASE_URL}/admin/keyword`;

export default function Page() {
  const [keywords, setKeywords] = useState<
    { id: string; keyword: string; is_deleted: number }[]
  >([]);
  const [newKeyword, setNewKeyword] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(5); // 每页 5 条
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const fetchKeywords = useCallback(async () => {
    try {
      const queryParams = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
      });

      const res = await fetch(`${API_URL}?${queryParams}`);
      const data = await res.json();
      if (data.success) {
        setKeywords(data.data);
        setTotalCount(data.totalCount);
        setTotalPages(data.totalPages);
      }
    } catch (error) {
      console.error("Failed to fetch keywords", error);
    }
  }, [page, pageSize]);

  useEffect(() => {
    fetchKeywords();
  }, [fetchKeywords, page]); // 监听页码变化，刷新数据

  const addKeyword = useCallback(async () => {
    if (!newKeyword.trim()) return alert("Please insert a keyword");
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword: newKeyword }),
      });
      if (res.ok) {
        setNewKeyword("");
        fetchKeywords(); // 重新获取数据
      } else {
        alert("Failed to add keyword");
      }
    } catch (error) {
      console.error("Failed to add keyword", error);
    }
  }, [newKeyword, fetchKeywords]);

  const toggleIsDelete = useCallback(
    async (id: string, isDelete: number) => {
      try {
        const res = await fetch(API_URL, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, isDelete: isDelete === 1 ? 2 : 1 }), // 1->2, 2->1
        });
        if (res.ok) {
          fetchKeywords(); // 重新获取数据
        } else {
          alert("Failed to update keyword status");
        }
      } catch (error) {
        console.error("Failed to update keyword status", error);
      }
    },
    [fetchKeywords]
  );

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
      <h1 style={styles.title}>Keyword Management</h1>

      {/* 添加关键字 */}
      <div style={styles.addSection}>
        <input
          type="text"
          placeholder="Enter keyword"
          value={newKeyword}
          onChange={(e) => setNewKeyword(e.target.value)}
          style={styles.input}
        />
        <button onClick={addKeyword} style={styles.addButton}>
          Add
        </button>
      </div>

      {/* 关键词列表 */}
      <table style={styles.table}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Keyword</th>
            <th>Status</th>
            <th>Delete</th>
          </tr>
        </thead>
        <tbody>
          {keywords.length > 0 ? (
            keywords.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.keyword}</td>
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
              <td colSpan={4} style={styles.noData}>
                No keywords found
              </td>
            </tr>
          )}
        </tbody>
      </table>

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
          Page {page} of {totalPages} | Total: {totalCount}
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
const styles: { [key: string]: React.CSSProperties } = {
  container: { padding: "20px", fontFamily: "Arial, sans-serif" },
  title: { fontSize: "24px", marginBottom: "20px" },
  addSection: { display: "flex", gap: "10px", marginBottom: "20px" },
  input: {
    width: "300px",
    padding: "8px",
    border: "1px solid #ccc",
    borderRadius: "4px",
  },
  addButton: {
    padding: "8px 16px",
    backgroundColor: "#4CAF50",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  table: { width: "100%", borderCollapse: "collapse" },
  toggleButton: {
    padding: "6px 12px",
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
