FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY tsconfig.json ./
COPY scripts ./scripts
COPY src ./src
RUN npm run build

FROM node:22-alpine
RUN adduser -D mcp
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY --from=build /app/dist ./dist
USER mcp
ENV MCP_TRANSPORT=http
ENV MCP_BIND=0.0.0.0
ENV MCP_PORT=3100
EXPOSE 3100
CMD ["node", "dist/index.js"]
