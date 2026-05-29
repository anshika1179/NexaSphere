import express from "express";
import { mentorshipRepository } from "../repositories/mentorshipRepository.js";
import { getIO } from "../config/socket.js";

const router = express.Router();

// Get all mentors
router.get("/mentors", async (req, res) => {
  try {
    const mentors = await mentorshipRepository.getMentors();
    res.json({ mentors });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Get all requests
router.get("/requests", async (req, res) => {
  try {
    const requests = await mentorshipRepository.getRequests();
    res.json({ requests });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Get a specific request
router.get("/requests/:id", async (req, res) => {
  try {
    const request = await mentorshipRepository.getRequestById(req.params.id);
    if (!request) return res.status(404).json({ error: "Request not found" });
    res.json({ request });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Create a review request
router.post("/requests", async (req, res) => {
  try {
    const request = await mentorshipRepository.createRequest(req.body);

    // Broadcast creation via socket to connected mentors
    try {
      const io = getIO();
      if (request.status === "matched") {
        io.emit("mentorship:match_found", request);
      } else {
        io.emit("mentorship:new_request", request);
      }
    } catch (err) {
      console.warn("Socket broadcast failed:", err.message);
    }

    res.status(201).json({ request });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Update request status (e.g. mentor accepts, or review completes)
router.patch("/requests/:id", async (req, res) => {
  try {
    const { status, reputationData } = req.body;
    const request = await mentorshipRepository.updateRequestStatus(
      req.params.id,
      status,
      reputationData
    );

    if (!request) {
      return res.status(404).json({ error: "Request not found" });
    }

    // Broadcast status change
    try {
      const io = getIO();
      io.emit("mentorship:status_changed", request);
      // Emit to specific review room if active
      if (status === "active" || status === "completed") {
        io.to(`review-${request.id}`).emit("review:status_sync", request);
      }
    } catch (err) {
      console.warn("Socket broadcast failed:", err.message);
    }

    res.json({ request });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
