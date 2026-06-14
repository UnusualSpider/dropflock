# DropFlock — Kubernetes deployment (GitOps via ArgoCD)

This directory contains plain-YAML Kubernetes manifests for the DropFlock
stack (Postgres + Go backend + Next.js frontend + ingress), plus ArgoCD
`Application` manifests under `argocd/applications/` that reconcile them
from this repo.

## Architecture

```
                  ┌─────────────────────────┐
   Internet ──►   │ Nginx Proxy Manager     │  TLS termination, public IP
                  │ (40.90.243.113)         │
                  └────────────┬────────────┘
                               │ HTTP (X-Forwarded-Proto: https)
                               ▼
                  ┌─────────────────────────┐
                  │ Traefik or ingress-nginx│  in-cluster reverse proxy
                  │ (Service: LoadBalancer /│  ingress-nginx spec uses
                  │  NodePort)              │  ssl-redirect: "false" to
                  └────────────┬────────────┘  avoid redirect loops.
                               │ HTTP
                ┌──────────────┴──────────────┐
                ▼                             ▼
        ┌───────────────┐             ┌───────────────┐
        │ frontend      │             │ backend       │
        │ (Next.js)     │             │ (Go / Gin)    │
        │ :3000         │             │ :8080         │
        └───────────────┘             └───────┬───────┘
                                              │ postgres://
                                              ▼
                                      ┌───────────────┐
                                      │ postgres      │
                                      │ (StatefulSet) │
                                      │ 20Gi PVC      │
                                      └───────────────┘
```

## Prerequisites (cluster-side)

- **Talos 1.x** cluster with 1 control-plane + 2 workers
- **flannel** CNI, **local-path-provisioner** (default StorageClass), and an
  **in-cluster reverse proxy** installed (Traefik is what I observed on this
  cluster, but the manifests are written for `ingressClassName: nginx` —
  see "Important: ingress controller mismatch" below)
- **ArgoCD** installed in the `argocd` namespace and reachable from your
  workstation
- **Sealed Secrets controller** installed:
  ```bash
  helm repo add sealed-secrets https://bitnami-labs.github.io/sealed-secrets
  helm install sealed-secrets sealed-secrets/sealed-secrets -n kube-system
  ```
  Verify with `kubectl get crd | grep sealedsecrets.bitnami.com`. Without
  this, `k8s/postgres/secret.yaml` will not decrypt and the Postgres pod
  will crash-loop.
- **Container images** for the backend and frontend built and pushed to
  `ghcr.io/unusualspider/`. The current manifests reference
  `:latest` as placeholders — see "Build & push images" below.

## Deploy order

ArgoCD will reconcile all four apps in parallel once registered, but
the *dependencies* between them should be respected manually:

```
1. namespace       (k8s/namespace.yaml)            — must exist before any other app can sync
2. postgres        (k8s/postgres/)                  — must be ready before backend can start
3. backend         (k8s/backend/)                   — must respond /api for the ingress to be useful
4. frontend        (k8s/frontend/)                  — last code-tier component
5. ingress         (k8s/ingress/)                   — wires public traffic; safe to apply any time
```

The namespace is its own `argocd/applications/namespace-app.yaml` (with a
directory include pattern limited to `namespace.yaml`) so the namespace
itself is GitOps-managed.

## Bootstrap (one-time, on the operator's workstation)

```bash
# 0. Verify ArgoCD is reachable.
kubectl -n argocd get applications

# 1. Apply all ArgoCD applications. They will start reconciling immediately.
kubectl apply -f argocd/applications/

# 2. Watch progress.
argocd app list
argocd app get namespace
argocd app get postgres
argocd app get backend
argocd app get frontend
argocd app get ingress

# 3. Trigger a sync if auto-sync hasn't kicked in yet (e.g. before image push).
argocd app sync postgres
argocd app sync backend
argocd app sync frontend
argocd app sync ingress
```

## Step 2: seal the Postgres secret

The committed `k8s/postgres/secret.yaml` is a **placeholder** with empty
`encryptedData` and `TODO` comments. You must generate a real one:

```bash
# Generate a plaintext manifest locally. DO NOT COMMIT THIS FILE.
kubectl -n dropflock create secret generic postgres-credentials \
  --from-literal=POSTGRES_USER=dropflock \
  --from-literal=POSTGRES_PASSWORD="$(openssl rand -base64 32)" \
  --from-literal=POSTGRES_DB=dropflock \
  --dry-run=client -o yaml > /tmp/postgres-creds-plaintext.yaml

# Seal it against the cluster's sealing key.
kubeseal --format yaml \
  --controller-name=sealed-secrets \
  --controller-namespace=kube-system \
  < /tmp/postgres-creds-plaintext.yaml > k8s/postgres/secret.yaml

# CRITICAL: delete the plaintext file. It contains the real password.
rm /tmp/postgres-creds-plaintext.yaml

# Commit + push. ArgoCD will pick it up within ~3 minutes (default sync window).
git add k8s/postgres/secret.yaml
git commit -m "chore(k8s): seal postgres credentials"
git push
```

