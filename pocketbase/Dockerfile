FROM alpine:latest

# Install required packages
RUN apk add --no-cache ca-certificates curl

# Create pocketbase user
RUN addgroup -g 1001 -S pocketbase && \
    adduser -S pocketbase -u 1001 -G pocketbase

# Create directories
RUN mkdir -p /pb /pb_data /pb_hooks /pb_migrations /pb_public && \
    chown -R pocketbase:pocketbase /pb /pb_data /pb_hooks /pb_migrations /pb_public

WORKDIR /pb

# Copy local PocketBase executable
COPY pocketbase ./pocketbase
RUN chmod +x pocketbase && \
    chown pocketbase:pocketbase pocketbase

# Expose port
EXPOSE 8090

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8090/api/health || exit 1

# Start PocketBase as root to handle volume permissions
CMD ["./pocketbase", "serve", "--http=0.0.0.0:8090", "--dir=/pb_data", "--publicDir=/pb_public"]