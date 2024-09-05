export default class DescShardManager {
    constructor() {
        // A dummy descShards map to allow interact in librustdoc's DocSearch js
        this.descShards = new DummyMap();
        // The real crate -> desc shard map.
        this._descShards = new Map();
    }

    /**
     * @param {Map<string, {}>[]} descShards
     */
    static async create(...descShards) {
        const descShardManager = new DescShardManager();
        for (const descShard of descShards) {
            await descShardManager.addCrateDescShards(descShard);
        }
        return descShardManager;
    }

    /**
     * @param {Map<string, {}>} descShard
     */
    async addCrateDescShards(descShard) {
        this._descShards = new Map([...this._descShards, ...descShard]);
    }

    /** 
     * Load a single desc shard.
     * Compatible with librustdoc main.js.
     * 
     * @param {{descShard: any, descIndex: any}} descShards
     */
    async loadDesc({ descShard, descIndex }) {
        let crateDescShard = this._descShards.get(descShard.crate);
        if (!crateDescShard || crateDescShard.length === 0) {
            return null;
        }
        return crateDescShard[descShard.shard][descIndex];
    }
}

class DummyMap {
    set(_key, _value) { }
}
