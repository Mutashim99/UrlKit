import IORedis from "ioredis";

// ✅ NO second parameter at all — let rediss:// handle TLS implicitly
const redis = new IORedis("MOCK REDIS URL LMAO");

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
