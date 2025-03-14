"use client";

import { useCallback, useEffect, useState } from "react";

const API_URL = "http://localhost:8082/api/admin/keyword";

export default function Page() {
  const [keywords, setKeywords] = useState<
    { id: string; keyword: string; is_deleted: number }[]
  >([]);
  const [newKeyword, setNewKeyword] = useState("");

  useEffect(() => {
    (async () => {
      await fetchKeywords();
    })();
  }, []);

  const fetchKeywords = useCallback(async () => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setKeywords(data);
    } catch (error) {
      console.error("Failed to fetch keywords", error);
    }
  }, []);

  const addKeyword = useCallback(async () => {
    if (!newKeyword.trim()) return alert("please insert keyword");
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword: newKeyword }),
      });
      if (res.ok) {
        await fetchKeywords();
      } else {
        alert("failed");
      }
    } catch (error) {
      console.error("Failed to add keyword", error);
    }
  }, [newKeyword]);

  const toggleIsDelete = useCallback(async (id: string, isDelete: number) => {
    try {
      const res = await fetch(API_URL, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isDelete: isDelete === 1 ? 2 : 1 }), // 1->2, 2->1
      });
      if (res.ok) {
        fetchKeywords();
      } else {
        alert("failed");
      }
    } catch (error) {
      console.error("Failed to update keyword status", error);
    }
  }, []);

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Keyword 管理</h1>

      <div style={styles.addSection}>
        <input
          type="text"
          placeholder="keyword"
          onChange={(e) => setNewKeyword(e.target.value)}
          style={styles.input}
        />
        <button onClick={addKeyword} style={styles.addButton}>
          Add
        </button>
      </div>

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
          {keywords.map((item) => (
            <tr key={item.id}>
              <td>{item.id}</td>
              <td>{item.keyword}</td>
              <td>{item.is_deleted === 1 ? "deleted" : "running"}</td>
              <td>
                <button
                  onClick={() => toggleIsDelete(item.id, item.is_deleted)}
                  style={styles.toggleButton}
                >
                  {item.is_deleted === 1 ? "restore" : "delete"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    padding: "20px",
    fontFamily: "Arial, sans-serif",
  },
  title: {
    fontSize: "24px",
    marginBottom: "20px",
  },
  addSection: {
    display: "flex",
    gap: "10px",
    marginBottom: "20px",
  },
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
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  toggleButton: {
    padding: "6px 12px",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
};
