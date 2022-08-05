import axios from "axios";
import {
  ActionRowBuilder,
  APIEmbedField,
  ButtonBuilder,
  ButtonStyle,
  ChatInputCommandInteraction,
  EmbedBuilder,
  RestOrArray,
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
    const embedFields: RestOrArray<APIEmbedField> = [];
    const buttons = [];

    if (!movies || movies.length <= 0) {
      interaction.reply(`Couldn't find any movies matching ${name}`);
      return;
    }

    for (const _k in movies) {
      if (Object.prototype.hasOwnProperty.call(movies, _k)) {
        const k = Number(_k);

        const movie = movies[k];
        embedFields.push(
          { name: "ID", value: `${k}`, inline: true },
          { name: "Name", value: `${movie.title}`, inline: true },
          { name: "Year", value: `${movie.year}`, inline: true },
          { name: "\u200B", value: "\u200B" }
        );

        buttons.push(
          new ButtonBuilder()
            .setCustomId(`${movie.tmdbId}`)
            .setEmoji(`${NUMBER_EMOJIS[k]}`)
            .setStyle(k == 0 ? ButtonStyle.Primary : ButtonStyle.Secondary)
        );
      }
    }

    interaction.reply({
      embeds: [new EmbedBuilder().addFields(...embedFields)],
      components: [new ActionRowBuilder<ButtonBuilder>().addComponents(...buttons)]
    });
  });
}
