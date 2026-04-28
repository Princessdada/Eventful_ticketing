import NodeCache from "node-cache";

class CacheService {
    private cache: NodeCache;

    constructor(ttlSeconds: number = 600) {
        this.cache = new NodeCache({ stdTTL: ttlSeconds, checkperiod: ttlSeconds * 0.2 });
    }

    get<T>(key: string): T | undefined {
        return this.cache.get<T>(key);
    }

    set<T>(key: string, value: T, ttl: number | string = 600): boolean {
        return this.cache.set(key, value, ttl);
    }

    del(keys: string | string[]): number {
        return this.cache.del(keys);
    }

    flush(): void {
        this.cache.flushAll();
    }
}

export default new CacheService();
