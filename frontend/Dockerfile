# frontend/Dockerfile

### Stage 1: Сборка React-приложения ###
FROM node:18-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN npm run build        # результат — папка /app/build

### Stage 2: Nginx отдаёт файлы ###
FROM nginx:1.21.3-alpine
# Копируем наш конфиг
COPY nginx/default.conf /etc/nginx/conf.d/default.conf
# Копируем сборку целиком
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]