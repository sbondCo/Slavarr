import axios from "axios";

test("webhook", async () => {
  let req = await axios.post("http://localhost:3001", {
    eventType: "MovieDelete",
    movie: { imdbId: "t123124345", title: "The terminhater" }
  });
  expect(req.status).toBe(200);
});
