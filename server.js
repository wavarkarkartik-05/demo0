// Zero-dependency demo web app: UI + health check + Prometheus metrics.
const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const PORT = process.env.PORT || 3000;
const APP_VERSION = process.env.APP_VERSION || '1.0.0';
const ENVIRONMENT = process.env.APP_ENV || 'production';
const startedAt = Date.now();

// ---- tiny metrics store (Prometheus text format) ----
const counters = {}; // key: method|route|status -> count
function track(method, route, status) {
  const k = `${method}|${route}|${status}`;
  counters[k] = (counters[k] || 0) + 1;
}
function metricsText() {
  let out = '# HELP http_requests_total Total HTTP requests\n# TYPE http_requests_total counter\n';
  for (const [k, v] of Object.entries(counters)) {
    const [method, route, status] = k.split('|');
    out += `http_requests_total{method="${method}",route="${route}",status="${status}"} ${v}\n`;
  }
  out += '# HELP app_uptime_seconds Seconds since app start\n# TYPE app_uptime_seconds gauge\n';
  out += `app_uptime_seconds ${Math.floor((Date.now() - startedAt) / 1000)}\n`;
  out += '# HELP process_resident_memory_bytes Resident memory in bytes\n# TYPE process_resident_memory_bytes gauge\n';
  out += `process_resident_memory_bytes ${process.memoryUsage().rss}\n`;
  return out;
}

const info = () => ({
  app: 'nexuscloud-demo-app',
  version: APP_VERSION,
  environment: ENVIRONMENT,
  hostname: os.hostname(), // pod name when running on Kubernetes
  node: process.version,
  uptimeSeconds: Math.floor((Date.now() - startedAt) / 1000),
  time: new Date().toISOString(),
});

const server = http.createServer((req, res) => {
  const url = req.url.split('?')[0];
  const send = (status, type, body, route = url) => {
    res.writeHead(status, { 'Content-Type': type });
    res.end(body);
    track(req.method, route, status);
  };

  if (url === '/' || url === '/index.html') {
    return send(200, 'text/html; charset=utf-8',
      fs.readFileSync(path.join(__dirname, 'public', 'index.html')), '/');
  }
  if (url === '/health') return send(200, 'application/json', JSON.stringify({ status: 'UP' }));
  if (url === '/api/info') return send(200, 'application/json', JSON.stringify(info()));
  if (url === '/metrics') return send(200, 'text/plain; version=0.0.4', metricsText());
  return send(404, 'application/json', JSON.stringify({ error: 'Not found' }), 'other');
});

if (require.main === module) {
  server.listen(PORT, '0.0.0.0', () => console.log(`Demo app v${APP_VERSION} listening on port ${PORT}`));
}
module.exports = server;
