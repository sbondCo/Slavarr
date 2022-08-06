import axios from "axios";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  ChatInputCommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder
} from "discord.js";
import path from "path";
import { NUMBER_EMOJIS } from "./../consts";

export function run(interaction: ChatInputCommandInteraction) {
  const name = interaction.options.getString("name");
  const quality = interaction.options.getString("quality");

  axios.get(`${process.env.RADARR_URL}/movie/lookup?apikey=${process.env.RADARR_KEY}&term=${name}`).then((res) => {
    const movies = res.data.splice(0, 5);
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
            .setCustomId(`movie:${movie.tmdbId}:${quality}`)
            .setEmoji(`${NUMBER_EMOJIS[k]}`)
            .setStyle(k == 0 ? ButtonStyle.Primary : ButtonStyle.Secondary)
        );
      }
    }

    let table = [];
    let longest = [0, 0, 0];

    // 1. Calculate longest text for each column and store in `longest` array.
    for (const k in rows) {
      const row = rows[k];
      for (const rk in row) {
        const ri = String(row[rk]);
        if (longest[rk] < ri.length) longest[rk] = ri.length;
      }
    }

    // 2. Add rows to `table` array and pad every cell to match longest one.
    for (const k in rows) {
      const row = rows[k];
      const tmp = [];
      for (const rk in row) {
        const ri = String(row[rk]);
        tmp.push(ri.padEnd(longest[rk]));
      }
      table.push(tmp);
    }

    // 3. Join each row in table (adding a seperator) to `tbl` string.
    let tbl = "";
    for (let i = 0; i < table.length; i++) {
      const row = table[i];
      const rowCont = row.join(" | ");
      tbl += rowCont;
      tbl += "\n";
      tbl += "".padEnd(rowCont.length, "-");
      tbl += "\n";
    }

    interaction.reply({
      content: "```" + tbl + "```",
      components: [new ActionRowBuilder<ButtonBuilder>().addComponents(...buttons)]
    });
  });
}

export async function button(interaction: ButtonInteraction, args: string[]) {
  const { 0: customId, 1: qualityId } = args;
  console.log("button reached", customId, qualityId);

  if (!customId) return;

  const {
    data: { 0: movie } // we are returned an array, just get first movie from it, since we know there will only be one
  } = await axios.get(`${process.env.RADARR_URL}/movie/lookup/?apikey=${process.env.RADARR_KEY}&term=tmdb:${customId}`);

  // console.log(movie);

  const {
    data: { 0: folder } // cba bro we only gonna get first root folder showing up
  } = await axios.get(`${process.env.RADARR_URL}/rootFolder?apikey=${process.env.RADARR_KEY}`);

  const addMovieData = {
    ...movie,
    path: path.join(String(folder.path), String(movie.folder)),
    qualityProfileId: Number(qualityId),
    monitored: true,
    addOptions: {
      searchForMovie: false
    }
  };

  console.log("Adding movie:", addMovieData);

  const addMovieRes = await axios.post(
    `${process.env.RADARR_URL}/movie?apikey=${process.env.RADARR_KEY}`,
    addMovieData
  );
  console.log("Add movie req returned code:", addMovieRes.status);
  if (addMovieRes.status === 201) {
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
}
