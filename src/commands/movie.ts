import { ChatInputCommandInteraction, SelectMenuInteraction } from "discord.js";
import { addContent, listContent } from "../lib/face";
import API from "../lib/api";
import { User } from "src/types";

const api = new API("radarr");

export async function run(user: User, interaction: ChatInputCommandInteraction) {
  listContent(api, interaction);
}

export async function selectMenu(user: User, interaction: SelectMenuInteraction, args: string[]) {
  addContent(api, user, interaction, args);
}
