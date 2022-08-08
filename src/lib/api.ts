import axios, { AxiosResponse } from "axios";
import path from "path";

export default class API {
  public readonly type: "radarr" | "sonarr";
  private base: string; // API base url
  private key: string; // API key

  constructor(type: "radarr" | "sonarr") {
    this.type = type;
    this.base = type === "radarr" ? process.env.RADARR_URL! : process.env.SONARR_URL!;
    this.key = type === "radarr" ? process.env.RADARR_KEY! : process.env.SONARR_KEY!;

    console.log(type, this.base);
  }

  public async getQualities() {
    const res = await this.request("get", this.type === "radarr" ? "qualityprofile" : "profile");
    if (res.status === 200) {
      return res.data;
    }

    throw new Error(`Error getting quality profiles:` + res.status + res.data);
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
    console.log("search", term, res.status);
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

    const {
      0: folder // cba bro we only gonna get first root folder showing up
    } = await this.getRootFolder();

    const reqData = {
      ...content,
      path: path.join(String(folder.path), String(content.folder)),
      qualityProfileId: Number(qualityId),
      monitored: true
    };

    if (this.type === "radarr") {
      reqData.addOptions = {
        searchForMovie: false
      };
    } else if (this.type === "sonarr") {
      reqData.addOptions = {
        monitor: "all",
        searchForMissingEpisodes: false
      };
    }

    const res = await this.request("post", this.type === "radarr" ? "movie" : "series", undefined, reqData);
    if (res.status === 201) {
      return res.data;
    }
    throw new Error(`Error searching for content on ${this.type}:` + res.status + res.data);
  }

  private async request(
    type: "get" | "post",
    ep: string,
    sp?: { [key: string]: string },
    data?: Object
  ): Promise<AxiosResponse<any, any>> {
    const url = new URL(`${this.base}/${ep}`);
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
