import { createClient } from "redis";

const redis = createClient();
await redis.connect();

export default redis

await redis.flushDb()
console.log("done")

