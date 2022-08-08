import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  ChatInputCommandInteraction,
  EmbedBuilder
} from "discord.js";
import { NUMBER_EMOJIS } from "../consts";
import API, { APIError } from "./api";
import { makeATable } from "./helpMe";

export async function listContent(api: API, interaction: ChatInputCommandInteraction) {
  try {
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
      interaction.reply({ content: `Couldn't find any content matching **${name}**`, ephemeral: true });
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
  } catch (err) {
    if (err instanceof APIError) {
      interaction.reply({ content: err.message, ephemeral: true });
    } else {
      console.error("Encountered standard error trying to listContent:", err);
      interaction.reply({ content: "Errored whilst attempting to list searched content.", ephemeral: true });
    }
  }
}

export async function addContent(api: API, interaction: ButtonInteraction, args: string[]) {
  try {
    const { 0: imdbId, 1: qualityId } = args;
    console.log("button reached", imdbId, qualityId);

    if (!imdbId || !qualityId) return;

    const content = await api.add(imdbId, qualityId);
    let poster = content.images.find((e: any) => e.coverType === "poster")?.remoteUrl;
    if (!poster && content?.images && content.images[0]?.remoteUrl) {
      poster = content.images[0]?.remoteUrl;
    }

    interaction.message.edit({
      embeds: [
        new EmbedBuilder()
          .setTitle(`${content.title}`)
          .addFields(
            { name: "Year", value: `${content.year}`, inline: true },
            { name: "IMDb", value: `[Link](https://www.imdb.com/title/${content.imdbId})`, inline: true },

            api.type === "sonarr"
              ? { name: "TVDB", value: `[Link](https://thetvdb.com/?tab=series&id=${content.tvdbId})`, inline: true }
              : { name: "TMDB", value: `[Link](https://www.themoviedb.org/movie/${content.tmdbId})`, inline: true },

            { name: "Genres", value: `${content.genres.join(", ")}`, inline: false }
            // { name: "Overview", value: `${content.overview.slice(0, 100)}...`, inline: false }
          )
          .setImage(poster)
          .setTimestamp()
          .setFooter({ text: "Search started" })
      ],
      content: "",
      components: [] // Empty arr to remove existing buttons
    });
  } catch (err) {
    interaction.message.edit({ components: [] });

    if (err instanceof APIError) {
      interaction.reply({ content: err.message, ephemeral: true });
    } else {
      console.error("Encountered standard error trying to addContent:", err);
      interaction.reply({
        content: "Errored whilst adding the selected content. Try running your command again plos.",
        ephemeral: true
      });
    }
  }
}
