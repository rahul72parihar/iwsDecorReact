import { useMemo } from 'react';

export default function SearchResults() {
  const results = useMemo(() => [], []);

  return (
    <div style={{ padding: 24 }}>
      <h1>Search Results</h1>
      <p>{results.length ? `${results.length} results` : 'No results placeholder.'}</p>
    </div>
  );
}

