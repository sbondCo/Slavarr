# Build stage
FROM node:16 AS builder

RUN set -x \
    # Add user
    && addgroup --gid 10001 app \
    && adduser --disabled-password \
        --gecos '' \
        --gid 10001 \
        --home /build \
        --uid 10001 \
        app

USER app

# Create build dir
WORKDIR /build

COPY --chown=app:app . ./

RUN npm install

RUN [ "npm", "run", "build" ]

# Run stage
FROM node:16 as runner

RUN set -x \
    # Add user
    && addgroup --gid 10001 app \
    && adduser --disabled-password \
        --gecos '' \
        --gid 10001 \
        --home /app \
        --uid 10001 \
        app

USER app

# Create app dir
WORKDIR /app

# Copy files needed in this stage from builder
COPY --chown=app:app --from=builder ["/build/package.json", "/build/package-lock.json", "./"]

RUN npm ci --only=production

# Doesn't work when included in copy above...
COPY --chown=app:app --from=builder /build/out ./out

EXPOSE 3000

CMD [ "npm", "run", "start" ]
