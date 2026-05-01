import { useEffect, useState } from 'react';
import { BannerOrbs } from '../../shared/MotionLayer';
import { Skeleton } from '../../shared/Skeleton';

const API_BASE = (import.meta.env?.VITE_API_BASE || '').replace(/\/+$/, '');
const api = (path) => (API_BASE ? `${API_BASE}${path}` : path);

export default function EventsPage({ onBack, onEventClick }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo({ top: 0 });
    fetch(api('/api/content/events')).then(async (res) => {
      const data = await res.json();
      setEvents(Array.isArray(data) ? data : data.events || []);
    }).catch(() => setEvents([])).finally(() => setLoading(false));
  }, []);

  return <div id="events-page" style={{ minHeight: '100vh', padding: '0 0 100px' }}>
    <div className="page-banner" style={{ background: 'linear-gradient(135deg, rgba(0,212,255,.06), rgba(123,111,255,.04))', borderBottom: '1px solid var(--bdr)', padding: '70px 0 50px', textAlign: 'center', marginBottom: '60px', position: 'relative', overflow: 'hidden' }}>
      <BannerOrbs color="rgba(123,111,255,.06)" />
      <button onClick={onBack} className="ns-back-btn" style={{ position: 'absolute', top: '24px', left: '28px' }}>← Back</button>
      <h1 className="section-title">Our Events</h1>
    </div>
    <div className="container">
      {loading ? <div style={{ display: 'grid', gap: 12 }}>{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} height={100} borderRadius={14} />)}</div> : (
        <div className="events-timeline ns-reveal">{events.map((ev) => <div className="timeline-item" key={ev.id}><div className={`timeline-dot${ev.status === 'upcoming' ? ' upcoming' : ''}`} /><div className="timeline-card shimmer fired" onClick={() => onEventClick && onEventClick(ev)}><div className="timeline-event-name">{ev.icon} {ev.name}</div><div className="timeline-event-date">📅 {ev.date}</div><p className="timeline-event-desc">{ev.description}</p></div></div>)}</div>
      )}
    </div>
  </div>;
}
