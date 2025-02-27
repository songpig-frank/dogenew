import { supabase } from "./supabase";

/**
 * Rotates out old videos and keeps popular ones based on view count and engagement
 * @param maxVideos Maximum number of videos to keep
 * @param maxAgeDays Maximum age in days for videos to keep automatically
 * @param minViewCount Minimum view count for older videos to be kept
 */
export const rotateVideos = async (
  maxVideos: number = 20,
  maxAgeDays: number = 14,
  minViewCount: number = 10000,
): Promise<{ removed: number; kept: number }> => {
  try {
    // Calculate the cutoff date for automatic retention
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - maxAgeDays);
    const cutoffDateStr = cutoffDate.toISOString();

    // Get all videos
    const { data: allVideos, error: fetchError } = await supabase
      .from("featured_videos")
      .select("*")
      .order("created_at", { ascending: false });

    if (fetchError) throw fetchError;
    if (!allVideos || allVideos.length === 0) {
      return { removed: 0, kept: allVideos?.length || 0 };
    }

    // If we have fewer videos than the max, keep them all
    if (allVideos.length <= maxVideos) {
      return { removed: 0, kept: allVideos.length };
    }

    // Sort videos by criteria:
    // 1. Recent videos (within maxAgeDays) are kept
    // 2. Older videos with high view counts are kept
    // 3. Remaining videos are sorted by view count (highest first)

    // Parse view counts to numbers for sorting
    const processedVideos = allVideos.map((video) => ({
      ...video,
      numericViewCount: parseInt(video.view_count?.replace(/,/g, "") || "0"),
    }));

    // Separate videos into categories
    const recentVideos = processedVideos.filter(
      (video) => new Date(video.published_at) > new Date(cutoffDateStr),
    );

    const olderPopularVideos = processedVideos.filter(
      (video) =>
        new Date(video.published_at) <= new Date(cutoffDateStr) &&
        video.numericViewCount >= minViewCount,
    );

    const remainingVideos = processedVideos
      .filter(
        (video) =>
          new Date(video.published_at) <= new Date(cutoffDateStr) &&
          video.numericViewCount < minViewCount,
      )
      .sort((a, b) => b.numericViewCount - a.numericViewCount);

    // Combine videos in priority order
    let videosToKeep = [...recentVideos, ...olderPopularVideos];

    // If we still have room, add the most popular remaining videos
    if (videosToKeep.length < maxVideos) {
      const additionalCount = maxVideos - videosToKeep.length;
      videosToKeep = [
        ...videosToKeep,
        ...remainingVideos.slice(0, additionalCount),
      ];
    }

    // If we have more than maxVideos, trim the list
    if (videosToKeep.length > maxVideos) {
      videosToKeep = videosToKeep.slice(0, maxVideos);
    }

    // Get IDs of videos to keep
    const keepIds = videosToKeep.map((video) => video.video_id);

    // Delete videos not in the keep list
    const videosToDelete = allVideos.filter(
      (video) => !keepIds.includes(video.video_id),
    );

    if (videosToDelete.length > 0) {
      const deleteIds = videosToDelete.map((video) => video.video_id);

      // Log what we're deleting
      console.log(
        `Rotating out ${deleteIds.length} videos:`,
        videosToDelete.map((v) => ({
          id: v.video_id,
          title: v.title,
          views: v.view_count,
          published: v.published_at,
        })),
      );

      // Delete in batches to avoid API limits
      const batchSize = 10;
      for (let i = 0; i < deleteIds.length; i += batchSize) {
        const batch = deleteIds.slice(i, i + batchSize);
        const { error: deleteError } = await supabase
          .from("featured_videos")
          .delete()
          .in("video_id", batch);

        if (deleteError) {
          console.error(`Error deleting batch ${i}:`, deleteError);
        }
      }
    }

    return {
      removed: videosToDelete.length,
      kept: videosToKeep.length,
    };
  } catch (error) {
    console.error("Error rotating videos:", error);
    throw error;
  }
};

/**
 * Schedule automatic video rotation to run daily
 */
export const scheduleVideoRotation = () => {
  // Run once at startup
  rotateVideos()
    .then((result) => {
      console.log(
        `Video rotation complete: kept ${result.kept}, removed ${result.removed}`,
      );
    })
    .catch((err) => {
      console.error("Error in initial video rotation:", err);
    });

  // Then schedule to run daily at midnight
  const runRotation = () => {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);

    const timeUntilMidnight = midnight.getTime() - now.getTime();

    setTimeout(() => {
      rotateVideos()
        .then((result) => {
          console.log(
            `Video rotation complete: kept ${result.kept}, removed ${result.removed}`,
          );
        })
        .catch((err) => {
          console.error("Error in scheduled video rotation:", err);
        });

      // Schedule the next run
      runRotation();
    }, timeUntilMidnight);
  };

  runRotation();
};
