import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Globe, CheckCircle } from 'lucide-react';
import { formatInTimeZone } from 'date-fns-tz';

const MeetingScheduler = ({ targetUser, onBook, availability = [] }) => {
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [bookingStatus, setBookingStatus] = useState('idle');

  const handleBooking = async () => {
    if (!selectedSlot) return;
    setBookingStatus('loading');
    try {
      await onBook(selectedSlot);
      setBookingStatus('success');
    } catch (err) {
      setBookingStatus('error');
    }
  };

  if (bookingStatus === 'success') {
    return (
      <div className="attendee-card text-center">
        <CheckCircle size={48} color="var(--color-success)" style={{ margin: '0 auto 1rem' }} />
        <h3>Meeting Requested!</h3>
        <p>A calendar invite has been sent to {targetUser.name}.</p>
        <button className="btn-primary" onClick={() => setBookingStatus('idle')}>
          Book Another
        </button>
      </div>
    );
  }

  return (
    <div className="attendee-card">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
        }}
      >
        <h3>Schedule 1-on-1 with {targetUser.name}</h3>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.8rem',
            opacity: 0.7,
          }}
        >
          <Globe size={14} />
          <span>{timezone}</span>
        </div>
      </div>

      <div
        className="directory-grid"
        style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '0.75rem' }}
      >
        {availability.map((slot) => (
          <button
            key={slot.time}
            disabled={!slot.available}
            className={`meeting-slot ${slot.available ? 'available' : 'booked'} ${selectedSlot === slot.time ? 'active' : ''}`}
            onClick={() => setSelectedSlot(slot.time)}
            style={{
              backgroundColor: selectedSlot === slot.time ? 'var(--primary-color)' : 'transparent',
              color: selectedSlot === slot.time ? 'white' : 'inherit',
            }}
          >
            <Clock size={12} style={{ marginBottom: '4px' }} />
            <div>{slot.displayTime}</div>
          </button>
        ))}
      </div>

      <div
        style={{
          marginTop: '2rem',
          borderTop: '1px solid var(--border-color)',
          paddingTop: '1.5rem',
        }}
      >
        <p style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>
          Meetings are 30 minutes long. Conflicts are automatically detected.
        </p>
        <button
          className="btn-primary"
          style={{ width: '100%' }}
          disabled={!selectedSlot || bookingStatus === 'loading'}
          onClick={handleBooking}
        >
          {bookingStatus === 'loading' ? 'Requesting...' : 'Confirm Meeting'}
        </button>
      </div>
    </div>
  );
};

export default MeetingScheduler;
