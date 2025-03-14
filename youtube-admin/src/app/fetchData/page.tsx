"use client";

import { useCallback, useState } from "react";

const API_URL = "http://localhost:8081/api/search";

export default function Page() {
  const [isFetching, setIsFetching] = useState(false);

  const fetchKeywords = useCallback(async () => {
    if (isFetching) {
      return;
    }
    try {
      setIsFetching(true);
      const res = await fetch(API_URL);
      const data = await res.json();
    } catch (error) {
      console.error("Failed to fetch keywords", error);
    } finally {
      setIsFetching(false);
    }
  }, [isFetching]);

  return (
    <div>
      <button onClick={fetchKeywords} disabled={isFetching}>
        fetch data
      </button>
    </div>
  );
}
