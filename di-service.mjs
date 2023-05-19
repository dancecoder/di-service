
export const SERVICE_MULTIPLE = Symbol('Do not cache instance');
export const SERVICE_REQUIRE = Symbol('Array of required services (classes)');
export const SERVICE_INIT = Symbol('Service initialize method');
export const SERVICE_DESTROY = Symbol('Service destroy method');

/**
 * Provide class instances graph with dependency injection and caching
 * */
export class DIService {

    #servicesMap = new Map();

    /**
     * @template R
     * @template {ServiceConstructor | InjectableFunction<R>} T
     * @param {ServiceConstructor[]} deps
     * @param {T} ctor
     * @return T
     * */
    static define(deps, ctor) {
        ctor[SERVICE_REQUIRE] = [...deps];
        return ctor;
    }

    /**
     * @template T
     * @param {InjectableFunction<T>} fn
     * @param {any[]} [params=[]] pre defined parameters
     * @return {Promise<T>}
     * */
    async execute(fn, params = []) {
        const pp = [...params];
        if (fn[SERVICE_REQUIRE]?.length > 0) {
            for (const rq of fn[SERVICE_REQUIRE]) {
                pp.push(await this.getInstance(rq));
            }
        }
        return Promise.resolve(fn(...pp));
    }

    /**
     * @return {Promise<void>}
     * */
    async destroy() {
        for (const inst of this.#servicesMap.values()) {
            if(typeof inst[SERVICE_DESTROY] === 'function'){
                await inst[SERVICE_DESTROY]();
            }
        }

        this.#servicesMap = null;
    }

    /**
     * @template {ServiceConstructor} T
     * @param {T} ctor
     * @return {Promise<InstanceType<T>>}
     * */
    async getInstance(ctor) {
        if (ctor[SERVICE_MULTIPLE] === true) {
            return this.#createInstance(ctor);
        }
        if (!this.#servicesMap.has(ctor)) {
            const inst = await this.#createInstance(ctor);
            this.#servicesMap.set(ctor, inst);
        }
        return this.#servicesMap.get(ctor);
    }

    /**
     * @template {ServiceConstructor} T
     * @param {T} ctor
     * @return {Promise<InstanceType<T>>}
     * */
    async #createInstance(ctor) {
        let result = null;
        const stack = [{ ctor, params: [] }];
        while (stack.length > 0) {
            const top = stack[stack.length-1];
            const req = top.ctor[SERVICE_REQUIRE] ?? [];
            const par = top.params;
            if (req.length === par.length) {
                const inst = new top.ctor(...par);
                if (inst[SERVICE_INIT] != null) {
                    await Promise.resolve(inst[SERVICE_INIT]());
                }
                stack.pop();
                if (stack.length === 0) {
                    // top level instance should be pushed to cache by caller
                    result = inst;
                    break;
                } else {
                    this.#servicesMap.set(top.ctor, inst);
                }
                stack[stack.length-1].params.push(inst);
            }
            const nextReq = req[top.params.length];
            if (nextReq == null){
                if (req.length > top.params.length){
                    throw new Error('Incorrect service requirements: undefined requirement');
                }
            } else {
                if (this.#servicesMap.has(nextReq)) {
                    top.params.push(this.#servicesMap.get(nextReq));
                } else {
                    const circular = stack.some(item => item.ctor === nextReq);
                    if (circular) {
                        const path = stack.map(item => item.ctor.name);
                        throw new Error(`Circular dependency detected: ${path.join('->')}->${nextReq.name}`);
                    } else {
                        stack.push({ ctor: nextReq, params: [] });
                    }
                }
            }
        }
        return result;
    }

    /**
     * @param {ServiceConstructor} ctor
     * @return {Promise<void>}
     * */
    async deleteInstance(ctor) {
        for (const dep of this.#servicesMap.keys()) {
            if (dep[SERVICE_REQUIRE] != null && dep[SERVICE_REQUIRE].some(rq => rq === ctor)) {
                await this.deleteInstance(dep);
            }
        }
        const inst = this.#servicesMap.get(ctor);
        if (inst != null) {
            if (typeof inst[SERVICE_DESTROY] === 'function') {
                await inst[SERVICE_DESTROY]();
            }
            this.#servicesMap.delete(ctor);
        }
    }
}
