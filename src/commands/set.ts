import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  ChatInputCommandInteraction
} from "discord.js";
import DB from "../db";
import { EventType, User } from "../types";

export async function run(user: User, interaction: ChatInputCommandInteraction) {
  const subCmd = interaction.options.getSubcommand();
  if (!subCmd) return;

  const toggleDMInstead = async () => {
    if (user.settings.dmInstead) {
      user.settings.dmInstead = false;
      DB.updateUser(user);
    } else {
      // User set dmInstead to true.. test if we can PM them before updating their setting
      try {
        await interaction.user.send("You will now be notified here for content updates!"); // TODO: could be an embed to look nicer
      } catch (err) {
        console.log("User tried to update `dmInstead` to true, but test DM failed! Reverting change.:", err);
        user.settings.dmInstead = false;
        if (interaction.isRepliable())
          interaction.reply({
            content:
              "**dmInstead was not changed:** Failed to send you a test PM!\nThis could be because of your `privacy settings`. Click the server banner then privacy settings and make sure that `Direct Messages` is `enabled`.",
            ephemeral: true
          });
      } finally {
        user.settings.dmInstead = true;
        DB.updateUser(user);
      }
    }

    interaction.reply({
      content: `DM Instead (of ping in channel) ${user.settings.dmInstead ? "enabled" : "disabled"}`,
      ephemeral: true
    });
  };

  const toggleAutoSubscribe = () => {
    if (user.settings.autoSubscribe) user.settings.autoSubscribe = false;
    else user.settings.autoSubscribe = true;
    DB.updateUser(user);
    interaction.reply({
      content: `Auto Subscribe ${user.settings.autoSubscribe ? "enabled" : "disabled"}`,
      ephemeral: true
    });
  };

  const showEventsSelection = () => {
    try {
      const btns = generateEventBtns(user.settings.events);
      interaction.reply({
        content: "Click notification events below to enable/disable them.",
        components: [new ActionRowBuilder<ButtonBuilder>().addComponents(...btns)],
        ephemeral: true
      });
    } catch (err) {
      console.log("Errored whilst trying to show events selection to", user.userId, "-->", err);
      interaction.reply({
        content: "There was an issue trying to display the events selection menu. We sorri ;-(",
        ephemeral: true
      });
    }
  };

  switch (subCmd) {
    case "dm_instead":
      toggleDMInstead();
      break;
    case "auto_subscribe":
      toggleAutoSubscribe();
      break;
    case "events":
      showEventsSelection();
      break;
    default:
      interaction.reply({
        content: `Setting unknown to me ;----(`,
        ephemeral: true
      });
      break;
  }
}

export async function button(user: User, interaction: ButtonInteraction, args: string[]) {
  console.log("Set btn clicked", args);
  if (!args[0] || !args[1]) {
    console.log("Set btn reached without args at indexes 0 or 1 -->", args);
    return;
  }

  let { 0: which, 1: data } = args;

  const handleEventsBtn = () => {
    try {
      const ev = data as EventType;

      // Checking if event is in users events this way because it avoids us
      // needing to loop over the array twice, once checking with .includes,
      // then finally .filtering (if user is removing event). Let us pray for speed.
      const evLenB4 = user.settings.events.length;
      const usrEventsFiltered = user.settings.events.filter((e) => e !== ev);
      let msg;
      if (evLenB4 === usrEventsFiltered.length) {
        user.settings.events.push(ev);
        msg = `You are now **subscribed** to **${ev}** notifications.`;
      } else {
        user.settings.events = usrEventsFiltered;
        msg = `You have been **unsubscribed** from **${ev}** notifications.`;
      }
      DB.updateUser(user);

      const btns = generateEventBtns(user.settings.events);
      interaction
        .update({
          content: msg,
          components: [new ActionRowBuilder<ButtonBuilder>().addComponents(...btns)]
        })
        .catch((err) => {
          throw Error(err);
        });

      console.log("Users events:", user.settings.events);
    } catch (err) {
      console.log("Errored whilst typing to handle an events menu button:", err);
      interaction.update({
        content:
          "Sorry MR SIR. There was an error trying to update this event on your account. Please contact my owner if I keep erroring."
      });
    }
  };

  switch (which) {
    case "events":
      handleEventsBtn();
      break;
  }
}

function generateEventBtns(usersEvents: EventType[]) {
  let btns = [];
  for (const [key, value] of Object.entries(EventType)) {
    btns.push(
      new ButtonBuilder()
        .setCustomId(`set:events:${value}`)
        .setLabel(key)
        .setStyle(usersEvents.includes(value) ? ButtonStyle.Primary : ButtonStyle.Secondary)
    );
  }
  return btns;
}
