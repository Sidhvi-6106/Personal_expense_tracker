const configuredApiUrl = import.meta.env.VITE_API_URL || "";

if (!configuredApiUrl && import.meta.env.DEV) {
  console.info(
    "VITE_API_URL is not set. Using Vite proxy/relative API paths."
  );
}

export const API_BASE_URL =
  import.meta.env.PROD && configuredApiUrl.includes("localhost")
    ? ""
    : configuredApiUrl.replace(/\/$/, "");
