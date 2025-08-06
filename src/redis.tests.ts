import IORedis from "ioredis";

// ✅ NO second parameter at all — let rediss:// handle TLS implicitly
const redis = new IORedis("redis://default:bg4kXqn3tryvWKbZF7QaWQfIbDWaEpU5@redis-15862.c252.ap-southeast-1-1.ec2.redns.redis-cloud.com:15862");

async function test() {
  try {
    await redis.set("foo", "bar");
    const result = await redis.get("foo");
    console.log("✅ Redis Connected. Value:", result);
    process.exit(0);
  } catch (err) {
    console.error("❌ Connection failed", err);
    process.exit(1);
  }
}

test();
