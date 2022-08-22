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
    console.log("WEBHOOK:", req.body);

    // Get required content details first.
    let imdbId, title;

    if (req.body.movie) {
      imdbId = req.body.movie.imdbId;
      title = req.body.movie.title;
    } else if (req.body.series) {
      // TODO Series will need to be handled differently? because there is possibly an event fired for each episode if fetched individually
      imdbId = req.body.series.imdbId;
      title = req.body.series.title;
    }

    if (!imdbId) {
      console.error("Couldn't get imdbId from webhook data, ignoring.");
      res.status(400).send();
      return;
    }

    console.log("WebHook: Event Type:", req.body.eventType);
    switch (req.body.eventType?.toLowerCase()) {
      case "grab":
        notify(imdbId);
        break;
      case "moviedelete":
        // TODO: also wahtever the case is for series
        notify(imdbId);
        break;
    }

    res.status(200).send();
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
