import React, { useState, useMemo } from 'react';
import { Search, Filter, UserPlus, Users } from 'lucide-react';

const AttendeeDirectory = ({ attendees, currentUserId, onConnect, hasConsent, onGiveConsent }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSkill, setFilterSkill] = useState('All');

  const filteredAttendees = useMemo(() => {
    return attendees.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.company?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSkill =
        filterSkill === 'All' ||
        user.skills?.some((s) => s.toLowerCase() === filterSkill.toLowerCase());
      return matchesSearch && matchesSkill && user.id !== currentUserId;
    });
  }, [attendees, searchTerm, filterSkill, currentUserId]);

  const uniqueSkills = useMemo(() => {
    const skills = new Set();
    attendees.forEach((a) => a.skills?.forEach((s) => skills.add(s)));
    return Array.from(skills).sort();
  }, [attendees]);

  if (!hasConsent) {
    return (
      <div className="attendee-card" style={{ position: 'relative', minHeight: '300px' }}>
        <div className="consent-lock">
          <div>
            <h3>Join the Networking Hub</h3>
            <p>To see other attendees and be discoverable, please opt-in to networking.</p>
            <button className="btn-primary" onClick={onGiveConsent}>
              Enable My Networking Profile
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="directory-wrapper">
      <div
        className="search-controls"
        style={{ marginBottom: '2rem', display: 'flex', gap: '1rem' }}
      >
        <div className="input-group">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search by name or company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          onChange={(e) => setFilterSkill(e.target.value)}
          className="skill-filter"
          style={{
            background: 'var(--glass-bg)',
            color: 'white',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            padding: '0 1rem',
          }}
        >
          <option value="All">All Skills</option>
          {uniqueSkills.map((skill) => (
            <option key={skill} value={skill}>
              {skill}
            </option>
          ))}
        </select>
      </div>

      <div className="directory-grid">
        {filteredAttendees.map((attendee) => (
          <div key={attendee.id} className="attendee-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
              <div>
                <h4 style={{ margin: 0 }}>{attendee.name}</h4>
                <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                  {attendee.role} @ {attendee.company || 'Student'}
                </span>
              </div>
              <img
                src={attendee.avatar || '/default-avatar.png'}
                alt={attendee.name}
                style={{ width: 40, height: 40, borderRadius: '50%' }}
              />
            </div>

            <div
              className="mutuals"
              style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <Users size={14} color="#3b82f6" />
              <span style={{ fontSize: '0.75rem' }}>{attendee.mutualCount} mutual connections</span>
            </div>

            <div
              className="skills-tags"
              style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', flexWrap: 'wrap' }}
            >
              {attendee.skills?.slice(0, 3).map((skill) => (
                <span key={skill} className="tag-small">
                  {skill}
                </span>
              ))}
            </div>

            <button
              className="btn-outline-small"
              style={{ marginTop: '1.5rem', width: '100%' }}
              onClick={() => onConnect(attendee.id)}
            >
              <UserPlus size={16} />
              Add Connection
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AttendeeDirectory;
