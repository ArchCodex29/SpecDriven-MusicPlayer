interface ChromePermissions {
  permissions?: string[];
  origins?: string[];
}

interface ChromePermissionsApi {
  contains(permissions: ChromePermissions): Promise<boolean>;
  request(permissions: ChromePermissions): Promise<boolean>;
}

interface ChromeApi {
  permissions?: ChromePermissionsApi;
}

declare global {
  interface Window {
    chrome?: ChromeApi;
  }
}

export function getServerOrigin(serverUrl: string): string {
  const url = new URL(serverUrl);
  if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash) {
    throw new Error('Use an HTTPS server URL without credentials, query parameters, or a fragment.');
  }
  return `${url.protocol}//${url.host}/*`;
}

export async function ensureServerPermission(serverUrl: string): Promise<boolean> {
  const permissions = window.chrome?.permissions;
  if (!permissions) {
    return true;
  }

  const origin = getServerOrigin(serverUrl);
  const alreadyGranted = await permissions.contains({ origins: [origin] });
  if (alreadyGranted) {
    return true;
  }

  return permissions.request({ origins: [origin] });
}
