export interface User {
  userId: string;
  settings: UserSettings;
}

export interface UserSettings {
  /**
   * If bot should DM you for notifications instead of
   * replying in the same channel with a ping.
   */
  dmInstead: boolean;

  /**
   * If should auto subscribe to download notification
   * on content that you add.
   */
  autoSubscribe: boolean;

  /**
   * Array of events the user should be subscribed to.
   */
  events: EventType[];
}

export enum EventType {
  Grab = "GRAB",
  Import = "IMPORT"
}

export interface Event {
  imdbId: string;
  subscribers: string[];
  channelId: string;
}

/**
 * Default user settings to use when creating
 * new user/adding new setting to existing user.
 */
export const DefaultUserSettings: UserSettings = {
  dmInstead: false,
  autoSubscribe: true,
  events: [EventType.Grab, EventType.Import]
};
