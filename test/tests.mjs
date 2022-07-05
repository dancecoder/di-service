import test from 'node:test';
import { strict as assert } from 'assert';
import { ServiceGraph, SERVICE_REQUIRE } from '../service-graph.js';

class A {}
class B {
    static [SERVICE_REQUIRE] = [A];
    a;
    constructor(a) {
        this.a = a;
    }
}
class C {
    static [SERVICE_REQUIRE] = [B];
    b;
    constructor(b) {
        this.b = b;
    }
}
class D {
    static [SERVICE_REQUIRE] = [C, B, A];
    c;
    b;
    a;
    constructor(c, b, a) {
        this.c = c;
        this.b = b;
        this.a = a;
    }
}

function CircularA() {}
CircularA[SERVICE_REQUIRE] = [CircularC];
function CircularB() {}
CircularB[SERVICE_REQUIRE] = [CircularA];
function CircularC() {}
CircularC[SERVICE_REQUIRE] = [CircularB];


test('it should execute function with declared dependencies', async () => {
    fn[SERVICE_REQUIRE] = [A, B];
    function fn(a, b) { return { a, b } }
    const services = new ServiceGraph();
    const result = await services.execute(fn);
    assert.equal(result.a instanceof A, true);
    assert.equal(result.b instanceof B, true);
});

test('it should execute function with declared dependencies and predefined parameters', async () => {
    fn[SERVICE_REQUIRE] = [A, B];
    function fn(text, a, b) { return { text, a, b } }
    const services = new ServiceGraph();
    const result = await services.execute(fn, ['hi there']);
    assert.equal(result.text, 'hi there');
    assert.equal(result.a instanceof A, true);
    assert.equal(result.b instanceof B, true);
});

test('it should create instance with no dependencies', async () => {
    const services = new ServiceGraph();
    const a = await services.getInstance(A);
    assert.equal(a instanceof A, true);
});

test('it should create instance with a dependency', async () => {
    const services = new ServiceGraph();
    const b = await services.getInstance(B);
    assert.equal(b instanceof B, true);
    assert.equal(b.a instanceof A, true);
});

test('it should create instance with dependency chain', async () => {
    const services = new ServiceGraph();
    const c = await services.getInstance(C);
    assert.equal(c instanceof C, true);
    assert.equal(c.b instanceof B, true);
    assert.equal(c.b.a instanceof A, true);
});

test('it should create instance with dependency graph', async () => {
    const services = new ServiceGraph();
    const d = await services.getInstance(D);
    assert.equal(d instanceof D, true);
    assert.equal(d.a instanceof A, true);
    assert.equal(d.b instanceof B, true);
    assert.equal(d.b.a instanceof A, true);
    assert.equal(d.c instanceof C, true);
    assert.equal(d.c.b instanceof B, true);
    assert.equal(d.c.b.a instanceof A, true);
    assert.equal(d.c.b === d.b, true);
    assert.equal(d.c.b.a === d.a, true);
});

test('it should throw on circular dependency', async () => {
    const services = new ServiceGraph();
    await assert.rejects(services.getInstance(CircularC), {
        name: 'Error',
        message: 'Circular dependency detected: CircularC->CircularB->CircularA->CircularC'
    });
});

test('it should decorate function or class', async () => {
    const fn = ServiceGraph.define([A], a => ({ a })); // Public Morozov anti-pattern, do not do it in real code
    const clz = ServiceGraph.define([A], class {
        constructor(a) { this.a = a }
    });

    const services = new ServiceGraph();

    const result = await services.execute(fn);
    assert.equal(result.a instanceof A, true);

    const inst = await services.getInstance(clz);
    assert.equal(inst.a instanceof A, true);
});
