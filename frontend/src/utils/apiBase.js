const configuredApiUrl = import.meta.env.VITE_API_URL || "";

export const API_BASE_URL =
  import.meta.env.PROD && configuredApiUrl.includes("localhost")
    ? ""
    : configuredApiUrl.replace(/\/$/, "");
