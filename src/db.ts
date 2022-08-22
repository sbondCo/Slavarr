// https://techfort.github.io/LokiJS/
import loki from "lokijs";
import { DefaultUserSettings, Event, User } from "./types";

export default class DB {
  private static db?: LokiConstructor = undefined;
  private static _users?: Collection<any> = undefined;
  private static _events?: Collection<any> = undefined;

  private static get users() {
    if (this._users) return this._users;
    throw new Error("DB.init() wasn't run or failed! Users collection not set.");
  }

  private static get events() {
    if (this._events) return this._events;
    throw new Error("DB.init() wasn't run or failed! Events collection not set.");
  }

  public static init() {
    if (this.db) return;

    this.db = new loki("slavarr.db", {
      autoload: true,
      autoloadCallback: () => {
        // For storing users.
        this._users = this.db!.getCollection("users");
        // Store the events that users subscribe to for specific content.
        this._events = this.db!.getCollection("events");

        // // Create collections if not exist.
        if (this._users === null) this._users = this.db!.addCollection("users", { indices: ["userId"] });
        if (this._events === null) this._events = this.db!.addCollection("events", { indices: ["imdbId"] });
      },
      autosave: true,
      autosaveInterval: 4000
    });
  }

  public static getUser(id: string | number): User {
    // Get user from DB, or create user entry in db here.
    let user = DB.users.findOne({ userId: id });

    // Add user if doesn't exist
    if (!user) {
      console.log("New user encountered, inserting into DB");
      user = DB.users.insertOne({ userId: id, settings: DefaultUserSettings });
    }

    // Ensure settings data on user
    if (!user.settings) user.settings = { dmInstead: DefaultUserSettings.dmInstead };
    if (user.settings.dmInstead === undefined || user.settings.dmInstead === null)
      user.settings.dmInstead = DefaultUserSettings.dmInstead;
    if (user.settings.autoSubscribe === undefined || user.settings.autoSubscribe === null)
      user.settings.autoSubscribe = DefaultUserSettings.autoSubscribe;

    return user as User;
  }

  public static getEvent(imdbId: string): Event | undefined {
    return DB.events.findOne({ imdbId: imdbId });
  }

  public static createEvent(imdbId: string, channelId: string, initialSubscriberId?: string) {
    console.log(`Creating event for ${imdbId}. Initial subscriber: ${initialSubscriberId}`);
    // If event already exists, dont add it again, just return it (after adding new subscriber).
    let event = DB.getEvent(imdbId);
    if (event) {
      console.log("Event already created.. not creating again.");
      if (initialSubscriberId && !event.subscribers.includes(initialSubscriberId))
        event.subscribers.push(initialSubscriberId);
      return event;
    }
    return DB.events.insertOne({ imdbId: imdbId, channelId: channelId, subscribers: [initialSubscriberId] } as Event);
  }

  public static subscribeToEvent(imdbId: string, subscriberId: string | number) {
    // TODO: get event, if not exist create, and add subscriberId to subscibers array.
  }
}
