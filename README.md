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
     
     - Docker
     - Docker Compose (my favourite)
     - [From Source](#from-source)

### Setup

#### From Source

1. Download/clone the code from the [repo](https://github.com/IRHM/Slavarr).
2. Copy the `.env.example` files contents into a new file `.env` and fill out all the environment variables listed.
3. Run:
    ```
    # Only have to install packages/build once (and everytime you download updates from the repo)
    npm ci --only=production
    npm run build

    npm run start
    ```

