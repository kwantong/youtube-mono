"use client";

import { useEffect, useState } from "react";

const API_URL = `${process.env.NEXT_PUBLIC_ADMIN_API_BASE_URL}/admin/googleAPIUsage`;

export default function GoogleAPIUsagePage() {
  const [apiUsages, setApiUsages] = useState<any[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    fetchApiUsage();
  }, [page]);

  // 获取 API Key 使用数据
  const fetchApiUsage = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${API_URL}?page=${page}&limit=5&apiKey=${search}&startDate=${startDate}&endDate=${endDate}`
      );
      const data = await res.json();
      if (data.success) {
        setApiUsages(data.data);
        setTotalPages(data.totalPages);
        setTotalCount(data.totalCount);
      }
    } catch (error) {
      console.error("Failed to fetch API usage data", error);
    }
    setLoading(false);
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
      <h1 style={styles.title}>Google API Key 使用情况</h1>

      {/* 搜索框 */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
        <input
          type="text"
          placeholder="搜索 API Key..."
          style={styles.input}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <input
          type="date"
          placeholder="起始日期"
          style={styles.input}
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
        <input
          type="date"
          placeholder="结束日期"
          style={styles.input}
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
        <button
          style={{ ...styles.button, ...styles.buttonPrimary }}
          onClick={fetchApiUsage}
        >
          搜索
        </button>
      </div>

      {/* API Key 使用情况列表 */}
      {loading ? (
        <p>加载中...</p>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>API Key</th>
              <th style={styles.th}>使用日期</th>
              <th style={styles.th}>配额限制</th>
              <th style={styles.th}>已使用配额</th>
              <th style={styles.th}>最后使用时间</th>
            </tr>
          </thead>
          <tbody>
            {apiUsages.map((usage) => (
              <tr key={usage.usage_date + usage.api_key}>
                <td style={styles.td}>{usage.api_key}</td>
                <td style={styles.td}>{usage.usage_date}</td>
                <td style={styles.td}>{usage.quota_limit}</td>
                <td style={styles.td}>{usage.quota_used}</td>
                <td style={styles.td}>
                  {new Date(usage.last_used_at).toLocaleString()}
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
