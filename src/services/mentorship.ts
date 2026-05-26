import { getApiBase } from "../utils/runtimeConfig";

export interface Mentor {
  id: string;
  userId: string;
  name: string;
  domains: string[];
  isActive: boolean;
  rating: number;
  reviewsCompleted: number;
}

export interface ReviewRequest {
  id: string;
  title: string;
  description: string;
  codeSnippet: string;
  domains: string[];
  urgency: string;
  status: "pending" | "matched" | "active" | "completed";
  authorId: string;
  authorName: string;
  mentorId: string | null;
  mentorName?: string;
  createdAt: string;
  updatedAt: string;
}

export const mentorshipService = {
  async getMentors(): Promise<Mentor[]> {
    const res = await fetch(`${getApiBase()}/mentorship/mentors`);
    if (!res.ok) throw new Error("Failed to fetch mentors");
    const data = await res.json();
    return data.mentors;
  },

  async getRequests(): Promise<ReviewRequest[]> {
    const res = await fetch(`${getApiBase()}/mentorship/requests`);
    if (!res.ok) throw new Error("Failed to fetch requests");
    const data = await res.json();
    return data.requests;
  },

  async getRequestById(id: string): Promise<ReviewRequest> {
    const res = await fetch(`${getApiBase()}/mentorship/requests/${id}`);
    if (!res.ok) throw new Error("Failed to fetch request");
    const data = await res.json();
    return data.request;
  },

  async createRequest(payload: Partial<ReviewRequest>): Promise<ReviewRequest> {
    const res = await fetch(`${getApiBase()}/mentorship/requests`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Failed to create request");
    const data = await res.json();
    return data.request;
  },

  async updateRequestStatus(
    id: string,
    status: string,
    reputationData?: { rating: number }
  ): Promise<ReviewRequest> {
    const res = await fetch(`${getApiBase()}/mentorship/requests/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, reputationData }),
    });
    if (!res.ok) throw new Error("Failed to update request");
    const data = await res.json();
    return data.request;
  },
};
