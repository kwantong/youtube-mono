"use client";

import { useCallback, useEffect, useState } from "react";

const API_URL = "http://localhost:3002/api/admin/channelId";

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

  useEffect(() => {
    (async () => {
      await fetchChannelIds();
    })();
  }, []);

  const fetchChannelIds = useCallback(async () => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setChannelIdDataset(data);
    } catch (error) {
      console.error("Failed to fetch ChannelIds", error);
    }
  }, []);

  const addChannelId = useCallback(async () => {
    if (!newChannelId.trim()) return alert("please insert ChannelId");
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
        await fetchChannelIds();
      } else {
        alert("failed");
      }
    } catch (error) {
      console.error("Failed to add ChannelId", error);
    }
  }, [newChannelId, newChannelName]);

  const toggleIsDelete = useCallback(async (id: string, isDelete: number) => {
    try {
      const res = await fetch(API_URL, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isDelete: isDelete === 1 ? 2 : 1 }), // 1->2, 2->1
      });
      if (res.ok) {
        fetchChannelIds();
      } else {
        alert("failed");
      }
    } catch (error) {
      console.error("Failed to update channelId status", error);
    }
  }, []);

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>channelId 管理</h1>

      <div style={styles.addSection}>
        <input
          type="text"
          placeholder="channelId"
          onChange={(e) => setNewChannelId(e.target.value)}
          style={styles.input}
        />
        <input
          type="text"
          placeholder="channelName(Optional)"
          onChange={(e) => setNewChannelName(e.target.value)}
          style={styles.input}
        />
        <button onClick={addChannelId} style={styles.addButton}>
          Add
        </button>
      </div>

      <table style={styles.table}>
        <thead>
          <tr>
            <th>ID</th>
            <th>ChannelId</th>
            <th>ChannelName</th>
            <th>Status</th>
            <th>Delete</th>
          </tr>
        </thead>
        <tbody>
          {channelIdDataset.map((item) => (
            <tr key={item.id}>
              <td>{item.id}</td>
              <td>{item.channel_id}</td>
              <td>{item.channel_name}</td>
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
