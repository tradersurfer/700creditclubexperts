/**
 * Credit Repair Cloud (CRC) API Integration
 * Docs: https://developers.creditrepaircloud.com/
 * All calls are server-side only — API key never exposed to client
 */

const CRC_BASE = process.env.CRC_API_BASE_URL || "https://api.creditrepaircloud.com/v2";
const CRC_API_KEY = process.env.CRC_API_KEY || "";

interface CRCRequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: Record<string, unknown>;
  params?: Record<string, string>;
}

async function crcRequest<T>(endpoint: string, options: CRCRequestOptions = {}): Promise<T> {
  const { method = "GET", body, params } = options;

  let url = `${CRC_BASE}${endpoint}`;
  if (params) {
    const qs = new URLSearchParams(params).toString();
    url += `?${qs}`;
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${CRC_API_KEY}`,
    "Accept": "application/json",
  };

  const fetchOptions: RequestInit = { method, headers };
  if (body) fetchOptions.body = JSON.stringify(body);

  const res = await fetch(url, fetchOptions);

  if (!res.ok) {
    const errorText = await res.text().catch(() => "Unknown error");
    throw new Error(`CRC API Error ${res.status}: ${errorText}`);
  }

  return res.json() as Promise<T>;
}

// ─── CRC Data Types ───────────────────────────────────────────────────────────

export interface CRCClient {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  status: string;
  created_at: string;
  score_transunion?: number;
  score_equifax?: number;
  score_experian?: number;
}

export interface CRCDisputeItem {
  id: string;
  client_id: string;
  creditor_name: string;
  account_number: string;
  bureau: "transunion" | "equifax" | "experian" | "all";
  dispute_reason: string;
  status: "queued" | "sent" | "in_progress" | "deleted" | "verified" | "updated" | "no_response";
  amount?: number;
  created_at: string;
  updated_at: string;
  round_number: number;
  letter_sent_at?: string;
  response_received_at?: string;
  result?: string;
}

export interface CRCScoreHistory {
  id: string;
  client_id: string;
  bureau: "transunion" | "equifax" | "experian";
  score: number;
  recorded_at: string;
}

export interface CRCRound {
  id: string;
  client_id: string;
  round_number: number;
  status: "pending" | "active" | "completed";
  started_at: string;
  completed_at?: string;
  items_count: number;
  deletions_count: number;
}

export interface CRCAffiliateStats {
  affiliate_id: string;
  total_referrals: number;
  active_clients: number;
  completed_clients: number;
  total_revenue: number;
  pending_commission: number;
  paid_commission: number;
}

// ─── Client Endpoints ─────────────────────────────────────────────────────────

export async function getCRCClient(crcClientId: string): Promise<CRCClient | null> {
  try {
    return await crcRequest<CRCClient>(`/clients/${crcClientId}`);
  } catch {
    return null;
  }
}

export async function getCRCClientDisputes(crcClientId: string): Promise<CRCDisputeItem[]> {
  try {
    const res = await crcRequest<{ data: CRCDisputeItem[] }>(`/clients/${crcClientId}/dispute-items`);
    return res.data || [];
  } catch {
    return [];
  }
}

export async function getCRCClientScoreHistory(crcClientId: string): Promise<CRCScoreHistory[]> {
  try {
    const res = await crcRequest<{ data: CRCScoreHistory[] }>(`/clients/${crcClientId}/score-history`);
    return res.data || [];
  } catch {
    return [];
  }
}

export async function getCRCClientRounds(crcClientId: string): Promise<CRCRound[]> {
  try {
    const res = await crcRequest<{ data: CRCRound[] }>(`/clients/${crcClientId}/rounds`);
    return res.data || [];
  } catch {
    return [];
  }
}

export async function getCRCClientDashboard(crcClientId: string) {
  const [client, disputes, scoreHistory, rounds] = await Promise.all([
    getCRCClient(crcClientId),
    getCRCClientDisputes(crcClientId),
    getCRCClientScoreHistory(crcClientId),
    getCRCClientRounds(crcClientId),
  ]);

  const deletions = disputes.filter((d) => d.status === "deleted");
  const activeDisputes = disputes.filter((d) => ["queued", "sent", "in_progress"].includes(d.status));
  const totalAmount = deletions.reduce((sum, d) => sum + (d.amount || 0), 0);

  // Score trajectory — latest per bureau
  const bureaus = ["transunion", "equifax", "experian"] as const;
  const latestScores: Record<string, number | null> = {};
  const scoreChart: { date: string; tu: number | null; eq: number | null; ex: number | null }[] = [];

  for (const bureau of bureaus) {
    const history = scoreHistory
      .filter((h) => h.bureau === bureau)
      .sort((a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime());
    latestScores[bureau] = history.length ? history[history.length - 1].score : null;
  }

  // Build unified chart data
  const allDates = [...new Set(scoreHistory.map((h) => h.recorded_at.split("T")[0]))].sort();
  for (const date of allDates) {
    const dayData = scoreHistory.filter((h) => h.recorded_at.startsWith(date));
    scoreChart.push({
      date,
      tu: dayData.find((h) => h.bureau === "transunion")?.score ?? null,
      eq: dayData.find((h) => h.bureau === "equifax")?.score ?? null,
      ex: dayData.find((h) => h.bureau === "experian")?.score ?? null,
    });
  }

  const currentScore = client
    ? Math.round(
        [client.score_transunion, client.score_equifax, client.score_experian]
          .filter(Boolean)
          .reduce((a, b) => a! + b!, 0)! /
          [client.score_transunion, client.score_equifax, client.score_experian].filter(Boolean).length
      )
    : null;

  return {
    client,
    currentScore,
    scores: {
      transunion: client?.score_transunion ?? latestScores["transunion"],
      equifax: client?.score_equifax ?? latestScores["equifax"],
      experian: client?.score_experian ?? latestScores["experian"],
    },
    scoreChart,
    disputes,
    activeDisputes,
    deletions,
    totalAmountDeleted: totalAmount,
    rounds,
    currentRound: rounds.find((r) => r.status === "active") ?? rounds[rounds.length - 1] ?? null,
    stats: {
      totalDisputes: disputes.length,
      deletionCount: deletions.length,
      activeCount: activeDisputes.length,
      successRate: disputes.length > 0 ? Math.round((deletions.length / disputes.length) * 100) : 0,
    },
  };
}

// ─── Affiliate Endpoints ──────────────────────────────────────────────────────

export async function getCRCAffiliateStats(crcAffiliateId: string): Promise<CRCAffiliateStats | null> {
  try {
    return await crcRequest<CRCAffiliateStats>(`/affiliates/${crcAffiliateId}/stats`);
  } catch {
    return null;
  }
}

export async function getCRCAffiliateReferrals(crcAffiliateId: string) {
  try {
    const res = await crcRequest<{ data: any[] }>(`/affiliates/${crcAffiliateId}/referrals`);
    return res.data || [];
  } catch {
    return [];
  }
}

// ─── Mock Data (used when CRC not connected or in dev) ────────────────────────
export function getMockClientDashboard(clientName = "Member") {
  const name = clientName.split(" ");
  return {
    client: {
      id: "mock-001",
      first_name: name[0] || "Member",
      last_name: name[1] || "",
      email: "",
      phone: "",
      status: "active",
      created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      score_transunion: 672,
      score_equifax: 685,
      score_experian: 668,
    },
    currentScore: 675,
    scores: { transunion: 672, equifax: 685, experian: 668 },
    scoreChart: [
      { date: "2024-10-01", tu: 588, eq: 601, ex: 592 },
      { date: "2024-11-01", tu: 612, eq: 625, ex: 608 },
      { date: "2024-12-01", tu: 634, eq: 648, ex: 628 },
      { date: "2025-01-01", tu: 652, eq: 669, ex: 645 },
      { date: "2025-02-01", tu: 672, eq: 685, ex: 668 },
    ],
    disputes: [
      { id: "d1", client_id: "mock-001", creditor_name: "Midland Funding", account_number: "****4521", bureau: "transunion", dispute_reason: "Not mine / Identity Theft", status: "deleted", amount: 4200, created_at: "2024-10-15T00:00:00Z", updated_at: "2024-11-20T00:00:00Z", round_number: 1 },
      { id: "d2", client_id: "mock-001", creditor_name: "LVNV Funding", account_number: "****7832", bureau: "equifax", dispute_reason: "Balance incorrect", status: "deleted", amount: 12000, created_at: "2024-10-15T00:00:00Z", updated_at: "2024-12-10T00:00:00Z", round_number: 2 },
      { id: "d3", client_id: "mock-001", creditor_name: "Convergent Outsourcing", account_number: "****1109", bureau: "experian", dispute_reason: "Statute of limitations expired", status: "in_progress", amount: 3100, created_at: "2025-01-05T00:00:00Z", updated_at: "2025-01-20T00:00:00Z", round_number: 3 },
      { id: "d4", client_id: "mock-001", creditor_name: "Capital One", account_number: "****0042", bureau: "all", dispute_reason: "Late payment — paid on time per bank records", status: "queued", amount: 0, created_at: "2025-02-01T00:00:00Z", updated_at: "2025-02-01T00:00:00Z", round_number: 3 },
    ],
    activeDisputes: [
      { id: "d3", status: "in_progress" },
      { id: "d4", status: "queued" },
    ],
    deletions: [
      { id: "d1", amount: 4200 },
      { id: "d2", amount: 12000 },
    ],
    totalAmountDeleted: 16200,
    rounds: [
      { id: "r1", client_id: "mock-001", round_number: 1, status: "completed", started_at: "2024-10-15T00:00:00Z", completed_at: "2024-11-20T00:00:00Z", items_count: 5, deletions_count: 4 },
      { id: "r2", client_id: "mock-001", round_number: 2, status: "completed", started_at: "2024-11-25T00:00:00Z", completed_at: "2024-12-20T00:00:00Z", items_count: 4, deletions_count: 3 },
      { id: "r3", client_id: "mock-001", round_number: 3, status: "active", started_at: "2025-01-05T00:00:00Z", items_count: 2, deletions_count: 0 },
    ],
    currentRound: { id: "r3", round_number: 3, status: "active", items_count: 2, deletions_count: 0 },
    stats: { totalDisputes: 4, deletionCount: 2, activeCount: 2, successRate: 67 },
  };
}

export function getMockAffiliateData(affiliateName = "Partner") {
  return {
    stats: {
      totalReferrals: 23,
      activeClients: 18,
      completedClients: 5,
      pendingReferrals: 7,
      totalRevenue: 11495,
      pendingCommission: 920,
      paidCommission: 2299,
      conversionRate: 78,
    },
    recentReferrals: [
      { id: "ref-001", name: "Marcus J.", email: "m***@gmail.com", status: "active", program: "Full Sweep", enrolledAt: "2025-02-10", commission: 99.80 },
      { id: "ref-002", name: "Tamika R.", email: "t***@gmail.com", status: "active", program: "Full Sweep + Builder", enrolledAt: "2025-02-08", commission: 149.80 },
      { id: "ref-003", name: "Darnell W.", email: "d***@gmail.com", status: "active", program: "Partial Sweep", enrolledAt: "2025-02-05", commission: 39.80 },
      { id: "ref-004", name: "Shanel M.", email: "s***@gmail.com", status: "pending", program: "—", enrolledAt: "2025-02-14", commission: 0 },
      { id: "ref-005", name: "Chris T.", email: "c***@gmail.com", status: "completed", program: "Full Sweep", enrolledAt: "2024-12-01", commission: 99.80 },
    ],
    commissionHistory: [
      { month: "Oct 2024", amount: 399 },
      { month: "Nov 2024", amount: 548 },
      { month: "Dec 2024", amount: 699 },
      { month: "Jan 2025", amount: 849 },
      { month: "Feb 2025", amount: 920 },
    ],
    leaderboard: [
      { rank: 1, name: "Top Affiliate", referrals: 41, earned: 4099 },
      { rank: 2, name: affiliateName, referrals: 23, earned: 2299 },
      { rank: 3, name: "Partner C", referrals: 19, earned: 1899 },
      { rank: 4, name: "Partner D", referrals: 14, earned: 1399 },
      { rank: 5, name: "Partner E", referrals: 11, earned: 1099 },
    ],
  };
}
