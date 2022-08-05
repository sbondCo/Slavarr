import axios from "axios";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChatInputCommandInteraction,
  SlashCommandBuilder
} from "discord.js";
import { NUMBER_EMOJIS } from "./../consts";

export const data = new SlashCommandBuilder()
  .setName("movie")
  .setDescription("Add a movie to Radarr")
  .addStringOption((option: any) => option.setName("name").setDescription("Movie name").setRequired(true));

export function run(interaction: ChatInputCommandInteraction) {
  const name = interaction.options.getString("name");

  axios.get(`${process.env.RADARR_URL}/movie/lookup?apikey=${process.env.RADARR_KEY}&term=${name}`).then((resp) => {
    const movies = resp.data.splice(0, 5);
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
            .setCustomId(`${movie.tmdbId}`)
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
      const rowCont = row.join("  ");
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
