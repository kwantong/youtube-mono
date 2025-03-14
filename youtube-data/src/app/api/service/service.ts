import { channels, search, videos } from "../ytclient/client";
import {
  getAllChannelIds,
  getAllKeywords,
  insertChannel,
  insertChannelStatistics,
  insertKeywordsVideos,
  insertVideo,
  insertVideoStatistics,
} from "../dao/dao";

export async function fetchDataByChannel() {
  // get all channels from channel_setting table
  const allChannelId = await getAllChannelIds();
  console.log("channelIds length: " + allChannelId.length);

  if (!allChannelId || allChannelId.length === 0) {
    return;
  }

  const channelIds = allChannelId.join(",");

  // get all channel details from YT data API
  const channelDetails = await channels(channelIds);

  // Make channelBasicInfo list from response
  const channelBasicInfo = channelDetails?.map((item) => {
    return {
      channel_id: item.id,
      channel_name: item.snippet.title,
      channel_created_at: item.snippet.publishedAt,
      channel_description: item.snippet.description,
      channel_thumbnail_url: item.snippet.thumbnails.default.url,
    };
  });
  // insert channelBasicInfo list to yt_channel table
  await insertChannel(channelBasicInfo);

  // Make channelStatistics list from response
  const channelStatistics = channelDetails?.map((item) => {
    return {
      channel_id: item.id,
      subscriber_count: item.statistics.subscriberCount ?? 0,
      view_count: item.statistics.viewCount ?? 0,
      video_count: item.statistics.videoCount ?? 0,
    };
  });
  // insert channelStatistics list to yt_channel_statistics table
  await insertChannelStatistics(channelStatistics);

  allChannelId.forEach((channelId) => {
    (async () => {
      console.log("channelId: " + channelId);

      let nextPageToken: string | undefined = undefined;
      do {
        // search channel information and videos by channelId
        const { searchItems, nextPageToken: newToken } = await search(
          nextPageToken,
          channelId,
          undefined
        );
        const videoIds = searchItems
          .map((item: any) => item.id.videoId)
          .join(",");
        await fetchAndSaveVideoDetails(videoIds);
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

  allKeywords.forEach((item) => {
    (async () => {
      let nextPageToken: string | undefined = undefined;
      let fetchCount = 0;
      do {
        const { searchItems, nextPageToken: newToken } = await search(
          nextPageToken,
          undefined,
          item.keyword
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

        await fetchAndSaveVideoDetails(videoIds);
        fetchCount += searchItems.length;
        nextPageToken = newToken;
      } while (nextPageToken !== undefined && fetchCount < 500);
    })();
  });
}

async function fetchAndSaveVideoDetails(videoIds) {
  if (!videoIds) {
    return;
  }
  // get video details from YT data API
  const channelVideoDetails = await videos(videoIds);

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
