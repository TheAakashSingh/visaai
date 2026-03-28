# services/cache.py
import redis.asyncio as aioredis
import os

_redis = None

async def init_cache():
    global _redis
    try:
        _redis = aioredis.from_url(os.getenv("REDIS_URL", "redis://localhost:6379"), decode_responses=True)
        await _redis.ping()
        print("✅ Redis cache connected")
    except Exception as e:
        print(f"⚠️  Redis not available: {e}")
        _redis = None

async def get_cache(key: str):
    if not _redis: return None
    try: return await _redis.get(key)
    except: return None

async def set_cache(key: str, value: str, ttl: int = 300):
    if not _redis: return
    try: await _redis.setex(key, ttl, value)
    except: pass

async def delete_cache(key: str):
    if not _redis: return
    try: await _redis.delete(key)
    except: pass
