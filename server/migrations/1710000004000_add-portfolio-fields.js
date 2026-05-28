export const up = (pgm) => {
  pgm.addColumns("core_team_members", {
    github_username: { type: "text" },
    leetcode_username: { type: "text" },
    cached_github_stats: { type: "jsonb", default: "{}" },
    cached_leetcode_stats: { type: "jsonb", default: "{}" },
    last_synced_at: { type: "timestamptz" },
    sync_status: { type: "text", default: "pending" },
    sync_error_message: { type: "text" },
  });
};

export const down = (pgm) => {
  pgm.dropColumns("core_team_members", [
    "github_username",
    "leetcode_username",
    "cached_github_stats",
    "cached_leetcode_stats",
    "last_synced_at",
    "sync_status",
    "sync_error_message",
  ]);
};
