# Slavarr

The Discord bot to help you easily add movies/series to Radarr/Sonarr.

## How to host your own instance

1. Create a discord bot.
   1. Go to the [Discord Developer Portal](https://discord.com/developers/applications/)
   2. Click `New Application` (top right)
   3. (In the popup) Enter any name and click create
   4. You should now be in the applications dashboard, you can customize it now if you want (add avatar, description, etc)
   5. Under the `OAuth2` tab (on the left) make note of your apps `CLIENT ID` and `CLIENT SECRET` (if you click reset secret, it will show you a new one you can use).
2. Choose the way you want to setup the bot:
     
     - [Docker Compose (my favourite)](#docker-compose)
     - [Docker](#docker-cli)
     - [From Source](#from-source)

### Setup

#### Docker Compose

1. Download latest `docker-compose.yml` and `.env.example` from the repo.
   ```
   wget https://raw.githubusercontent.com/IRHM/Slavarr/master/docker-compose.yml https://raw.githubusercontent.com/IRHM/Slavarr/master/.env.example
   ```
   If you can't use `wget`, you can simply open these two links in your browser and save them from there (ctrl+s OR right click > save page as...):
   
      - [docker-compose.yml](https://raw.githubusercontent.com/IRHM/Slavarr/master/docker-compose.yml)
      - [.env.example](https://raw.githubusercontent.com/IRHM/Slavarr/master/.env.example)
2. Copy the `.env.example` files contents into a new file `.env` and fill out all the environment variables listed.
3. Start the bot:
   ```
   # Or use docker-compose depending on your configuration
   docker compose up -d
   ```

#### Docker CLI

1. Download latest `.env.example` from the repo.
   ```
   wget https://raw.githubusercontent.com/IRHM/Slavarr/master/.env.example
   ```
   If you can't use `wget`, you can simply [open the .env.example file here](https://raw.githubusercontent.com/IRHM/Slavarr/master/.env.example) in your browser and save it from there (ctrl+s OR right click > save page as...):
2. Copy the `.env.example` files contents into a new file `.env` and fill out all the environment variables listed.
3. Start the bot:
   ```
   docker run -d --name=slavarr --env-file .env --restart unless-stopped ghcr.io/irhm/slavarr:latest
   ```

#### From Source

1. Download/clone the code from the [repo](https://github.com/IRHM/Slavarr).
2. Copy the `.env.example` files contents into a new file `.env` and fill out all the environment variables listed.
3. Build and register bot slash commands:
   ```
   # Install packages needed for production
   npm ci --only=production
   # Build slavarr
   npm run build
   # Register the bots commands with discord
   npm run commands
   ```
4. Start the bot:
   ```
   npm run start
   ```

