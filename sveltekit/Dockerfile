FROM oven/bun:latest

WORKDIR /app

# Copy package files
COPY package.json bun.lockb* ./

# Install dependencies
RUN bun install

# Copy source code
COPY . .

# Expose port
EXPOSE 5173

# Start dev server with external host binding
CMD ["bun", "run", "dev", "--host", "0.0.0.0", "--port", "5173"]