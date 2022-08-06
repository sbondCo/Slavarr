import { ButtonInteraction, ChatInputCommandInteraction } from "discord.js";
import { addContent, listContent } from "../lib/face";
import API from "../lib/api";

const api = new API("radarr");

export async function run(interaction: ChatInputCommandInteraction) {
  listContent(api, interaction);
}

export async function button(interaction: ButtonInteraction, args: string[]) {
  addContent(api, interaction, args);
}
