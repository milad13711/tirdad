// Normalizes any YouTube URL shape (watch?v=, youtu.be short links, an
// already-canonical /embed/ link, with or without extra query params like
// ?t=/&list=) into a playable iframe src. The naive `.replace("watch?v=",
// "embed/")` approach used before this only handled the watch?v= shape —
// a youtu.be/<id> link has no "watch?v=" substring, so it silently stayed
// unrewritten and rendered a blank iframe (youtu.be's redirect page blocks
// framing).
export function isYouTubeUrl(url: string): boolean {
  return /(?:youtube\.com|youtu\.be)/i.test(url);
}

export function toYouTubeEmbedUrl(url: string): string {
  const match =
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{6,})/i.exec(url);
  const videoId = match?.[1];
  return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
}
