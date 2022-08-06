import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  ChatInputCommandInteraction,
  EmbedBuilder
} from "discord.js";
import API from "../lib/api";
import { makeATable } from "../lib/helpMe";
import { NUMBER_EMOJIS } from "./../consts";

const api = new API("radarr");

export async function run(interaction: ChatInputCommandInteraction) {
  const name = interaction.options.getString("name");
  const quality = interaction.options.getString("quality");

  if (!name || !quality) {
    console.error("Attempted to run movie command without name or quality args.");
    console.error("----> name:", name, "quality id:", quality);
    return;
  }

  const movies = (await api.search(name)).splice(0, 5);
  const buttons = [];

  if (!movies || movies.length <= 0) {
    interaction.reply(`Couldn't find any movies matching ${name}`);
    return;
  }

  // Create `rows` array to be used in table later.
  // First el in array is the headers, rest will be content.
  const rows = [];
  rows.push(["ID", "Name", "Year"]);

  for (const _k in movies) {
    if (Object.prototype.hasOwnProperty.call(movies, _k)) {
      const k = Number(_k);

      const movie = movies[k];
      rows.push([k, movie.title, movie.year]);

      buttons.push(
        new ButtonBuilder()
          .setCustomId(`movie:${movie.imdbId}:${quality}`)
          .setEmoji(`${NUMBER_EMOJIS[k]}`)
          .setStyle(k == 0 ? ButtonStyle.Primary : ButtonStyle.Secondary)
      );
    }
  }

  const table = makeATable(rows);

  interaction.reply({
    content: "```" + table + "```",
    components: [new ActionRowBuilder<ButtonBuilder>().addComponents(...buttons)]
  });
}

export async function button(interaction: ButtonInteraction, args: string[]) {
  const { 0: imdbId, 1: qualityId } = args;
  console.log("button reached", imdbId, qualityId);

  if (!imdbId || !qualityId) return;

  const movie = await api.add(imdbId, qualityId);

  interaction.message.edit({
    embeds: [
      new EmbedBuilder()
        .setTitle(`${movie.title}`)
        .addFields(
          { name: "Year", value: `${movie.year}`, inline: true },
          { name: "IMDb", value: `[Link](https://www.imdb.com/title/${movie.imdbId})`, inline: true },
          { name: "TMDB", value: `[Link](https://www.themoviedb.org/movie/${movie.tmdbId})`, inline: true },
          { name: "Genres", value: `${movie.genres.join(", ")}`, inline: false }
          // { name: "Overview", value: `${movie.overview.slice(0, 100)}...`, inline: false }
        )
        .setImage(movie.images[0].remoteUrl)
        .setTimestamp()
        .setFooter({ text: "Search started" })
    ],
    content: "",
    components: [] // Empty arr to remove existing buttons
  });
}
