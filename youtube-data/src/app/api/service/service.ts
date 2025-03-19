import { channels, search, videos } from "../ytclient/client";
import {
  getAllChannelIds,
  getAllKeywords,
  getAvailableApiKey,
  insertChannel,
  insertChannelStatistics,
  insertKeywordsVideos,
  insertVideo,
  insertVideoStatistics,
  updateQuotaUsage,
} from "../dao/dao";

export async function fetchDataByChannel() {
  // get all channels from channel_setting table
  const allChannelId = await getAllChannelIds();
  console.log("channelIds length: " + allChannelId.length);

  if (!allChannelId || allChannelId.length === 0) {
    return;
  }

  // Split allChannelId into chunks of up to 50 IDs each
  const channelChunks = chunkArray(allChannelId, 50);

  // TODO MEMO: cost= 30 (15 channels)
  const totalCostForChannels = channelChunks.reduce(
    (sum, chunk) => sum + chunk.length,
    0
  );
  console.log(`QUOTA: ${totalCostForChannels} QUOTA will be used`);
  const apiUsageForChannels = await getAvailableApiKey(totalCostForChannels);

  // [DB] update Quota Usage
  apiUsageForChannels?.id &&
    (await updateQuotaUsage(apiUsageForChannels.id, totalCostForChannels));

  // [API] Fetch all channel details from YT data API in parallel
  const allChannelDetails = (
    await Promise.all(
      channelChunks.map((chunk) => {
        return channels(chunk.join(","), apiUsageForChannels?.api_key);
      })
    )
  ).flat();

  // Make channelBasicInfo list from response
  const channelBasicInfo = allChannelDetails?.map((item) => {
    return {
      channel_id: item.id,
      channel_name: item.snippet.title,
      channel_created_at: item.snippet.publishedAt,
      channel_description: item.snippet.description,
      channel_thumbnail_url: item.snippet.thumbnails.default.url,
    };
  });
  // [DB] insert channelBasicInfo list to yt_channel table
  await insertChannel(channelBasicInfo);

  // Make channelStatistics list from response
  const channelStatistics = allChannelDetails?.map((item) => {
    return {
      channel_id: item.id,
      subscriber_count: item.statistics.subscriberCount ?? 0,
      view_count: item.statistics.viewCount ?? 0,
      video_count: item.statistics.videoCount ?? 0,
    };
  });
  // [DB] insert channelStatistics list to yt_channel_statistics table
  await insertChannelStatistics(channelStatistics);

  // TODO MEMO: Assume 500 videos per channel and 15 channels
  // TODO MEMO: cost= 15 channels * (10 times of searches * 100 cost + 10 times of fetch videoDetails * 150 cost) = 37500
  allChannelId.forEach((channelId) => {
    (async () => {
      console.log("channelId: " + channelId);

      let nextPageToken: string | undefined = undefined;
      do {
        // TODO MEMO: cost= 100
        const totalCostForSearch = 100;

        console.log(`QUOTA: ${totalCostForSearch} QUOTA will be used`);
        // [DB]
        const apiUsageForSearch = await getAvailableApiKey(totalCostForSearch);
        // [DB]
        apiUsageForSearch?.id &&
          (await updateQuotaUsage(apiUsageForSearch.id, totalCostForSearch));
        // [API] search channel information and videos by channelId
        const { searchItems, nextPageToken: newToken } = await search(
          nextPageToken,
          channelId,
          undefined,
          apiUsageForSearch?.api_key
        );
        const videoIds = searchItems
          .map((item: any) => item.id.videoId)
          .join(",");

        // TODO MEMO: cost= 150 (3*50)
        const totalCostForVideos = searchItems.length;

        console.log(`QUOTA: ${totalCostForVideos} QUOTA will be used`);
        // [DB]
        const apiUsageForVideos = await getAvailableApiKey(totalCostForVideos);
        // [DB]
        apiUsageForVideos?.id &&
          (await updateQuotaUsage(apiUsageForVideos.id, totalCostForVideos));
        // [API]
        await fetchAndSaveVideoDetails(videoIds, apiUsageForVideos?.api_key);
        nextPageToken = newToken;
      } while (nextPageToken !== undefined);
    })();
  });
}

