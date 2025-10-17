/**
 * Utility functions for YouTube URL handling
 */

/**
 * Converts a YouTube URL to an embeddable format
 * @param url - YouTube URL (e.g., https://www.youtube.com/watch?v=dQw4w9WgXcQ)
 * @returns Embeddable YouTube URL or null if invalid
 */
export function getYouTubeEmbedUrl(url: string): string | null {
  if (!url || typeof url !== 'string') return null;

  // Regular expressions for different YouTube URL formats
  const patterns = [
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/,
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]+)/,
    /(?:https?:\/\/)?youtu\.be\/([a-zA-Z0-9_-]+)/,
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/v\/([a-zA-Z0-9_-]+)/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return `https://www.youtube.com/embed/${match[1]}`;
    }
  }

  return null;
}

/**
 * Gets YouTube video ID from URL
 * @param url - YouTube URL
 * @returns Video ID or null if invalid
 */
export function getYouTubeVideoId(url: string): string | null {
  if (!url || typeof url !== 'string') return null;

  const patterns = [
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/,
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]+)/,
    /(?:https?:\/\/)?youtu\.be\/([a-zA-Z0-9_-]+)/,
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/v\/([a-zA-Z0-9_-]+)/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

/**
 * Gets YouTube video thumbnail URL
 * @param url - YouTube URL
 * @param quality - Thumbnail quality ('default', 'medium', 'high', 'standard', 'maxres')
 * @returns Thumbnail URL or null if invalid
 */
export function getYouTubeThumbnail(url: string, quality: 'default' | 'medium' | 'high' | 'standard' | 'maxres' = 'high'): string | null {
  const videoId = getYouTubeVideoId(url);
  if (!videoId) return null;

  const qualityMap = {
    'default': 'default',
    'medium': 'mqdefault',
    'high': 'hqdefault',
    'standard': 'sddefault',
    'maxres': 'maxresdefault'
  };

  return `https://img.youtube.com/vi/${videoId}/${qualityMap[quality]}.jpg`;
}

/**
 * Validates if a URL is a valid YouTube URL
 * @param url - URL to validate
 * @returns True if valid YouTube URL, false otherwise
 */
export function isValidYouTubeUrl(url: string): boolean {
  return getYouTubeVideoId(url) !== null;
}