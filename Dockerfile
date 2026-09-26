FROM node:22-alpine AS build
WORKDIR /app
RUN apk add --no-cache git
COPY package.json package-lock.json ./
RUN npm ci
COPY tsconfig.json ./
COPY scripts ./scripts
COPY src ./src
COPY skills ./skills
RUN npm run build
# Portable allowlisted cyber skills (no host ~/.claude/skills dependency)
RUN node scripts/sync-cyber-skills.mjs || echo "WARN: cyber skills sync failed during image build"

FROM node:22-alpine
RUN adduser -D mcp
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY --from=build /app/dist ./dist
COPY --from=build /app/skills ./skills
USER mcp
ENV MCP_TRANSPORT=http
ENV MCP_BIND=0.0.0.0
ENV MCP_PORT=3100
EXPOSE 3100
CMD ["node", "dist/index.js"]
