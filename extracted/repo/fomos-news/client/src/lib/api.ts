import type { BriefingItem, DailyBriefing, NewsItem } from "@/lib/sampleData";

type ApiErrorEnvelope = {
  error?: {
    message?: string;
  };
};

type NewsListResponse = {
  items: Array<{
    id: string;
    title: string;
    summary: string;
    category: string;
    source: string;
    sourceUrl: string;
    date: string;
    stars: number;
    tags: string[];
    isHot: boolean;
  }>;
};

type LatestBriefingResponse = {
  id: string;
  briefingDate: string;
  date: string;
  analysis: DailyBriefing["analysis"];
  sections: Array<{
    title: string;
    emoji: string;
    items: Array<BriefingItem & { sourceUrl?: string | null }>;
  }>;
};

type SubscribeResponse = {
  status: string;
  message: string;
  email: string;
  alreadySubscribed: boolean;
};

async function requestJson<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const response = await fetch(input, {
    ...init,
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  const payload = (await response.json().catch(() => null)) as T | ApiErrorEnvelope | null;

  if (!response.ok) {
    const message =
      (payload as ApiErrorEnvelope | null)?.error?.message ||
      `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return payload as T;
}

function clampStars(stars: number) {
  return Math.max(0, Math.min(5, Math.round(stars)));
}

export async function fetchNews() {
  const payload = await requestJson<NewsListResponse>("/api/news");
  return payload.items.map(
    (item): NewsItem => ({
      ...item,
      sourceUrl: item.sourceUrl || "#",
      stars: clampStars(item.stars),
      tags: item.tags ?? [],
      isHot: Boolean(item.isHot),
    }),
  );
}

export async function fetchLatestBriefing() {
  const payload = await requestJson<LatestBriefingResponse>("/api/briefings/latest");
  return {
    ...payload,
    sections: payload.sections.map((section) => ({
      ...section,
      items: section.items.map((item) => ({
        ...item,
        stars: clampStars(item.stars),
      })),
    })),
  };
}

export async function subscribeEmail(email: string) {
  return requestJson<SubscribeResponse>("/api/subscribe", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}
