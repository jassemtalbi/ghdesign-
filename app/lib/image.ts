// Only Unsplash goes through the Next/Vercel image optimizer.
// Uploaded images (/api/upload/[id], data: URLs, other hosts) are served as-is:
// the optimizer can't fetch them reliably on Vercel (deployment protection,
// Hobby transformation quota) and they're already resized at upload time.
export const skipOptimizer = (src?: string) =>
  !src || !src.startsWith('https://images.unsplash.com/');
