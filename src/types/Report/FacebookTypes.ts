// types/facebook.types.ts

// ==================== REACTION TYPES ====================

export type ReactionType =
  | "REACTION_LIKE"
  | "REACTION_LOVE"
  | "REACTION_HAHA"
  | "REACTION_WOW"
  | "REACTION_SORRY"
  | "REACTION_ANGRY";

// Map reaction -> count, có thể là {} (empty)
export type ReactionMap = Partial<Record<ReactionType, number>>;

// ==================== RETENTION GRAPH ====================

// Key là giây dưới dạng string "0", "1", ..., "40"
// Value là tỉ lệ 0.0 - 1.0, có thể là {} (empty khi video không đủ data)
export type RetentionGraph = Record<string, number>;

// ==================== MAIN INTERFACE ====================

export interface VideoInsightsParsed {
  videoId: string;
  description: string | null; // null khi FB không trả về (vd: video 1087310542904018)
  lengthSeconds: number;
  views: number; // = fb_reels_total_plays (hoặc raw views nếu null)

  // Reactions - {} khi không có ai react
  likesByReactionType: ReactionMap;

  // Watch time metrics - null khi FB không cung cấp (vd: video 9871382042916290)
  avgTimeWatchedMs: number | null;
  totalViewTimeMs: number | null;

  // Social actions
  shares: number; // 0 khi không có
  comments: number; // 0 khi không có

  // Reach & plays
  uniqueReach: number;
  reelsPlayCount: number | null; // null với một số video cũ (vd: 747104874840441)
  totalPlays: number | null; // null với một số video cũ
  replayCount: number | null; // null với một số video cũ

  // Retention graph - {} khi không có data
  retentionGraph: RetentionGraph;

  // Followers gained - có thể âm (vd: -1 ở video 703176028978506)
  newFollowers: number;
}

// ==================== API RESPONSE ====================

export interface FacebookVideosResponse {
  data: VideoInsightsParsed[];
}

// ==================== COMPUTED / DISPLAY ====================

// Dùng khi đã tính toán thêm các chỉ số dẫn xuất ở frontend
export interface VideoInsightsWithMetrics extends VideoInsightsParsed {
  totalReactions: number;            // sum of likesByReactionType values
  engagementRate: number;            // (reactions + comments + shares) / totalPlays * 100
  avgWatchTimeSeconds: number | null;// avgTimeWatchedMs / 1000
  watchThroughRate: number | null;   // avgWatchTimeSeconds / lengthSeconds * 100
}

// Dùng cho bảng tổng quan (chỉ cần các field chính)
export type VideoInsightsSummary = Pick<
  VideoInsightsParsed,
  | 'videoId'
  | 'description'
  | 'lengthSeconds'
  | 'views'
  | 'uniqueReach'
  | 'replayCount'
  | 'newFollowers'
  | 'shares'
  | 'comments'
>;
