function getApiBase() {
  if (window.location.protocol === 'file:') {
    return 'http://localhost:8081';
  }
  return '';
}

async function apiFetch(path, options = {}) {
  const url = `${getApiBase()}${path}`;
  const res = await fetch(url, options);
  const contentType = res.headers.get('content-type') || '';

  if (!contentType.includes('application/json')) {
    const text = await res.text();
    if (text.trimStart().startsWith('<!')) {
      throw new Error(
        'Betaalserver niet bereikbaar. Start de server met "npm start" en open http://localhost:8081'
      );
    }
    throw new Error(text.slice(0, 200) || 'Onverwacht antwoord van de server');
  }

  const data = await res.json();
  return { res, data };
}

window.Api = { getApiBase, apiFetch };
