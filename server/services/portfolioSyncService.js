// Node 20 has native fetch
import { listCoreTeamStore } from "../index.js"; // Need to export these or query DB directly

export async function fetchGithubStats(username) {
  if (!username) return null;
  try {
    const res = await fetch(`https://api.github.com/users/${username}`);
    if (!res.ok) return null;
    const data = await res.json();

    // We can also fetch languages or contribution graph here if needed,
    // but the basic user profile has public_repos, followers, etc.
    return {
      publicRepos: data.public_repos,
      followers: data.followers,
      following: data.following,
      avatarUrl: data.avatar_url,
      company: data.company,
      location: data.location,
      createdAt: data.created_at,
    };
  } catch (error) {
    console.error(`Failed to fetch github stats for ${username}`, error);
    return null;
  }
}

export async function fetchLeetcodeStats(username) {
  if (!username) return null;
  try {
    // Using a public proxy for leetcode stats
    const res = await fetch(
      `https://leetcode-stats-api.herokuapp.com/${username}`
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (data.status !== "success") return null;

    return {
      totalSolved: data.totalSolved,
      easySolved: data.easySolved,
      mediumSolved: data.mediumSolved,
      hardSolved: data.hardSolved,
      ranking: data.ranking,
      contributionPoints: data.contributionPoints,
      reputation: data.reputation,
    };
  } catch (error) {
    console.error(`Failed to fetch leetcode stats for ${username}`, error);
    return null;
  }
}

export async function syncAllPortfolios() {
  const { updateCoreTeamStore } = await import("../index.js");
  const members = await listCoreTeamStore();

  for (const member of members) {
    let githubStats = member.cachedGithubStats || {};
    let leetcodeStats = member.cachedLeetcodeStats || {};
    let hasUpdates = false;
    let syncError = null;

    if (member.githubUsername) {
      const stats = await fetchGithubStats(member.githubUsername);
      if (stats) {
        githubStats = stats;
        hasUpdates = true;
      } else {
        syncError = "Failed to fetch GitHub stats";
      }
    }

    if (member.leetcodeUsername) {
      const stats = await fetchLeetcodeStats(member.leetcodeUsername);
      if (stats) {
        leetcodeStats = stats;
        hasUpdates = true;
      } else {
        syncError = syncError
          ? syncError + "; Failed to fetch LeetCode stats"
          : "Failed to fetch LeetCode stats";
      }
    }

    if (hasUpdates || syncError) {
      const patch = {
        cachedGithubStats: githubStats,
        cachedLeetcodeStats: leetcodeStats,
        lastSyncedAt: new Date().toISOString(),
        syncStatus: syncError ? "error" : "success",
        syncErrorMessage: syncError || null,
      };

      try {
        await updateCoreTeamStore(member.id, patch);
      } catch (err) {
        console.error(`Failed to update stats for member ${member.id}`, err);
      }
    }
  }
}
