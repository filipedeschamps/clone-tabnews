"use client";

import useSWR from "swr";
import { fetchStatus } from "./fetch-status.js";

export function UpdatedAt({ fallbackData }) {
  const { data, isLoading } = useSWR("/api/v1/status", fetchStatus, {
    refreshInterval: 2000,
    fallbackData,
  });

  if (isLoading) {
    return <p>Carregando...</p>;
  }

  return <time>{data.updated_at}</time>;
}
