// const API_KEY = "AIzaSyBK91d1e7cdlIzCVUKCeviGDw1PL2P2ZOk";
const BASE_URL = "https://www.googleapis.com/youtube/v3";
// max is 50
const maxResults = 50;

// Quota cost = 100
export async function search(
  nextPageToken: string | undefined,
  channelId: string | undefined,
  keyword: string | undefined,
  apiKey: string | undefined
) {
  if (!apiKey) {
    console.error("No Google apiKey found!");
    return {
      searchItems: [],
      nextPageToken: undefined,
    };
  }
  let api_url = `${BASE_URL}/search?part=snippet,id&type=video&maxResults=${maxResults}&order=date&key=${apiKey}`;

  if (channelId) {
    api_url += `&channelId=${channelId}`;
  } else if (keyword) {
    api_url += `&q=${encodeURIComponent(keyword)}&order=viewCount`;
  } else {
    return {
      searchItems: [],
      nextPageToken: undefined,
    };
  }

  if (nextPageToken) {
    api_url += `&pageToken=${nextPageToken}`;
  }

  const searchRes = await fetch(api_url);
  const searchData = await searchRes.json();

  return {
    searchItems: searchData.items ?? [],
    nextPageToken: searchData.nextPageToken ?? undefined, // 返回下一页的 token
  };
}

// Quota cost: videoIds count (max 50) * part count (3: snippet,contentDetails,statistics)
// Quota cost = 150
export async function videos(videoIds: string, apiKey: string | undefined) {
  if (!apiKey) {
    console.error("No Google apiKey found!");
    return [];
  }
  const videoUrl = `${BASE_URL}/videos?part=snippet,contentDetails,statistics&id=${videoIds}&key=${apiKey}`;
  const videoRes = await fetch(videoUrl);
  const videoData = await videoRes.json();
  return videoData?.items ?? [];
}

// Quota cost: channelIds count (max 50) * part count (2: snippet,statistics)
// Quota cost = 100
export async function channels(channelIds: string, apiKey: string | undefined) {
  if (!apiKey) {
    console.error("No Google apiKey found!");
    return [];
  }
  const channelUrl = `${BASE_URL}/channels?part=snippet,statistics&id=${channelIds}&key=${apiKey}`;
  const channelRes = await fetch(channelUrl);
  const channelData = await channelRes.json();
  return channelData?.items ?? [];
}
