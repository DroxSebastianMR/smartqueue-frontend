export const QUEUE_STATUS_TTL_SECONDS = 2;
export const QUEUE_VERSION_TTL_SECONDS = 86_400;
export const queueVersionKey = (eventId: string) => `queue:version:${eventId}`;
