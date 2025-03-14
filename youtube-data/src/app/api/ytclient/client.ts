const API_KEY = "AIzaSyBK91d1e7cdlIzCVUKCeviGDw1PL2P2ZOk";
const BASE_URL = "https://www.googleapis.com/youtube/v3";
// max is 50
const maxResults = 50;

export async function search(
  nextPageToken: string | undefined,
  channelId: string | undefined,
  keyword: string | undefined
) {
  let api_url = `${BASE_URL}/search?part=snippet,id&type=video&maxResults=${maxResults}&order=date&key=${API_KEY}`;

  if (channelId) {
    api_url += `&channelId=${channelId}`;
  } else if (keyword) {
    api_url += `&q=${encodeURIComponent(keyword)}&order=viewCount`;
  } else {
    return undefined;
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

export async function videos(videoIds: string) {
  const videoUrl = `${BASE_URL}/videos?part=snippet,contentDetails,statistics&id=${videoIds}&key=${API_KEY}`;
  const videoRes = await fetch(videoUrl);
  const videoData = await videoRes.json();
  return videoData?.items ?? [];
}

export async function channels(channelIds: string) {
  const channelUrl = `${BASE_URL}/channels?part=snippet,contentDetails,statistics&id=${channelIds}&key=${API_KEY}`;
  const channelRes = await fetch(channelUrl);
  const channelData = await channelRes.json();
  return channelData?.items ?? [];
}
