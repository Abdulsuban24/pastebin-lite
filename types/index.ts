// types/index.ts
export interface Paste {
  content: string;
  ttl_seconds?: number;
  max_views?: number;
  created_at: number; // ms since epoch
  views: number;
}