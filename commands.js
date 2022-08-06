/**
 * Run to register / update slash commands.
 */

const { Routes, SlashCommandBuilder } = require("discord.js");
const { REST } = require("@discordjs/rest");
const { default: axios } = require("axios");
require("dotenv").config();

if (!process.env.DC_CLIENT_ID) {
  console.log("Missing DC_CLIENT_ID");
  process.exit(1);
}

(async () => {
  const { data: radarrQualities } = await axios.get(
    `${process.env.RADARR_URL}/qualityprofile/?apikey=${process.env.RADARR_KEY}`
  );

  const commands = [
    // Movie command
    new SlashCommandBuilder()
      .setName("movie")
      .setDescription("Add a movie to Radarr")
      .addStringOption((option) => option.setName("name").setDescription("Movie title.").setRequired(true))
      .addStringOption((option) =>
        option
          .setName("quality")
          .setDescription("Quality profile to use for fetching movie.")
          .addChoices(
            ...radarrQualities.map((q) => {
              return { name: q.name, value: `${q.id}` };
            })
          )
          .setRequired(true)
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