The `.gitignore` excludes `*-plaintext.yaml` and `*-plaintext.yml` so a
hasty re-run of the `kubectl create --dry-run` command can't accidentally
commit a real password.

## Step 3: build & push images

The manifests reference placeholder image tags. Build and push the real
images before expecting the backend/frontend pods to start:

```bash
# Backend
docker build -t ghcr.io/unusualspider/dropflock-backend:latest backend/
docker push ghcr.io/unusualspider/dropflock-backend:latest

# Frontend (Next.js — should be built with `output: 'standalone'` in
# next.config.ts so the image is small and self-contained)
docker build -t ghcr.io/unusualspider/dropflock-frontend:latest app/
docker push ghcr.io/unusualspider/dropflock-frontend:latest
```

If the image repo is private, create a `docker-registry` `imagePullSecret`
in the `dropflock` namespace and reference it from each pod spec
(`spec.imagePullSecrets`). Not included in the current manifests.

## Nginx Proxy Manager (NPM) configuration

NPM terminates TLS in front of the cluster. The ingress-nginx controller
inside the cluster sees plain HTTP. Two things must be true:

1. **Disable ingress-nginx's HTTPS redirect** — already done in
   `k8s/ingress/ingress.yaml` via:
   ```yaml
   nginx.ingress.kubernetes.io/ssl-redirect: "false"
   nginx.ingress.kubernetes.io/force-ssl-redirect: "false"
   ```
   Without this, the cluster's ingress-nginx redirects HTTP→HTTPS, NPM
   re-terminates and re-redirects, and the browser errors with
   `ERR_TOO_MANY_REDIRECTS`.

2. **NPM must pass `X-Forwarded-Proto: https`** to the cluster — handled
   by the `configuration-snippet` in the ingress:
   ```nginx
   proxy_set_header X-Forwarded-Proto "https";
   proxy_set_header X-Forwarded-Port "443";
   ```
   This lets Next.js and Gin see the original scheme for correct cookie
   flags, CSRF, and absolute URL generation.

3. **NPM upstream target** points to the in-cluster reverse proxy. On
   bare-metal Talos with no MetalLB, the cluster's reverse-proxy Service
   is `NodePort`. The exact port depends on the install method:

   | Reverse proxy   | Install method                                       | NodePort (HTTP/HTTPS) |
   | --------------- | ---------------------------------------------------- | --------------------- |
   | ingress-nginx   | `helm install ingress-nginx ... --set controller.service.type=NodePort` | defaults: **30080 / 30443** |
   | ingress-nginx   | bare-metal manifests (DaemonSet hostPort)            | n/a — uses host port directly |
   | Traefik         | `helm install traefik ... --set service.type=NodePort` | Helm defaults: **30080 / 30443** |

   **Observed on this cluster:** the existing Traefik is a `LoadBalancer`
   type with external IP `40.90.243.113` (likely an Azure L4 LB, given the
   `kube-system azure-*` services). If you keep Traefik, point NPM at that
   external IP on port 80 (and don't change anything else in this repo —
   just swap the `ingressClassName` on the ingress from `nginx` to
   `traefik`, see "ingress controller mismatch" below).

   To find the actual NodePort on your cluster once ingress-nginx is
   installed:
   ```bash
   kubectl -n ingress-nginx get svc ingress-nginx-controller \
     -o jsonpath='{.spec.ports[?(@.name=="http")].nodePort}{"\n"}{.spec.ports[?(@.name=="https")].nodePort}{"\n"}'
   ```

   In NPM, create a **Proxy Host** with:
   - **Domain Names:** `dropflock.org` (and any other public names)
   - **Scheme:** `http`
   - **Forward Hostname / IP:** the cluster's `ingress-nginx-controller`
     Service `nodeIP` (e.g. one of the Talos node IPs), OR a DNS name
     resolving to all node IPs
   - **Forward Port:** the NodePort from the table above (e.g. `30080`)
   - **Cache Assets:** off
   - **Block Common Exploits:** on
   - **Websockets Support:** on
   - **Access List:** your choice

4. **NPM "Force SSL" + "HTTP/2"** on the Proxy Host are fine — they only
   affect NPM's public-facing listener, not the upstream hop.

