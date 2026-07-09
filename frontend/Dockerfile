# ─────────────────────────────────────────────
# Dockerfile — Frontend React + Vite
# Multi-stage: build con Node, serve con Nginx
# ─────────────────────────────────────────────

# ── Stage 1: Build ───────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copia manifiestos e instala dependencias
COPY package.json package-lock.json ./
RUN npm ci

# Copia el resto del código y compila
COPY . .
RUN npm run build

# ── Stage 2: Serve ───────────────────────────
FROM nginx:alpine

# Elimina la configuración por defecto de nginx
RUN rm /etc/nginx/conf.d/default.conf

# Copia la configuración personalizada de nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copia el script de inicio (para inyectar variables de AWS)
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Copia los artefactos del build
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

# Usamos el script como punto de entrada en vez del comando por defecto de nginx
CMD ["/entrypoint.sh"]
