import { ChatInputCommandInteraction, SelectMenuInteraction } from "discord.js";
import { User } from "src/types";
import API from "../lib/api";
import { addContent, listContent } from "../lib/face";

const api = new API("sonarr");

export async function run(user: User, interaction: ChatInputCommandInteraction) {
  listContent(api, interaction);
}

export async function selectMenu(user: User, interaction: SelectMenuInteraction, args: string[]) {
  addContent(api, user, interaction, args);
}
