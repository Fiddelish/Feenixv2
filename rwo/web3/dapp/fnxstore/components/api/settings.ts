import { Configuration } from "rwo_ts_sdk";

export function getApiSettings() : Configuration {
    const mySettings = new Configuration();
    mySettings.accessToken = "token";
    mySettings.basePath = "/api";
    return mySettings;
}
