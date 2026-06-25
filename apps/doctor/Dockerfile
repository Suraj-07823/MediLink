FROM node:20-alpine AS build
WORKDIR /app
COPY apps/doctor/package*.json ./
RUN npm install --legacy-peer-deps
COPY apps/doctor/ ./
RUN npm run build

FROM nginx:stable-alpine
RUN apk add --no-cache openssl && \
    mkdir -p /etc/nginx/ssl && \
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/nginx/ssl/medilink.key \
    -out /etc/nginx/ssl/medilink.crt \
    -subj "/CN=localhost"
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80 443
CMD ["nginx", "-g", "daemon off;"]
