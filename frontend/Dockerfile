# Build stage
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# ...

RUN rm -rf node_modules package-lock.json
RUN npm install

# ...
RUN npm run build

# Production stage
FROM node:18-alpine
WORKDIR /app
COPY --from=build /app .
EXPOSE 3000
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]