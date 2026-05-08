// type LogLevel = "info" | "warn" | "error" | "debug";
import { ENV } from "@core/config/env";

class Logger {
  private isProd = ENV.MODE === "production";

  info(message: string, data?: unknown) {
    console.info(message, data ?? "");
  }

  warn(message: string, data?: unknown) {
    console.warn(message, data ?? "");
  }

  error(message: string, data?: unknown) {
    console.error(message, data ?? "");
    // future: send to monitoring service
  }

  debug(message: string, data?: unknown) {
    if (!this.isProd) {
      console.debug(message, data ?? "");
    }
  }
}

export const logger = new Logger();