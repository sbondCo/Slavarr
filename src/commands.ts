/**
 * Run to register / update slash commands.
 */

import { Routes, SlashCommandBuilder } from "discord.js";
import { REST } from "@discordjs/rest";
import axios from "axios";

/**
 * Initialize bot slash commands.
 */
export default async function initCommands() {
  try {
    console.log(
      "Commands: Requesting quality profiles from Radarr and Sonarr."
    );
    const { data: radarrQualities } = await axios.get(
      `${process.env.RADARR_URL}/api/v3/qualityprofile/?apikey=${process.env.RADARR_KEY}`
    );
    const { data: sonarrQualities } = await axios.get(
      `${process.env.SONARR_URL}/api/v3/qualityprofile/?apikey=${process.env.SONARR_KEY}`
    );
    console.log("Commands: Done fetching quality profiles.");

    const commands = [
      // Movie command
      new SlashCommandBuilder()
        .setName("movie")
        .setDescription("Add a movie to Radarr")
        .addStringOption((option) =>
          option
            .setName("name")
            .setDescription("Movie title.")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("quality")
            .setDescription("Quality profile to use for fetching the movie.")
            .addChoices(
              ...radarrQualities.map((q: any) => {
                return { name: q.name, value: `${q.id}` };
              })
            )
            .setRequired(true)
        ),

      // Series command
      new SlashCommandBuilder()
        .setName("series")
        .setDescription("Add a series to Sonarr")
        .addStringOption((option) =>
          option
            .setName("name")
            .setDescription("Series title.")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("quality")
            .setDescription("Quality profile to use for fetching the show.")
            .addChoices(
              ...sonarrQualities.map((q: any) => {
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
            .setDescription(
              "If bot should DM you for notifications instead of pinging in channel you ran the command."
            )
        )
        .addSubcommand((sc) =>
          sc
            .setName("auto_subscribe")
            .setDescription(
              "If you want to auto subscribe to events on content you have added."
            )
        )
        .addSubcommand((sc) =>
          sc
            .setName("events")
            .setDescription(
              "Manage content events that you want to be subscribed to."
            )
        ),
    ];

    const rest = new REST({ version: "10" }).setToken(process.env.DC_TOKEN!);

    console.log("Commands: Started refreshing application (/) commands.");

    await rest.put(Routes.applicationCommands(process.env.DC_CLIENT_ID!), {
      body: commands,
    });

    console.log("Commands: Successfully reloaded application (/) commands.");
  } catch (err: any) {
    console.error(err);
    if (err?.code === "ECONNRESET") {
      console.log("Commands: Retrying to initCommands after 10s");
      setTimeout(() => {
        initCommands();
      }, 10000);
    }
  }
}
