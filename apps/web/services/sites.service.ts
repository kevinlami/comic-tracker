import type { Site } from "@/types/comic";
import { apiFetch } from "./api-client";

/** Lista os sites cadastrados via `GET /sites`. */
export function fetchSites(): Promise<Site[]> {
  return apiFetch<Site[]>("/sites");
}
