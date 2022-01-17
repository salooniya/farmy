/* ==== src/asm ==== Advance State Manager ==== */

/* ==== Key ====*/

const Key = function (o) {
    this.new = true;
    this.const = o.const;
    this.type = o.type;
    this.value = o.value;
    this.subs = [];
    this.new = false;
};

Key.prototype.subscribe = function (fn) {
    // add subscriber fn
    this.subs.push(fn);

    // return this
    return fn;
};

Key.prototype.unsubscribe = function (...fns) {
    // remove subscriber fn
    this.subs = this.subs.filter(sub => !fns.includes(sub));

    // return this
    return this;
};

Object.defineProperties(Key.prototype, {

    const: {
        get: function () {
            return this.keyConst;
        },
        set: function (keyConst) {
            return this.keyConst = keyConst;
        }
    },

    type: {
        get: function () {
            return this.keyType;
        },
        set: function (keyType) {
            return this.keyType = keyType;
        }
    },

    value: {
        get: function () {
            return this.keyValue;
        },
        set: function (keyValue) {
            // if key is constant
            if (!this.new && this.const) throw Error(`key is constant`);

            // if keyType does not match keyValue
            if (this.new) {
                if (this.type !== null && keyValue !== undefined && keyValue.constructor !== this.type) throw Error(`key type does not match value`);
            } else {
                if (this.type !== null && keyValue.constructor !== this.type) throw Error(`key type does not match value`);
            }

            // run subscribers
            this.subs.forEach(sub => sub(keyValue, this.value));

            return this.keyValue = keyValue;
        }
    }

});

/* ==== State ====*/

const State = function () {
    this.keys = {};
    this.opts = {};
    this.subs = [];
};

// Public Static API

State.Key = Key;

State.new = function (fn) {
    // create state
    const state = new State();

    // run fn
    state.run(fn);

    // return state
    return state;
};

// Public API

State.prototype.const = function (keyType, keyName, keyValue) {
    // check opts
    this.checkOpts();

    // get key
    let key = this.get(keyName);

    // key already exist
    if (key) throw Error(`key  ${keyName} already exist`);

    // create key
    key = new Key({
        const: true,
        type: keyType,
        value: keyValue
    });

    // set key
    this.set(keyName, key);

    // return this
    return this;
};

State.prototype.let = function (keyType, keyName, keyValue) {
    // check opts
    this.checkOpts();

    // get key
    let key = this.get(keyName);

    // key already exist
    if (key) throw Error(`key  ${keyName} already exist`);

    // create key
    key = new Key({
        const: false,
        type: keyType,
        value: keyValue
    });

    // set key
    this.set(keyName, key);

    // return this
    return this;
};

State.prototype.get = function (keyName) {
    // get key
    let key = this.keys[keyName];

    // return key
    return key;
};

State.prototype.set = function (keyName, key) {
    // check opts
    this.checkOpts(false);

    // set key
    this.keys[keyName] = key;

    // return this
    return this;
};

State.prototype.delete = function (keyName) {
    // check opts
    this.checkOpts();

    // get key
    let key = this.get(keyName);

    // delete key
    delete this.keys[keyName];

    // return key
    return key;
};

State.prototype.checkOpts = function (checkFreeze = true) {
    // check seal
    if (this.opts.seal) throw Error('state is sealed');

    // check freeze
    if (checkFreeze && this.opts.freeze) throw Error('state is frozen');
};

State.prototype.seal = function () {
    // seal state (-CD)
    this.opts.seal = true;

    // return this
    return this;
};

State.prototype.unseal = function () {
    // unseal state
    this.opts.seal = false;

    // return this
    return this;
};

State.prototype.freeze = function () {
    // freeze state (-CUD)
    this.opts.freeze = true;

    // return this
    return this;
};

State.prototype.unfreeze = function () {
    // unfreeze state
    this.opts.freeze = false;

    // return this
    return this;
};

State.prototype.subscribe = function (fn) {
    // add subscriber fn
    this.subs.push(fn);

    // return this
    return fn;
};

State.prototype.unsubscribe = function (...fns) {
    // remove subscriber fn
    this.subs = this.subs.filter(sub => !fns.includes(sub));

    // return this
    return this;
};

State.prototype.run = function (fn) {
    return fn(this);
};

/* LocalDB */

const random = function (start, end) {
    return start + Math.floor(Math.random()*(end-start+1));
};

const createID = function (bit32 = false) {
    const power = bit32 ? 32 : 16;
    const timestamp = Date.now();
    const salt = random(+`100${'0'.repeat(power - 16)}`, +`999${'9'.repeat(power - 16)}`);
    const numID = + `${timestamp}${salt}`;
    const hexID = numID.toString(power);
    return hexID;
};

const timer = function (t) {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve();
        }, t);
    });
};

class Collection {
    constructor (name, data) {
        this.name = name;
        this.data = data;
    }

    async set (name, data) {
        this.data[name] = data;
        return this;
    }

    async create (doc) {
        await timer(1);
        doc.ID = createID();
        this.data[doc.ID] = doc;
        return doc;
    }

    async get (ID) {
        return this.data[ID];
    }

    async update (ID, newDoc, replace = false) {
        if (replace) {
            this.data[ID] = newDoc;
        } else {
            const doc = this.data[ID];
            for (const key in newDoc) {
                if (key === 'ID') continue;
                doc[key] = newDoc[key];
            }
        }
        return this.data[ID];
    }

    async delete (ID) {
        const doc = this.data[ID];
        delete this.data[ID];
        return doc;
    }

}

class LocalDB {
    constructor (name) {
        this.name = name;
        this.data = JSON.parse(localStorage.getItem(this.name)) || {};
    }

    collection (collectionName) {
        const data = this.data[collectionName] || {};
        this.data[collectionName] = data;
        return new Collection(collectionName, data);
    }

    save () {
        localStorage.setItem(this.name, JSON.stringify(this.data));
    }

    reset () {
        localStorage.setItem(this.name, JSON.stringify({}));
    }
}

State.LocalDB = LocalDB;
State.Collection = Collection;
State.createID = createID;
State.timer = timer;
State.random = random;

/* ==== export ==== */

export default State;
