import { env } from "../config";

export const FINAL_STATUSES = ["finished", "lost", "false"];
export const CRON_EXPRESSION = `*/${env.POLLING_INTERVAL_MINUTES} * * * *`;
