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

# Cant get data volume to work properly when using app user

# RUN set -x \
#     # Add user
#     && addgroup --gid 10001 app \
#     && adduser --disabled-password \
#         --gecos '' \
#         --gid 10001 \
#         --home /app \
#         --uid 10001 \
#         app

# USER app

# Create app dir
WORKDIR /app

# Copy files needed in this stage from builder
COPY --from=builder ["/build/package.json", "/build/package-lock.json", "./"]

RUN npm ci --only=production

# Doesn't work when included in copy above...
COPY --from=builder /build/out ./out

VOLUME /app/data

EXPOSE 3001

CMD [ "npm", "run", "start" ]
