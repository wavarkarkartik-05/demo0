// Minimal smoke test (used by the Jenkins "Test" stage).
const http = require('http');
const server = require('./server');
server.listen(0, async () => {
  const port = server.address().port;
  const get = p => new Promise((ok, no) => http.get({ port, path: p }, r => {
    let d = ''; r.on('data', c => d += c); r.on('end', () => ok({ status: r.statusCode, body: d }));
  }).on('error', no));
  try {
    const h = await get('/health');
    if (h.status !== 200 || !h.body.includes('UP')) throw new Error('/health failed');
    const i = await get('/api/info');
    if (i.status !== 200) throw new Error('/api/info failed');
    const m = await get('/metrics');
    if (!m.body.includes('http_requests_total')) throw new Error('/metrics failed');
    console.log('All tests passed');
    server.close(); process.exit(0);
  } catch (e) { console.error(e.message); process.exit(1); }
});
