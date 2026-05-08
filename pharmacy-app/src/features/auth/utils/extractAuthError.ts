import { extractApiError, getHttpStatus } from "@core/errors/httpError";
import {
  AUTH_INVALID_CREDENTIALS_MESSAGE,
  GENERIC_AUTH_MESSAGES,
} from "@auth/types/auth.constants";

export function extractAuthError(err: unknown): string {
  const message = extractApiError(err);
  const status = getHttpStatus(err);

  if (
    (status === 400 || status === 401) &&
    GENERIC_AUTH_MESSAGES.has(message)
  ) {
    return AUTH_INVALID_CREDENTIALS_MESSAGE;
  }

  return message;
}
