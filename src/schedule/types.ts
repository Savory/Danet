export type CronString = Parameters<typeof Deno.cron>[1];

export type CronMetadataPayload = { cron: CronString };
export type IntervalMetadataPayload = { interval: number };
