import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  ChatInputCommandInteraction,
  EmbedBuilder
} from "discord.js";
import { NUMBER_EMOJIS } from "../consts";
import API from "./api";
import { makeATable } from "./helpMe";

export async function listContent(api: API, interaction: ChatInputCommandInteraction) {
  const name = interaction.options.getString("name");
  const quality = interaction.options.getString("quality");

  if (!name || !quality) {
    console.error("Attempted to run command without name or quality args.");
    console.error("----> name:", name, "quality id:", quality);
    return;
  }

  const content = (await api.search(name)).splice(0, 5);
  const buttons = [];

  if (!content || content.length <= 0) {
    interaction.reply(`Couldn't find any content matching ${name}`);
    return;
  }

  for (const _k in content) {
    const k = Number(_k);
    const show = content[k];
    buttons.push(
      new ButtonBuilder()
        .setCustomId(`${api.type === "radarr" ? "movie" : "series"}:${show.imdbId}:${quality}`)
        .setEmoji(`${NUMBER_EMOJIS[k]}`)
        .setStyle(k == 0 ? ButtonStyle.Primary : ButtonStyle.Secondary)
    );
  }

  const table = makeATable(content);

  interaction.reply({
    content: "```" + table + "```",
    components: [new ActionRowBuilder<ButtonBuilder>().addComponents(...buttons)]
  });
}

export async function addContent(api: API, interaction: ButtonInteraction, args: string[]) {
  const { 0: imdbId, 1: qualityId } = args;
  console.log("button reached", imdbId, qualityId);

  if (!imdbId || !qualityId) return;

  const content = await api.add(imdbId, qualityId);

  interaction.message.edit({
    embeds: [
      new EmbedBuilder()
        .setTitle(`${content.title}`)
        .addFields(
          { name: "Year", value: `${content.year}`, inline: true },
          { name: "IMDb", value: `[Link](https://www.imdb.com/title/${content.imdbId})`, inline: true },

          api.type === "radarr"
            ? { name: "TVDB", value: `[Link](https://thetvdb.com/?tab=series&id=${content.tvdbId})`, inline: true }
            : { name: "TMDB", value: `[Link](https://www.themoviedb.org/movie/${content.tmdbId})`, inline: true },

          { name: "Genres", value: `${content.genres.join(", ")}`, inline: false }
          // { name: "Overview", value: `${content.overview.slice(0, 100)}...`, inline: false }
        )
        .setImage(content.images[0].remoteUrl)
        .setTimestamp()
        .setFooter({ text: "Search started" })
    ],
    content: "",
    components: [] // Empty arr to remove existing buttons
  });
}
