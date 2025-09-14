FROM oven/bun:latest

WORKDIR /app

# Copy package files
COPY package.json bun.lockb* ./

# Install dependencies
RUN bun install

# Copy source code
COPY . .

# Build for production
RUN bun run build

# Expose port
EXPOSE 3000

# Start production server with Node adapter
CMD ["node", "build"]