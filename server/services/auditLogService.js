import { withDb } from '../repositories/db.js';
import logger from '../utils/logger.js';

export const auditLogService = {
  async initAuditTable() {
    try {
      await withDb(async (client) => {
        await client.query(`
          CREATE TABLE IF NOT EXISTS audit_logs (
            id SERIAL PRIMARY KEY,
            admin_username VARCHAR(255) NOT NULL,
            action VARCHAR(255) NOT NULL,
            ip_address VARCHAR(45) NOT NULL,
            old_state JSONB,
            new_state JSONB,
            timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          );
        `);
      });
      logger.info('Audit logs table initialized');
    } catch (err) {
      logger.error('Failed to initialize audit logs table', { error: err.message });
    }
  },

  async logAdminAction({ adminUsername, action, ipAddress, oldState, newState }) {
    try {
      await withDb(async (client) => {
        await client.query(
          `INSERT INTO audit_logs (admin_username, action, ip_address, old_state, new_state)
           VALUES ($1, $2, $3, $4, $5)`,
          [adminUsername, action, ipAddress, oldState ? JSON.stringify(oldState) : null, newState ? JSON.stringify(newState) : null]
        );
      });
      logger.info('Audit log created', { adminUsername, action });
    } catch (err) {
      logger.error('Failed to create audit log', { error: err.message, adminUsername, action });
    }
  }
};

export default auditLogService;
