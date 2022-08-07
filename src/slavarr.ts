import { Client, Collection } from "discord.js";
import "dotenv/config";
import fs from "fs";
import path from "path";
import { stopAbuse } from "./lib/helpMe";

console.log("Starting Slavarr");
console.log(
  "Invite URL:",
  `https://discord.com/api/oauth2/authorize?client_id=${process.env.DC_CLIENT_ID}&permissions=3072&scope=bot`
);

if (!process.env.DC_TOKEN) {
  console.log("Missing args");
  process.exit(1);
}

const client = new Client({
  intents: ["Guilds", "GuildMessages", "DirectMessages"]
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
});

client.on("interactionCreate", async (interaction) => {
  try {
    if (stopAbuse(interaction)) {
      console.log(
        "Non whitelisted user attempted to interact:",
        interaction.member?.user?.username,
        interaction.member?.user?.id
      );
      if (interaction.isRepliable())
        interaction.reply({ content: "You must be whitelisted to use this function.", ephemeral: true });
      return;
    }

    console.log("isButton:", interaction.isButton());
    if (interaction.isChatInputCommand()) {
      const command = commands.get(interaction.commandName);
      if (!command) return;
      await command.run(interaction);
    } else if (interaction.isButton() && interaction.customId) {
      const scid = interaction.customId.split(":");
      const command = commands.get(scid[0]);
      if (!command) return;
      await command.button(interaction, scid.splice(1));
    } else {
      console.log("Unsupported interaction type encountered.");
    }
  } catch (error) {
    console.error(error);
    // await interaction.reply({ content: "Error encountered performing request ;--(", ephemeral: true });
  }
});
