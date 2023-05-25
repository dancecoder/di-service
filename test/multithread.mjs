import test from 'node:test';
import { strict as assert } from 'node:assert';
import { Worker } from 'node:worker_threads';
import { DIService, SERVICE_INIT } from '../di-service.mjs';

let counter = 0;

class TestClass {
    constructor() {
        counter++;
        this.id = counter;
    }

    async [SERVICE_INIT]() {
        return new Promise(r => setTimeout(r, 42));
    }
}


test('getInstance is async circle safe', async () => {
    counter = 0;
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

test('getInstance is thread safe', async () => {
    counter = 0;
    const max = 5;
    const w = new Worker(`
        const { parentPort } = require('node:worker_threads');
        let count = 0;
        const h = setInterval(() => { 
            parentPort.postMessage(count);
            if (++count === ${max}) {
                clearInterval(h);
            } 
        }, 12);     
    `, { eval: true }); // eval is not safe in general, but this is just a small test
    const services = new DIService();
    const promises = [];
    const subject = new class {
        subs(s) { this.s = s }
        next() { this.s() }
        wait() { return new Promise((r) => this.subs(r))  }
    }
    w.on('message', (v) => {
        promises.push(services.getInstance(TestClass));
        if (v === max-1) {
            subject.next();
        }
    });
    await subject.wait();

    const instances = await Promise.all(promises);
    assert.equal(counter, 1);
    assert.equal(instances.length, max);
    for (let i = 1; i < max; i++) {
        assert.equal(instances[0], instances[i]);
    }

});

