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
}

export const DefaultUserSettings: UserSettings = {
  dmInstead: false,
  autoSubscribe: true
};

export interface Event {
  imdbId: string;
  subscribers: string[];
  channelId: string;
}
