import { ChatInputCommandInteraction } from "discord.js";
import { User } from "src/types";

export async function run(user: User, interaction: ChatInputCommandInteraction) {
  const subCmd = interaction.options.getSubcommand();
  if (!subCmd) return;

  const toggleDMInstead = () => {
    if (user.settings.dmInstead) user.settings.dmInstead = false;
    else user.settings.dmInstead = true;
    interaction.reply({
      content: `DM Instead (of ping in channel) ${user.settings.dmInstead ? "enabled" : "disabled"}`,
      ephemeral: true
    });
  };

  const toggleAutoSubscribe = () => {
    if (user.settings.autoSubscribe) user.settings.autoSubscribe = false;
    else user.settings.autoSubscribe = true;
    interaction.reply({
      content: `Auto Subscribe ${user.settings.autoSubscribe ? "enabled" : "disabled"}`,
      ephemeral: true
    });
  };

  switch (subCmd) {
    case "dm_instead":
      toggleDMInstead();
      break;
    case "auto_subscribe":
      toggleAutoSubscribe();
      break;
    default:
      interaction.reply({
        content: `Setting unknown to me ;----(`,
        ephemeral: true
      });
      break;
  }
}

// export async function button(interaction: SelectMenuInteraction, args: string[]) {
//
// }
