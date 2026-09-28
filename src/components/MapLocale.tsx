"use client";

import { createContext, useContext } from "react";
import type { Locale } from "@/lib/i18n/routes";

export const MapLocale = createContext<Locale>("fr");
export const useMapLocale = () => useContext(MapLocale);
