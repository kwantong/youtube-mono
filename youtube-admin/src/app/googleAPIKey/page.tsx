"use client";

import { useEffect, useState } from "react";

const API_URL = `${process.env.NEXT_PUBLIC_ADMIN_API_BASE_URL}/admin/googleAPIKey`;

export default function GoogleAPIKeyPage() {
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [newApiKey, setNewApiKey] = useState("");

  useEffect(() => {
    fetchApiKeys();
  }, [page]);

  const fetchApiKeys = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${API_URL}?page=${page}&limit=5&apiKey=${search}`
      );
      const data = await res.json();
      if (data.success) {
        setApiKeys(data.data);
        setTotalPages(data.totalPages);
        setTotalCount(data.totalCount);
      }
    } catch (error) {
      console.error("Failed to fetch API keys", error);
    }
    setLoading(false);
  };

  const addApiKey = async () => {
    if (!newApiKey) return alert("请输入 API Key");
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: newApiKey }),
      });
      const data = await res.json();
      if (data.success) {
        setNewApiKey("");
        fetchApiKeys();
      } else {
        alert(data.error || "添加失败");
      }
    } catch (error) {
      console.error("Failed to add API key", error);
    }
  };

  const toggleApiKeyStatus = async (apiKey: string, isActive: boolean) => {
    try {
      const res = await fetch(API_URL, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey, isActive }),
      });
      const data = await res.json();
      if (data.success) {
        fetchApiKeys();
      } else {
        alert(data.error || "更新失败");
      }
    } catch (error) {
      console.error("Failed to update API key", error);
    }
  };

  // **定义样式对象**
  const styles = {
    container: {
      padding: "24px",
    },
    title: {
      fontSize: "24px",
      fontWeight: "bold",
      marginBottom: "16px",
    },
    input: {
      padding: "8px",
      border: "1px solid #ccc",
      borderRadius: "4px",
      flex: 1,
    },
    button: {
      padding: "8px 16px",
      borderRadius: "4px",
      cursor: "pointer",
      border: "none",
    },
    buttonPrimary: {
      backgroundColor: "#007bff",
      color: "white",
    },
    buttonSecondary: {
      backgroundColor: "#28a745",
      color: "white",
    },
    table: {
      width: "100%",
      borderCollapse: "collapse",
      border: "1px solid #ddd",
    },
    th: {
      backgroundColor: "#f2f2f2",
      border: "1px solid #ddd",
      padding: "8px",
    },
    td: {
      border: "1px solid #ddd",
      padding: "8px",
      textAlign: "center",
    },
    pagination: {
      display: "flex",
      justifyContent: "space-between",
      marginTop: "16px",
    },
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Google API Key 管理</h1>

      {/* 搜索框 */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
        <input
          type="text"
          placeholder="搜索 API Key..."
          style={styles.input}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button
          style={{ ...styles.button, ...styles.buttonPrimary }}
          onClick={fetchApiKeys}
        >
          搜索
        </button>
      </div>

      {/* 添加 API Key */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
        <input
          type="text"
          placeholder="输入新的 API Key..."
          style={styles.input}
          value={newApiKey}
          onChange={(e) => setNewApiKey(e.target.value)}
        />
        <button
          style={{ ...styles.button, ...styles.buttonSecondary }}
          onClick={addApiKey}
        >
          添加 API Key
        </button>
      </div>

      {/* API Key 列表 */}
      {loading ? (
        <p>加载中...</p>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>API Key</th>
              <th style={styles.th}>状态</th>
              <th style={styles.th}>创建时间</th>
              <th style={styles.th}>操作</th>
            </tr>
          </thead>
          <tbody>
            {apiKeys.map((key) => (
              <tr key={key.id}>
                <td style={styles.td}>{key.api_key}</td>
                <td style={styles.td}>
                  {key.is_active ? (
                    <span style={{ color: "green" }}>启用</span>
                  ) : (
                    <span style={{ color: "red" }}>禁用</span>
                  )}
                </td>
                <td style={styles.td}>
                  {new Date(key.created_at).toLocaleString()}
                </td>
                <td style={styles.td}>
                  <button
                    style={{
                      ...styles.button,
                      backgroundColor: key.is_active ? "red" : "green",
                      color: "white",
                    }}
                    onClick={() =>
                      toggleApiKeyStatus(key.api_key, !key.is_active)
                    }
                  >
                    {key.is_active ? "禁用" : "启用"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* 分页 */}
      <div style={styles.pagination}>
        <button
          style={{ ...styles.button, backgroundColor: "#ccc" }}
          disabled={page <= 1}
          onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
        >
          上一页
        </button>
        <span>
          第 {page} 页 / 共 {totalPages} 页 （{totalCount} 条数据）
        </span>
        <button
          style={{ ...styles.button, backgroundColor: "#ccc" }}
          disabled={page >= totalPages}
          onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
        >
          下一页
        </button>
      </div>
    </div>
  );
}
