export type MarketReport = {
  id: string;
  created_at: string;
  title: string;
  summary: string;
  bias: "Bullish" | "Bearish" | "Neutral" | "Slightly Bullish" | "Slightly Bearish";
  symbol: string;
  tags: string[];
};

async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(typeof payload?.error === "string" ? payload.error : "Request failed");
  }

  return payload as T;
}

export const ReportService = {
  async getLatestReports() {
    try {
      const data = await requestJson<{ reports: MarketReport[] }>("/api/data/reports");
      return data.reports;
    } catch (error) {
      if (!(error instanceof Error && /Database is not configured/i.test(error.message))) {
        console.error("Error fetching reports:", error);
      }
      return [];
    }
  },

  async createReport(report: Omit<MarketReport, "id" | "created_at">) {
    const data = await requestJson<{ report: MarketReport }>("/api/data/reports", {
      method: "POST",
      body: JSON.stringify(report),
    });
    return data.report;
  },
};
