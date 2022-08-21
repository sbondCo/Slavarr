/**
 * Run to register / update slash commands.
 */

const { Routes, SlashCommandBuilder } = require("discord.js");
const { REST } = require("@discordjs/rest");
const { default: axios } = require("axios");
require("dotenv").config({ path: ".env" });

if (
  !process.env.DC_TOKEN ||
  !process.env.DC_CLIENT_ID ||
  !process.env.RADARR_URL ||
  !process.env.RADARR_KEY ||
  !process.env.SONARR_URL ||
  !process.env.SONARR_KEY
) {
  console.log("You are missing a required environment variable!");
  console.log(
    "---> Ensure you have all of the following defined in your .env file: DC_TOKEN, DC_CLIENT_ID, RADARR_URL, RADARR_KEY, SONARR_URL, SONARR_KEY"
  );
  process.exit(1);
}

(async () => {
  console.log("Requesting quality profiles from Radarr and Sonarr.");
  const { data: radarrQualities } = await axios.get(
    `${process.env.RADARR_URL}/api/v3/qualityprofile/?apikey=${process.env.RADARR_KEY}`
  );
  const { data: sonarrQualities } = await axios.get(
    `${process.env.SONARR_URL}/api/v3/qualityprofile/?apikey=${process.env.SONARR_KEY}`
  );
  console.log("Done fetching quality profiles.");

  const commands = [
    // Movie command
    new SlashCommandBuilder()
      .setName("movie")
      .setDescription("Add a movie to Radarr")
      .addStringOption((option) => option.setName("name").setDescription("Movie title.").setRequired(true))
      .addStringOption((option) =>
        option
          .setName("quality")
          .setDescription("Quality profile to use for fetching the movie.")
          .addChoices(
            ...radarrQualities.map((q) => {
              return { name: q.name, value: `${q.id}` };
            })
          )
          .setRequired(true)
      ),

    // Series command
    new SlashCommandBuilder()
      .setName("series")
      .setDescription("Add a series to Sonarr")
      .addStringOption((option) => option.setName("name").setDescription("Series title.").setRequired(true))
      .addStringOption((option) =>
        option
          .setName("quality")
          .setDescription("Quality profile to use for fetching the show.")
          .addChoices(
            ...sonarrQualities.map((q) => {
              return { name: q.name, value: `${q.id}` };
            })
          )
          .setRequired(true)
      ),

    // Settings
    new SlashCommandBuilder()
      .setName("set")
      .setDescription("Modify your user settings")
      .addSubcommand((sc) =>
        sc
          .setName("dm_instead")
          .setDescription("If bot should DM you for notifications instead of pinging in channel you ran the command.")
      )
      .addSubcommand((sc) =>
        sc
          .setName("auto_subscribe")
          .setDescription("If you want to auto subscribe to events on content you have added.")
      )
  ];

  const rest = new REST({ version: "10" }).setToken(process.env.DC_TOKEN);

  try {
    console.log("Started refreshing application (/) commands.");

    await rest.put(Routes.applicationCommands(process.env.DC_CLIENT_ID), { body: commands });

    console.log("Successfully reloaded application (/) commands.");
  } catch (error) {
    console.error(error);
  }
})();
