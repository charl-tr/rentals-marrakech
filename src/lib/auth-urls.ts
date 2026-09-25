const DEFAULT_ADMIN_PATH = "/admin";

export function getSafeAdminPath(value: string | null | undefined): string {
  if (!value?.startsWith("/") || value.startsWith("//")) {
    return DEFAULT_ADMIN_PATH;
  }

  return value;
}

export function getAuthOrigin(requestOrigin?: string | null): string {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (configuredUrl) {
    try {
      return new URL(configuredUrl).origin;
    } catch {
      console.error("[auth] NEXT_PUBLIC_SITE_URL est invalide");
    }
  }

  if (requestOrigin) {
    try {
      return new URL(requestOrigin).origin;
    } catch {
      console.error("[auth] Origin de requête invalide");
    }
  }

  return "http://localhost:3000";
}
