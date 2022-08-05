import { Client, Collection } from "discord.js";
import "dotenv/config";
import fs from "fs";
import path from "path";

console.log("Starting Slaverr");
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
  commands.set(command.data.name, command);
}

client.once("ready", () => {
  console.log("Slavarr ready");
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = commands.get(interaction.commandName);

  if (!command) return;

  try {
    await command.run(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({ content: "Error encountered performing request ;--(", ephemeral: true });
  }
});
