"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

const API_URL = `${process.env.NEXT_PUBLIC_USER_API_BASE_URL}/user/keyword`;

export default function KeywordListPage() {
  const [keywords, setKeywords] = useState<{ id: string; keyword: string }[]>(
    []
  );
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10); // 每页显示 10 条
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const fetchKeywords = useCallback(async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
      });

      const res = await fetch(`${API_URL}?${queryParams}`);
      const data = await res.json();
      if (data.success) {
        setKeywords(data.data);
        setTotalPages(data.totalPages);
      }
    } catch (error) {
      console.error("Failed to fetch keywords", error);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize]);

  useEffect(() => {
    fetchKeywords();
  }, [fetchKeywords, page]);

  // 处理点击关键词
  const handleKeywordClick = (id: string) => {
    router.push(`/keyword/detail/${id}`);
  };

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
      <h1 style={styles.title}>Keyword List</h1>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <ul style={styles.list}>
          {keywords.length > 0 ? (
            keywords.map((item) => (
              <li
                key={item.id}
                style={styles.listItem}
                onClick={() => handleKeywordClick(item.id)}
              >
                {item.keyword}
              </li>
            ))
          ) : (
            <p>No keywords found.</p>
          )}
        </ul>
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
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    padding: "20px",
    fontFamily: "Arial, sans-serif",
    maxWidth: "600px",
    margin: "auto",
  },
  title: {
    fontSize: "24px",
    marginBottom: "20px",
    textAlign: "center",
  },
  list: {
    listStyle: "none",
    padding: 0,
  },
  listItem: {
    padding: "10px",
    borderBottom: "1px solid #ddd",
    cursor: "pointer",
    color: "#007bff",
    fontSize: "18px",
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
