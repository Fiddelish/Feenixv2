import { getApiSettings } from "./settings";
import {
    OrderApi
} from "rwo_ts_sdk";

export function orderApi(): OrderApi {
    const myApi = new OrderApi(getApiSettings());
    return myApi;
}
