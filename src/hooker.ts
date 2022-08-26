// Webhook
// Will listen to webhooks from radarr/sonarr
// for notifying users of finished downloads.
// Movies will notify when finished, series will notify when
// S01E01 finishes.

import express from "express";
import DB from "./db";
import { sendDM, sendMsgToChannel } from "./slavarr";

export default function startWebhooker() {
  console.log("Webhook listener starting...");
  const app = express();
  app.listen(3001);

  app.use(express.json());

  // TODO: two diff routes for movies/series
  // OR check the request host and match to radarr/sonarr urls set in env?
  app.post("/", (req, res) => {
    try {
      console.log("Webhook payload:", req.body);

      if (!req.body.eventType) {
        let err = "Webhook payload doesn't contain `eventType`, ignoring.";
        console.error(err);
        res.status(400).send(err);
        return;
      }

      // Get required content details first.
      let type: "radarr" | "sonarr", content;

      if (req.body.movie) {
        type = "radarr";
        content = req.body.movie;
      } else if (req.body.series) {
        // TODO Series will need to be handled differently? because there is possibly an event fired for each episode if fetched individually
        type = "sonarr";
        content = req.body.series;
      }

      if (!content || !content.imdbId || !content.title) {
        // TODO this error msg probably makes no sense
        let err = "Payload doesn't include all required fields (movie|series).(imdbId,title).";
        console.error(err);
        res.status(400).send(err);
        return;
      }

      let msg: string | undefined = undefined;
      switch (req.body.eventType.toLowerCase()) {
        case "import":
          msg = "was imported!";
          break;
        case "grab":
          msg = "was grabbed!";
          break;
        case "moviedelete":
          msg = "was removed from Radarr.";
          break;
        case "seriesdelete":
          msg = "was removed from Sonarr.";
          break;
      }
      if (msg) notify(content.imdbId, `\`${content.title}${content.year ? ` (${content.year})` : ""}\` ${msg}`);

      res.status(200).send();
    } catch (err) {
      console.error("Error occurred handling webhook payload:", err);
      res.status(500).send("Error occurred handling webhook payload. For more info please check the server log.");
    }
  });
}

function notify(imdbId: string) {
  console.log("hooker notify() called");
  const event = DB.getEvent(imdbId);
  if (!event) {
    console.log("No event in DB matching imdbId:", imdbId, ". Ignoring..");
    return;
  }

  console.log("Event fetched:", event);
  // const subscribers = event?.subscribers

  event?.subscribers.forEach((subId) => {
    const sub = DB.getUser(subId);
    if (!sub) {
      console.log("Couldn't find subscribers user in DB:", subId, ". Can't notify them.");
      return;
    }
    if (sub.settings.dmInstead) {
      sendDM(sub.userId, "Some event happened my brother");
    } else {
      // TODO: don't send a channel msg for each user, add them to array and ping them all in one msg
      sendMsgToChannel(event.channelId, "Some event happened my brother");
    }
  });
}
