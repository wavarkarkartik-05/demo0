# NexusCloud Demo App

A tiny Node.js web app used to demonstrate deployment through the NexusCloud
(GitHub → Jenkins → Docker → Kubernetes → Prometheus/Grafana).

## Endpoints
| Path | Purpose |
|------|---------|
| `/` | Live status page (version, pod name, uptime) |
| `/health` | Health check - `{"status":"UP"}` (used by probes) |
| `/api/info` | App/environment info as JSON |
| `/metrics` | Prometheus metrics |

## Run locally
```bash
npm start          # http://localhost:3000
npm test           # smoke tests
```

## Docker
```bash
docker build -t nexuscloud-demo-app .
docker run -p 3000:3000 nexuscloud-demo-app
```

## Kubernetes
Replace `IMAGE_PLACEHOLDER` in `k8s/deployment.yaml` with your image, then:
```bash
kubectl apply -f k8s/
# open http://<node-ip>:30080
```

## Deploy from the IDP
1. Connect this GitHub repo in the platform.
2. Platform detects the `Dockerfile` and runs the pipeline (see `Jenkinsfile`).
3. Image is built and deployed; app listens on **port 3000**, health path **/health**.
4. Prometheus scrapes `/metrics`; view in Grafana.

Env vars: `PORT` (3000), `APP_VERSION` (1.0.0), `APP_ENV` (production).
