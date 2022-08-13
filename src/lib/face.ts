import {
  ActionRowBuilder,
  APISelectMenuOption,
  ChatInputCommandInteraction,
  EmbedBuilder,
  SelectMenuBuilder,
  SelectMenuInteraction
} from "discord.js";
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

    const content = (await api.search(name)).splice(0, Number(process.env.BOT_MAX_CONTENT));
    const options: Array<APISelectMenuOption> = [];

    if (!content || content.length <= 0) {
      interaction.reply({ content: `Couldn't find any content matching **${name}**`, ephemeral: true });
      return;
    }

    const rows: string[][] = [];
    rows.push(["Name", "Year"]);

    for (const _k in content) {
      const k = Number(_k);
      const show = content[k];
      console.log("ratings", show.ratings);
      rows.push([show.title, show.year]);
      options.push({
        label: show.title,
        description: show.overview ? show.overview.slice(0, 100) : "Overview unavailable",
        value: `${show.imdbId}`
      });
    }

    console.log("Select Options", options);

    const table = makeATable(rows);

    interaction.reply({
      content: "```CSS\n" + table + "\n```",
      components: [
        new ActionRowBuilder<SelectMenuBuilder>().addComponents(
          new SelectMenuBuilder()
            .setCustomId(`${api.type === "radarr" ? "movie" : "series"}:${quality}`)
            .setPlaceholder("Select the content to download...")
            .addOptions(options)
          // Going to leave it as single select menu for now
          // .setMinValues(1)
          // .setMaxValues(content.length)
        )
      ]
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

export async function addContent(api: API, interaction: SelectMenuInteraction, args: string[]) {
  try {
    const { 0: qualityId } = args;
    const imdbId = interaction.values[0];

    console.log("addContent", imdbId, qualityId);

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

            { name: "Genres", value: `${content.genres.join(", ")}`, inline: true },

            api.type === "sonarr"
              ? { name: "Sonarr", value: `[Link](${api.base}/series/${content.titleSlug})`, inline: true }
              : { name: "Radarr", value: `[Link](${api.base}/movie/${content.tmdbId})`, inline: true }
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
