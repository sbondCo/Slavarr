// https://techfort.github.io/LokiJS/
import loki from "lokijs";

export default class DB {
  private static db?: LokiConstructor = undefined;
  private static _settings?: Collection<any> = undefined;
  private static _events?: Collection<any> = undefined;

  public static get settings() {
    if (this._settings) return this._settings;

    this._settings = this.db!.addCollection("settings");
    return this._settings;
  }

  public static init() {
    if (this.db) return;

    this.db = new loki("slavarr.db", {
      autoload: true,
      autoloadCallback: () => {
        // Store user settings.
        this._settings = this.db!.getCollection("settings");
        // Store the events that users subscribe to for specific content.
        this._events = this.db!.getCollection("events");

        // // Create collections if not exist.
        if (this._settings === null) this._settings = this.db!.addCollection("settings");
        if (this._events === null) this._events = this.db!.addCollection("events");
      },
      autosave: true,
      autosaveInterval: 4000
    });
  }
}
