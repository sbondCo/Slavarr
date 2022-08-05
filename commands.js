/**
 * Run to register / update slash commands.
 */

const { Routes } = require("discord.js");
const { REST } = require("@discordjs/rest");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

if (!process.env.DC_CLIENT_ID) {
  console.log("Missing DC_CLIENT_ID");
  process.exit(1);
}

const commands = [];
const commandsDir = path.join(__dirname, "out", "commands");
for (const file of fs.readdirSync(commandsDir).filter((file) => file.endsWith(".js"))) {
  const command = require(path.join(commandsDir, file));
  commands.push(command.data.toJSON());
}

const rest = new REST({ version: "10" }).setToken(process.env.DC_TOKEN);

(async () => {
  try {
    console.log("Started refreshing application (/) commands.");

    await rest.put(Routes.applicationCommands(process.env.DC_CLIENT_ID), { body: commands });

    console.log("Successfully reloaded application (/) commands.");
  } catch (error) {
    console.error(error);
  }
})();
