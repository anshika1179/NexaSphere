import { withDb } from './db.js';

export async function createConnection(requesterId, targetId) {
  return withDb(async (client) => {
    const { rows } = await client.query(
      `INSERT INTO networking_connections (requester_id, target_id, status)
       VALUES ($1, $2, 'pending')
       ON CONFLICT (requester_id, target_id) DO NOTHING
       RETURNING *`,
      [requesterId, targetId]
    );
    return rows[0];
  });
}

export async function getMeetingsForUser(userId, date) {
  return withDb(async (client) => {
    const { rows } = await client.query(
      `SELECT * FROM event_meetings 
       WHERE (host_id = $1 OR attendee_id = $1) 
       AND meeting_date = $2`,
      [userId, date]
    );
    return rows;
  });
}

export async function checkConflict(hostId, attendeeId, date, time) {
  return withDb(async (client) => {
    const { rows } = await client.query(
      `SELECT id FROM event_meetings 
       WHERE meeting_date = $1 AND start_time = $2
       AND (host_id IN ($3, $4) OR attendee_id IN ($3, $4))`,
      [date, time, hostId, attendeeId]
    );
    return rows.length > 0;
  });
}

export async function updateConsent(userId, hasConsent) {
  return withDb(async (client) => {
    await client.query(
      'UPDATE portfolios SET networking_consent = $2, networking_opted_at = NOW() WHERE username = $1',
      [userId, hasConsent]
    );
  });
}

export async function getMutualConnections(userA, userB) {
  return withDb(async (client) => {
    const { rows } = await client.query(
      `SELECT COUNT(*) as count FROM networking_connections a
       JOIN networking_connections b ON a.target_id = b.target_id
       WHERE a.requester_id = $1 AND b.requester_id = $2 AND a.status = 'accepted' AND b.status = 'accepted'`,
      [userA, userB]
    );
    return parseInt(rows[0].count);
  });
}
