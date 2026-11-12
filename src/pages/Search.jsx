import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../api/client';
import Loading from '../components/Loading';

export default function Search() {
  const [params] = useSearchParams();
  const q = params.get('q') || '';
  const [results, setResults] = useState(null);

  useEffect(() => {
    if (q.length < 2) return;
    api.get('/search/', { params: { q } }).then(({ data }) => setResults(data.results));
  }, [q]);

  if (!results) return <Loading />;

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Search</h1>
          <p>Results for “{q}”</p>
        </div>
      </div>
      <div className="two-col" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
        <div className="card">
          <div className="card-header"><h2>Clients</h2></div>
          <div className="card-body">
            {(results.clients || []).map((c) => (
              <div key={c.id} style={{ marginBottom: 8 }}><Link to={`/clients/${c.id}`}>{c.client_id} – {c.client_name}</Link></div>
            ))}
            {!results.clients?.length ? <div className="empty">None</div> : null}
          </div>
        </div>
        <div className="card">
          <div className="card-header"><h2>Projects</h2></div>
          <div className="card-body">
            {(results.projects || []).map((p) => (
              <div key={p.id} style={{ marginBottom: 8 }}><Link to={`/projects/${p.id}`}>{p.project_id} – {p.name}</Link></div>
            ))}
            {!results.projects?.length ? <div className="empty">None</div> : null}
          </div>
        </div>
        <div className="card">
          <div className="card-header"><h2>Leads</h2></div>
          <div className="card-body">
            {(results.leads || []).map((l) => (
              <div key={l.id} style={{ marginBottom: 8 }}>{l.lead_id} – {l.client_name}</div>
            ))}
            {!results.leads?.length ? <div className="empty">None</div> : null}
          </div>
        </div>
      </div>
    </>
  );
}
