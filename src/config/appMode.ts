// src/config/appMode.ts
import { getAppMode } from "../utils/getAppMode";

export const APP_MODE = getAppMode();

export const isPWA = APP_MODE === "pwa";
