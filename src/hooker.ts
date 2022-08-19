// Webhook
// Will listen to webhooks from radarr/sonarr
// for notifying users of finished downloads.
// Movies will notify when finished, series will notify when
// S01E01 finishes.

import express from "express";

export default function startWebhooker() {
  console.log("Webhook listener starting...");
  const app = express();
  app.listen(3001);

  app.use(express.json());

  // TODO: two diff routes for movies/series
  // OR check the request host and match to radarr/sonarr urls set in env?
  app.post("/", (req, res) => {
    console.log("WEBHOOK:", req.body);
    res.status(200).send();
  });
}
