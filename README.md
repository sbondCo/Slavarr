# Slavarr

The Discord bot to help you easily add movies/series to Radarr/Sonarr.

## How to host your own instance

1. Create a discord bot.
   1. Go to the [Discord Developer Portal](https://discord.com/developers/applications/)
   2. Click `New Application` (top right)
   3. (In the popup) Enter any name and click create
   4. You should now be in the applications dashboard, you can customize it now if you want (add avatar, description, etc)
   5. Under the `OAuth2` tab (on the left) make note of your apps `CLIENT ID`.
   6. Go to the `Bot` tab (on the left) and click `Add Bot`, in the page with your bot's details, make note of your bots `TOKEN` (click `Reset Token` to show a new one if you didn't see your first one).
2. Fill out the environment variables
   1. [Download the .env.example file](https://raw.githubusercontent.com/sbondCo/Slavarr/master/.env.example) from the repo.
   2. Copy the `.env.example` files contents into a new file `.env` and fill out all the environment variables listed. All variables have a comment above them so you know what to set them as.
3. Choose the way you want to setup the bot:
   - [Docker Compose (my favourite)](#docker-compose)
   - [Docker](#docker-cli)
   - [From Source](#from-source)
4. Invite the bot to a server (an invite url is logged to console for you when slavarr starts).
5. Optionally add notification support:
   1. In Sonarr and Radarr go to Settings > Connect > + (Add Notification) > Webhook.
   2. Set a Name for the connection
   3. Add the URL to Slavarrs listener (default: `http://127.0.0.1:3001`)
   4. Click `Save` and you are done, Slavarr will receive events and notify you of them!
6. :cheer: Done! When slavarr starts, it will register the bots slash commands and you should be ready to use it!

### Installation

#### Docker Compose

1. [Download the latest docker-compose.yml](https://raw.githubusercontent.com/sbondCo/Slavarr/master/docker-compose.yml) file from the repo.
2. Start the bot:
   ```
   # Or use docker-compose depending on your configuration
   docker compose up -d
   ```

#### Docker CLI

1. Start the bot:
   ```
   docker run -d --name=slavarr --env-file .env --restart unless-stopped ghcr.io/sbondco/slavarr:latest
   ```

#### From Source

1. Download/clone the code from the [repo](https://github.com/sbondCo/Slavarr).
2. Build and register bot slash commands:
   ```
   # Install all packages
   npm i
   # Build slavarr
   npm run build
   ```
3. Start the bot:
   ```
   npm run start
   ```
