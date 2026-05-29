import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";
import { Mutex } from "async-mutex";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, "../data/mentorship.json");

const fileMutex = new Mutex();

const defaultData = {
  mentors: [
    {
      id: "mentor-1",
      userId: "user_456",
      name: "TechNinja",
      domains: ["AI", "Web"],
      isActive: true,
      rating: 4.8,
      reviewsCompleted: 12,
    },
  ],
  requests: [],
};

async function ensureFile() {
  const dir = path.dirname(DATA_FILE);
  await fs.mkdir(dir, { recursive: true });
  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.writeFile(DATA_FILE, JSON.stringify(defaultData, null, 2), "utf8");
  }
}

async function readData() {
  await ensureFile();
  const raw = await fs.readFile(DATA_FILE, "utf8");
  return JSON.parse(raw);
}

async function writeData(content) {
  await ensureFile();
  await fs.writeFile(DATA_FILE, JSON.stringify(content, null, 2), "utf8");
}

export const mentorshipRepository = {
  async getMentors() {
    return fileMutex.runExclusive(async () => {
      const data = await readData();
      return data.mentors;
    });
  },

  async getRequests() {
    return fileMutex.runExclusive(async () => {
      const data = await readData();
      return data.requests;
    });
  },

  async getRequestById(id) {
    return fileMutex.runExclusive(async () => {
      const data = await readData();
      return data.requests.find((r) => r.id === id) || null;
    });
  },

  async createRequest(payload) {
    return fileMutex.runExclusive(async () => {
      const data = await readData();

      const request = {
        id: crypto.randomUUID(),
        title: payload.title || "Untitled Request",
        description: payload.description || "",
        codeSnippet: payload.codeSnippet || "",
        domains: payload.domains || [],
        urgency: payload.urgency || "normal",
        status: "pending", // pending, matched, active, completed
        authorId: payload.authorId || "anonymous",
        authorName: payload.authorName || "Anonymous User",
        mentorId: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Match algorithm
      const activeMentors = data.mentors.filter((m) => m.isActive);
      let bestMatch = null;
      let highestScore = -1;

      for (const mentor of activeMentors) {
        let score = 0;
        const overlap = mentor.domains.filter((d) =>
          request.domains.includes(d)
        ).length;
        if (overlap > 0) score += 50 + overlap * 10;
        score += mentor.rating * 4;

        if (score > highestScore) {
          highestScore = score;
          bestMatch = mentor;
        }
      }

      if (bestMatch && highestScore > 0) {
        request.status = "matched";
        request.mentorId = bestMatch.id;
        request.mentorName = bestMatch.name;
      }

      data.requests.unshift(request);
      await writeData(data);
      return request;
    });
  },

  async updateRequestStatus(id, status, reputationData = null) {
    return fileMutex.runExclusive(async () => {
      const data = await readData();
      const req = data.requests.find((r) => r.id === id);
      if (!req) return null;

      req.status = status;
      req.updatedAt = new Date().toISOString();

      if (status === "completed" && reputationData && req.mentorId) {
        const mentor = data.mentors.find((m) => m.id === req.mentorId);
        if (mentor) {
          mentor.reviewsCompleted += 1;
          if (reputationData.rating) {
            mentor.rating =
              (mentor.rating * (mentor.reviewsCompleted - 1) +
                reputationData.rating) /
              mentor.reviewsCompleted;
          }
        }
      }

      await writeData(data);
      return req;
    });
  },
};
