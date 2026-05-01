import { useEffect, useState } from 'react';
import { BannerOrbs } from '../../shared/MotionLayer';
import { Skeleton } from '../../shared/Skeleton';

const API_BASE = (import.meta.env?.VITE_API_BASE || '').replace(/\/+$/, '');
const api = (path) => (API_BASE ? `${API_BASE}${path}` : path);

export default function TeamPage({ onBack }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo({ top: 0 });
    fetch(api('/api/content/core-team')).then(async (res) => {
      const data = await res.json();
      setMembers(Array.isArray(data) ? data : data.members || []);
    }).catch(() => setMembers([])).finally(() => setLoading(false));
  }, []);

  return <div id="team-page" style={{ minHeight: '100vh', padding: '0 0 100px' }}>
    <div className="page-banner" style={{ textAlign: 'center', marginBottom: 60, position: 'relative' }}><BannerOrbs color="rgba(123,111,255,.07)" /><button onClick={onBack} className="ns-back-btn" style={{ position: 'absolute', top: 24, left: 28 }}>← Back</button><h1 className="section-title">Core Team</h1></div>
    <div className="container">
      {loading ? <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 16 }}>{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} width={200} height={260} borderRadius={14} />)}</div> : <div className="team-grid">{members.map((m) => <div key={m.id} className="team-card"><div className="team-card-name">{m.name}</div><div className="team-card-role">{m.role}</div></div>)}</div>}
    </div>
  </div>;
}
