// ==================== TYPE GUARDS ====================

import type { VideoInsightsParsed } from '../types/Report/FacebookTypes';

export const hasRetentionData = (video: VideoInsightsParsed): boolean =>
  Object.keys(video.retentionGraph).length > 0;

export const hasPlayData = (video: VideoInsightsParsed): boolean =>
  video.totalPlays !== null && video.reelsPlayCount !== null;

export const hasWatchTimeData = (video: VideoInsightsParsed): boolean =>
  video.avgTimeWatchedMs !== null && video.totalViewTimeMs !== null;

// ==================== HELPER FUNCTIONS ====================

export const computeTotalReactions = (video: VideoInsightsParsed): number =>
  Object.values(video.likesByReactionType).reduce(
    (sum, count) => sum + count,
    0,
  );

export const computeEngagementRate = (video: VideoInsightsParsed): number => {
  const plays = video.totalPlays;
  if (!plays || plays === 0) return 0;
  const reactions = computeTotalReactions(video);
  return ((reactions + video.comments + video.shares) / plays) * 100;
};

export const computeAvgWatchSeconds = (
  video: VideoInsightsParsed,
): number | null => {
  if (video.avgTimeWatchedMs === null) return null;
  return video.avgTimeWatchedMs / 1000;
};

export const computeWatchThroughRate = (
  video: VideoInsightsParsed,
): number | null => {
  const avgSec = computeAvgWatchSeconds(video);
  if (avgSec === null || video.lengthSeconds === 0) return null;
  return (avgSec / video.lengthSeconds) * 100;
};
