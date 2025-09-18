FROM oven/bun:latest

WORKDIR /app

# Build arguments for environment variables needed during build
ARG POCKETBASE_URL
ARG TELEGRAM_LINK_SECRET
ARG HOST
ARG POCKETBASE_PORT

# Set environment variables for build
ENV POCKETBASE_URL=$POCKETBASE_URL
ENV TELEGRAM_LINK_SECRET=$TELEGRAM_LINK_SECRET
ENV HOST=$HOST
ENV POCKETBASE_PORT=$POCKETBASE_PORT

# Copy package files
COPY package.json bun.lockb* ./

# Install dependencies
RUN bun install

# Copy source code
COPY . .

# Build for production with verbose error reporting
RUN set -e && \
    echo "🏗️  Starting SvelteKit build..." && \
    bun run build || \
    (echo "❌ BUILD FAILED! Check syntax errors above." && exit 1)

# Expose port
EXPOSE 3000

# Start production server with Node adapter
CMD ["node", "build"]