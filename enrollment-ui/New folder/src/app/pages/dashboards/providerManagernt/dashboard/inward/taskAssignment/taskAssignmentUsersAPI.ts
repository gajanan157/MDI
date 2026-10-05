import { fetchUserAPI } from "@/store/features/Broker/BrokerApi";
import type { InwardTaskUserOption } from "./providerInwardTaskTypes";

type ApiUserRecord = {
  id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  username?: string;
  enabled?: boolean;
};

function asRecord(value: unknown): Record<string, unknown> | null {
  if (value == null || typeof value !== "object") return null;
  return value as Record<string, unknown>;
}

function extractUserRows(body: unknown): ApiUserRecord[] {
  const root = asRecord(body);
  if (!root) return [];

  const nested = asRecord(root.data);
  const candidates = [root.data, nested?.data, root.content, nested?.content];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate as ApiUserRecord[];
    }
  }

  return [];
}

function buildDisplayName(user: ApiUserRecord): string {
  const fullName = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim();
  if (fullName) return fullName;
  if (user.username?.trim()) return user.username.trim();
  if (user.email?.trim()) return user.email.trim();
  return user.id ?? "Unknown user";
}

function mapUserToOption(user: ApiUserRecord): InwardTaskUserOption | null {
  const id = String(user.id ?? "").trim();
  if (!id) return null;

  const name = buildDisplayName(user);
  const email = String(user.email ?? user.username ?? "").trim();

  return {
    id,
    name,
    email,
  };
}

/**
 * Loads assignable users from user-impersonation-service:
 * GET api/v1/users
 */
export async function fetchTaskAssignmentUsers(params?: {
  page?: number;
  size?: number;
}): Promise<InwardTaskUserOption[]> {
  const response = await fetchUserAPI({
    page: params?.page ?? 1,
    size: params?.size ?? 500,
  });

  const rows = extractUserRows(response);
  const options: InwardTaskUserOption[] = [];

  for (const row of rows) {
    if (row.enabled === false) continue;
    const option = mapUserToOption(row);
    if (option) options.push(option);
  }

  return options;
}
