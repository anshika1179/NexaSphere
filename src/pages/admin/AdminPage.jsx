import { useEffect, useState } from 'react';
import { Skeleton } from '../../shared/Skeleton';

const API_BASE = (import.meta.env?.VITE_API_BASE || '').replace(/\/+$/, '');
const api = (path) => (API_BASE ? `${API_BASE}${path}` : path);

export default function AdminPage() {
  const [token, setToken] = useState(localStorage.getItem('ns_admin_token') || '');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [tab, setTab] = useState('events');
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);

  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  const load = async () => {
    setLoading(true);
    const endpoint = tab === 'events' ? '/api/admin/events' : tab === 'core-team' ? '/api/admin/core-team' : '/api/content/activity-events/hackathon';
    const res = await fetch(api(endpoint), { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    setItems(Array.isArray(data) ? data : data.events || []);
    setLoading(false);
  };

  useEffect(() => { if (token) load(); }, [token, tab]);

  const login = async () => {
    const res = await fetch(api('/api/admin/login'), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
    const data = await res.json();
    if (data.token) { setToken(data.token); localStorage.setItem('ns_admin_token', data.token); }
  };

  if (!token) return <div className="container" style={{ paddingTop: 120 }}><h1>Admin Dashboard</h1><input className="admin-input" type="email" placeholder="Admin Email" value={email} onChange={(e) => setEmail(e.target.value)} /><input className="admin-input" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} /><button className="btn btn-primary" onClick={login}>Login</button></div>;

  return <div className="container" style={{ paddingTop: 120 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between' }}><h1>Admin Dashboard</h1><button className="btn btn-outline" onClick={() => { localStorage.removeItem('ns_admin_token'); setToken(''); }}>Logout</button></div>
    <div style={{ position: 'sticky', top: 90, display: 'flex', gap: 10, marginBottom: 20 }}>{['events', 'activity-events', 'core-team'].map((t) => <button key={t} className="btn btn-outline" onClick={() => setTab(t)}>{t}</button>)}</div>
    {loading ? <div style={{ display: 'grid', gap: 12 }}>{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} height={80} borderRadius={12} />)}</div> : <pre>{JSON.stringify(items, null, 2)}</pre>}
  </div>;
}
