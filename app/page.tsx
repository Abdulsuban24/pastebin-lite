// app/page.tsx
'use client';

import { useState } from 'react';

export default function HomePage() {
  const [content, setContent] = useState('');
  const [ttl, setTtl] = useState('');
  const [maxViews, setMaxViews] = useState('');
  const [result, setResult] = useState<{ url: string } | null>(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResult(null);

    const body: any = { content };
    if (ttl) body.ttl_seconds = parseInt(ttl, 10);
    if (maxViews) body.max_views = parseInt(maxViews, 10);

    const res = await fetch('/api/pastes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    if (res.ok) {
      setResult(data);
    } else {
      setError(data.error || 'Failed to create paste');
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h1>Pastebin Lite</h1>
        <form onSubmit={handleSubmit}>
          <div>
            <label>Paste Content *</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter your text here..."
              required
            />
          </div>

          <div className="form-grid">
            <div>
              <label>TTL (seconds, optional)</label>
              <input
                type="number"
                value={ttl}
                onChange={(e) => setTtl(e.target.value)}
                min="1"
                placeholder="e.g. 3600"
              />
            </div>
            <div>
              <label>Max Views (optional)</label>
              <input
                type="number"
                value={maxViews}
                onChange={(e) => setMaxViews(e.target.value)}
                min="1"
                placeholder="e.g. 5"
              />
            </div>
          </div>

          <button type="submit">Create Paste</button>

          {error && <div className="error">{error}</div>}
          {result && (
            <div className="success">
              ✅ Paste created!
              <a href={result.url} target="_blank" rel="noopener noreferrer">
                {result.url}
              </a>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}