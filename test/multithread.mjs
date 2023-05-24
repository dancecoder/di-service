import test from 'node:test';
import { strict as assert } from 'node:assert';
import {DIService, SERVICE_INIT} from '../di-service.mjs';

let counter = 0;

class TestClass {
    constructor() {
        counter++;
        this.id = counter;
    }

    async [SERVICE_INIT]() {
        return new Promise((r) => setTimeout(() => r(), 10));
    }
}


test('getInstance is async circle safe', { only: true }, async () => {
    const services = new DIService();
    const promises = [];
    const max = 5;
    for (let i = 0; i < max; i++) {
        promises.push(services.getInstance(TestClass));
    }
    const instances = await Promise.all(promises);
    assert.equal(counter, 1);
    assert.equal(instances.length, max);
    for (let i = 1; i < max; i++) {
        assert.equal(instances[0], instances[i]);
    }
});

