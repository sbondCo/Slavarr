import { ChatInputCommandInteraction, SelectMenuInteraction } from "discord.js";
import API from "../lib/api";
import { addContent, listContent } from "../lib/face";

const api = new API("sonarr");

export async function run(interaction: ChatInputCommandInteraction) {
  listContent(api, interaction);
}

export async function button(interaction: SelectMenuInteraction, args: string[]) {
  addContent(api, interaction, args);
}
