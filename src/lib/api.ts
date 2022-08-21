import axios, { AxiosError, AxiosResponse } from "axios";
import path from "path";

export default class API {
  public readonly type: "radarr" | "sonarr";
  public readonly base: string; // Radarr/Sonarr base url
  private readonly key: string; // API key

  constructor(type: "radarr" | "sonarr") {
    this.type = type;
    this.base = type === "radarr" ? process.env.RADARR_URL! : process.env.SONARR_URL!;
    this.key = type === "radarr" ? process.env.RADARR_KEY! : process.env.SONARR_KEY!;

    console.log(type, this.base);
  }

  public async getQualities() {
    const res = await this.request("get", "qualityprofile");
    if (res.status === 200) {
      return res.data;
    }

    throw new Error(`Error getting quality profiles:` + res.status + res.data);
  }

  public async getLanguages() {
    if (this.type === "radarr") throw new Error("Error fetching language profiles: Radarr not supported.");

    const res = await this.request("get", "languageprofile");
    console.log("getLanguages", res.status, res.data);
    if (res.status === 200) {
      if (res.data.length <= 0) throw new APIError(`Was unable to fetch language profiles ${this.type}`);
      return res.data;
    }

    throw new Error(`Error getting root folder:` + res.status + res.data);
  }

  public async getRootFolder() {
    const res = await this.request("get", "rootfolder");
    console.log("getRootFolder", res.status, res.data);
    if (res.status === 200) {
      if (res.data.length <= 0) throw new APIError(`Was unable to fetch root folder configuration from ${this.type}`);
      return res.data;
    }

    throw new Error(`Error getting root folder:` + res.status + res.data);
  }

  public async search(term: string): Promise<any[]> {
    const res = await this.request("get", this.type === "radarr" ? "movie/lookup" : "series/lookup", { term: term });
    console.log("search", term, res);
    if (res.status === 200) {
      if (res.data.length <= 0) throw new APIError("Couldn't find any content from search.");
      return res.data;
    }

    throw new Error(`Error searching for content on ${this.type}:` + res.status + res.data);
  }

  public async add(imdbId: string, qualityId: number | string) {
    const {
      0: content // we are returned an array, just get first movie/series from it, since we know there will only be one
    } = await this.search(`imdb:${imdbId}`);

    console.log("content", content);
    console.log("content folder", content.folder);
    if (!content.folder || !content.title) throw new APIError("Content search didn't return all info required.");

    const {
      0: folder // cba bro we only gonna get first root folder showing up
    } = await this.getRootFolder();

    const reqData = {
      ...content,
      path: path.join(String(folder.path), String(content.folder)),
      qualityProfileId: Number(qualityId)
    };

    if (this.type === "radarr") {
      const toMonitor = process.env.RADARR_MONITOR == "true" ? true : false;
      reqData.monitored = toMonitor;
      reqData.addOptions = {
        searchForMovie: toMonitor
      };
    } else if (this.type === "sonarr") {
      const {
        0: language // just get first language for now.
      } = await this.getLanguages();

      reqData.languageProfileId = language.id;
      reqData.addOptions = {
        monitor: process.env.SONARR_MONITOR,
        ignoreEpisodesWithFiles: true,
        searchForMissingEpisodes: process.env.SONARR_MONITOR ? true : false
      };
    }

    console.log("add request:", reqData);

    try {
      const res = await this.request("post", this.type === "radarr" ? "movie" : "series", undefined, reqData);
      if (res.status === 201) {
        return res.data;
      }
      throw new Error(`Error adding content on ${this.type}:` + res.status + res.data);
    } catch (err) {
      if (err instanceof AxiosError) {
        if (err.response?.status === 400 && err.response?.data) {
          let resData = err.response.data;
          for (let i = 0, n = resData.length; i < n; i++) {
            const errCode = resData[i].errorCode;
            if (errCode == "MovieExistsValidator" || errCode == "SeriesExistsValidator") {
              throw new APIError(`That ${this.type === "radarr" ? "movie" : "show"} is already on ${this.type}!`);
            }
          }
        }
      }
    }
  }

  private async request(
    type: "get" | "post",
    ep: string,
    sp?: { [key: string]: string },
    data?: Object
  ): Promise<AxiosResponse<any, any>> {
    const url = new URL(`${this.base}/api/v3/${ep}`);
    url.searchParams.append("apikey", this.key);
    for (const k in sp) {
      url.searchParams.append(k, sp[k]);
    }

    if (type === "get") {
      return axios.get(url.toString());
    }

    if (type === "post") {
      return axios.post(url.toString(), data);
    }

    throw new Error("Unsupported `type` arg passed.");
  }
}

/**
 * If we encounter an APIError, we know we can display the
 * error message to the user, since we must have thrown it.
 */
export class APIError extends Error {
  constructor(message: string) {
    super(message);
  }
}
