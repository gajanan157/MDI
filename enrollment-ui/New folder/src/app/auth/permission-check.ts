function normalizeResource(resource: string): string {
  return String(resource ?? "").trim();
}

function parentResource(resource: string): string {
  const idx = resource.lastIndexOf(".");
  return idx > 0 ? resource.slice(0, idx) : "";
}

function isProviderModule(resource: string): boolean {
  const r = normalizeResource(resource);
  return (
    r === "provider" ||
    r.startsWith("provider.") ||
    r.startsWith("provider-")
  );
}

function hasProviderAdminAccess(permissions: ReadonlySet<string>): boolean {
  return (
    permissions.has("provider.admin") 
  );
}

/** Resources that require explicit `.write` even for provider admins. */
const PROVIDER_ADMIN_WRITE_EXCLUDED = new Set([
  "provider-bank-details",
]);

/** Strict write: only exact resource permission (or admin wildcard). */
export function canWrite(
  permissions: ReadonlySet<string>,
  resource: string,
): boolean {
  if (!permissions) return false;
  const r = normalizeResource(resource);
  if (!r) return false;
  if (
    hasProviderAdminAccess(permissions) &&
    isProviderModule(r) &&
    !PROVIDER_ADMIN_WRITE_EXCLUDED.has(r)
  ) {
    return true;
  }
  return (
    permissions.has("*") ||
    permissions.has(`${r}.write`)
  );
}

/** Write without provider-admin bypass � for sensitive sub-modules like bank details. */
export function canWriteStrict(
  permissions: ReadonlySet<string>,
  resource: string,
): boolean {
  if (!permissions) return false;
  const r = normalizeResource(resource);
  if (!r) return false;
  return permissions.has("*") || permissions.has(`${r}.write`);
}

export function canRead(
  permissions: ReadonlySet<string>,
  resource: string,
): boolean {
  if (!permissions) return false;
  const r = normalizeResource(resource);
  if (!r) return false;
  if (permissions.has("*")) return true;
  if (permissions.has(r) || permissions.has(`${r}.read`) || canWrite(permissions, r)) return true;

  let parent = parentResource(r);
  while (parent) {
    if (permissions.has(`${parent}.read`)) return true;
    parent = parentResource(parent);
  }
  return false;
}