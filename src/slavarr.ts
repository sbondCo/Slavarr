import { Client, Collection, MessagePayload, TextChannel, MessageCreateOptions } from "discord.js";
import "dotenv/config";
import fs from "fs";
import path from "path";
import startWebhooker from "./hooker";
import DB from "./db";
import { stopAbuse } from "./lib/helpMe";

console.log("Starting Slavarr");
console.log(
  "Invite URL:",
  `https://discord.com/api/oauth2/authorize?client_id=${process.env.DC_CLIENT_ID}&permissions=2147485696&scope=bot`
);

let missingEnvVars = [];
if (!process.env.BOT_WHITELIST) missingEnvVars.push("BOT_WHITELIST");
if (!process.env.BOT_MAX_CONTENT) missingEnvVars.push("BOT_MAX_CONTENT");
if (!process.env.DC_TOKEN) missingEnvVars.push("DC_TOKEN");
if (!process.env.DC_CLIENT_ID) missingEnvVars.push("DC_CLIENT_ID");
if (!process.env.RADARR_URL) missingEnvVars.push("RADARR_URL");
if (!process.env.RADARR_KEY) missingEnvVars.push("RADARR_KEY");
if (!process.env.RADARR_MONITOR) missingEnvVars.push("RADARR_MONITOR");
if (!process.env.SONARR_URL) missingEnvVars.push("SONARR_URL");
if (!process.env.SONARR_KEY) missingEnvVars.push("SONARR_KEY");
if (!process.env.SONARR_MONITOR) missingEnvVars.push("SONARR_MONITOR");
if (missingEnvVars.length > 0) {
  console.error(`Missing environment variables:\n- ${missingEnvVars.join("\n- ")}`);
  process.exit(1);
}

const client = new Client({
  intents: ["Guilds", "GuildMessages"]
});

client.login(process.env.DC_TOKEN);

const commands = new Collection<string, any>();
const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  commands.set(path.basename(filePath).replace(path.extname(filePath), ""), command);
}

client.once("ready", () => {
  console.log("Slavarr ready");
  DB.init();
  startWebhooker();
});

client.on("interactionCreate", async (interaction) => {
  try {
    if (!interaction.member?.user) {
      if (interaction.isRepliable())
        interaction.reply({ content: "Couldn't fetch your discord user.", ephemeral: true });
      return;
    }

    if (stopAbuse(interaction)) {
      console.log(
        "Non whitelisted user attempted to interact:",
        interaction.member.user.username,
        interaction.member.user.id
      );
      if (interaction.isRepliable())
        interaction.reply({ content: "You must be whitelisted to use this function.", ephemeral: true });
      return;
    }

    const user = DB.getUser(interaction.member.user.id);

    if (interaction.isChatInputCommand()) {
      const command = commands.get(interaction.commandName);
      if (!command) return;
      await command.run(user, interaction);
    } else if (interaction.isSelectMenu() && interaction.customId) {
      const scid = interaction.customId.split(":");
      const command = commands.get(scid[0]);
      if (!command) return;
      await command.selectMenu(user, interaction, scid.splice(1));
    } else if (interaction.isButton() && interaction.customId) {
      const scid = interaction.customId.split(":");
      const command = commands.get(scid[0]);
      if (!command) return;
      await command.button(user, interaction, scid.splice(1));
    } else {
      console.log("Unsupported interaction type encountered.");
    }
  } catch (error) {
    console.error(error);
    if (interaction.isRepliable())
      await interaction.reply({ content: "Error encountered performing request ;--(", ephemeral: true });
  }
});

export function sendMsgToChannel(channelId: string, msg: string | MessagePayload | MessageCreateOptions) {
  return (client.channels.cache.get(channelId) as TextChannel)?.send(msg);
}

export function sendDM(userId: string, msg: string | MessagePayload | MessageCreateOptions) {
  return client.users.cache.get(userId)?.send(msg);
}
