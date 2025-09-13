export interface WebMention {
  "wm-id": number;
  "wm-property": "like-of" | "repost-of" | "mention-of" | "in-reply-to" | "bookmark-of";
  "wm-source": string;
  "wm-target": string;
  "wm-received": string;
  "wm-verified": boolean;
  url: string;
  published?: string;
  name?: string;
  content?: {
    text?: string;
    html?: string;
  };
  author: {
    name?: string;
    photo?: string;
    url?: string;
  };
  "in-reply-to"?: string;
  "like-of"?: string;
  "bookmark-of"?: string;
  "mention-of"?: string;
}

export interface WebMentionCache {
  children: WebMention[];
}