## ⚠️ Important: ingress controller mismatch

The manifests in `k8s/ingress/ingress.yaml` use:

```yaml
spec:
  ingressClassName: nginx
```

with `nginx.ingress.kubernetes.io/*` annotations. **On this cluster, the
existing in-cluster reverse proxy is Traefik** (namespace `traefik`,
Service `LoadBalancer` with external IP `40.90.243.113`). ingress-nginx
is not currently installed.

You have three options:

**A. Install ingress-nginx alongside (or instead of) Traefik.** The
manifests in this repo will work as-is. Recommended if you want a
clean separation between public edge (NPM) and cluster ingress
(ingress-nginx).

**B. Keep Traefik.** Change the ingress to:

```yaml
spec:
  ingressClassName: traefik
```

and remove the `nginx.ingress.kubernetes.io/*` annotations (Traefik has
its own annotation scheme — `traefik.ingress.kubernetes.io/router.tls` etc).
The `/api → backend`, `/ → frontend` routing works natively.

**C. Use a Traefik `IngressRoute` CRD instead of the standard `Ingress`.**
More native to Traefik, supports middlewares directly. Would require
adding `traefik.io/v1alpha1` `IngressRoute` resources.

**Do not apply `k8s/ingress/ingress.yaml` as-is** until you've decided
which of the above applies. The other manifests (postgres, backend,
frontend, namespace) are controller-agnostic and will work either way.

## Observability / what to check

```bash
# Are all ArgoCD apps healthy?
argocd app list -o yaml | yq '.items[].status.health.status'

# Is the namespace present?
kubectl -n dropflock get all

# Is Postgres up and accepting connections?
kubectl -n dropflock exec -it statefulset/postgres -- \
  psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c '\dt'

# Is the sealed secret decrypted?
kubectl -n dropflock get secret postgres-credentials -o jsonpath='{.data.POSTGRES_PASSWORD}' | base64 -d; echo

# Is the backend reachable from inside the cluster?
kubectl -n dropflock run -it --rm curl --image=curlimages/curl --restart=Never -- \
  curl -sS http://backend:8080/ping

# Is the ingress routing correctly?
kubectl -n dropflock get ingress dropflock -o yaml
```

## File map

```
k8s/
├── README.md                   ← you are here
├── namespace.yaml              ← dropflock namespace
├── postgres/
│   ├── statefulset.yaml        ← Postgres 16, 1 replica, 20Gi local-path PVC
│   ├── service.yaml            ← headless ClusterIP, port 5432
│   ├── secret.yaml             ← SealedSecret (PLACEHOLDER — seal before deploy)
│   └── configmap.yaml          ← POSTGRES_DB, PGDATA, initdb args
├── backend/
│   ├── deployment.yaml         ← Go, 2 replicas, resources, env from secret+configmap
│   ├── service.yaml            ← ClusterIP, port 8080
│   └── configmap.yaml          ← APP_ENV, PORT, DB_HOST, DB_PORT, DB_NAME
├── frontend/
│   ├── deployment.yaml         ← Next.js, 2 replicas, resources, NEXT_PUBLIC_API_URL=/api
│   └── service.yaml            ← ClusterIP, port 80 → containerPort 3000
└── ingress/
    └── ingress.yaml            ← /api → backend, / → frontend; ssl-redirect: false

argocd/
└── applications/
    ├── namespace-app.yaml      ← manages k8s/namespace.yaml only
    ├── postgres-app.yaml
    ├── backend-app.yaml
    ├── frontend-app.yaml
    └── ingress-app.yaml
```

## Security notes

- The placeholder `k8s/postgres/secret.yaml` has **empty `encryptedData`**.
  The Sealed Secrets controller will refuse to materialize a Secret from
  it, which is the intended failure mode — surfaces the missing bootstrap
  step instead of silently creating a broken Secret.
- All workloads run as non-root (`runAsUser: 65532`), with
  `readOnlyRootFilesystem: true` and `allowPrivilegeEscalation: false`.
  Writable scratch space is mounted as `emptyDir: medium: Memory` at
  `/tmp`.
- Postgres runs as the official `postgres` image's UID (`999`).
- `automountServiceAccountToken: false` on the backend and frontend —
  they don't talk to the Kubernetes API, no need for a token.
- The Postgres `Service` is `ClusterIP: None` (headless) and not exposed
  via the ingress. There is no NodePort or LoadBalancer for it.
- `.gitignore` excludes `kubeconfig`, `talosconfig`, and any
  `*-plaintext.yaml` files so a hasty `kubectl create --dry-run -o yaml`
  can't leak real secrets.
