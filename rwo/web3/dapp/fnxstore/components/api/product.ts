import { getApiSettings } from "./settings";
import {
    ProductApi
} from "rwo_ts_sdk";

export function getProductApi() : ProductApi {
    const myApi = new ProductApi(getApiSettings());
    return myApi;
}