export async function fetchDataByKeyword() {
  const allKeywords = await getAllKeywords();

  console.log("allKeywords length: " + allKeywords.length);

  if (!allKeywords || allKeywords.length === 0) {
    return;
  }

  // TODO MEMO: Top 500 videos per Keyword and 30 Keywords
  // TODO MEMO: cost= 30 channels * (10 times of searches * 100 cost + 10 times of fetch videoDetails * 150 cost) = 75000
  allKeywords.forEach((item) => {
    (async () => {
      let nextPageToken: string | undefined = undefined;
      let fetchCount = 0;
      do {
        // TODO MEMO: cost= 100
        const totalCostForSearch = 100;

        console.log(`QUOTA: ${totalCostForSearch} QUOTA will be used`);
        // [DB]
        const apiUsageForSearch = await getAvailableApiKey(totalCostForSearch);
        // [DB]
        apiUsageForSearch?.id &&
          (await updateQuotaUsage(apiUsageForSearch.id, totalCostForSearch));
        // [API]
        const { searchItems, nextPageToken: newToken } = await search(
          nextPageToken,
          undefined,
          item.keyword,
          apiUsageForSearch?.api_key
        );
        const videoIds = searchItems
          .map((item: any) => item.id.videoId)
          .join(",");
        const keywordsVideos = searchItems.map((searchItem) => {
          return {
            keyword_id: item.id,
            video_id: searchItem.id.videoId,
          };
        });
        await insertKeywordsVideos(keywordsVideos);

        // TODO MEMO: cost= 150 (3*50)
        const totalCostForVideos = searchItems.length;

        console.log(`QUOTA: ${totalCostForVideos} QUOTA will be used`);
        // [DB]
        const apiUsageForVideos = await getAvailableApiKey(totalCostForVideos);
        // [DB]
        apiUsageForVideos?.id &&
          (await updateQuotaUsage(apiUsageForVideos.id, totalCostForVideos));
        // [API]
        await fetchAndSaveVideoDetails(videoIds, apiUsageForVideos?.api_key);
        fetchCount += searchItems.length;
        nextPageToken = newToken;
      } while (nextPageToken !== undefined && fetchCount < 500);
    })();
  });
}

async function fetchAndSaveVideoDetails(videoIds, apiKey: string | undefined) {
  if (!videoIds) {
    return;
  }
  // get video details from YT data API
  const channelVideoDetails = await videos(videoIds, apiKey);

  // Make videoBasicInfo list from response
  const videoBasicInfo = channelVideoDetails.map((item) => {
    return {
      channel_id: item.snippet.channelId,
      video_id: item.id,
      video_title: item.snippet.title,
      video_published_at: item.snippet.publishedAt,
      video_thumbnail_url: item.snippet.thumbnails.default.url,
      video_duration: item.contentDetails.duration,
      video_category_id: item.snippet.categoryId,
    };
  });
  // insert videoBasicInfo list to yt_video table
  await insertVideo(videoBasicInfo);

  // Make videoStatistics list from response
  const videoStatistics = channelVideoDetails.map((item) => {
    return {
      channel_id: item.snippet.channelId,
      video_id: item.id,
      total_views: item.statistics.viewCount ?? 0,
      total_likes: item.statistics.likeCount ?? 0,
      total_favorites: item.statistics.favoriteCount ?? 0,
      total_comments: item.statistics.commentCount ?? 0,
    };
  });
  // insert videoStatistics list to yt_video_statistics table
  await insertVideoStatistics(videoStatistics);
}

// Helper function: Split an array into multiple subarrays of the given size
function chunkArray<T>(array: T[], size: number): T[][] {
  return Array.from({ length: Math.ceil(array.length / size) }, (_, i) =>
    array.slice(i * size, i * size + size)
  );
}
