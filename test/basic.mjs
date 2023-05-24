import test from 'node:test';
import { strict as assert } from 'node:assert';
import {DIService, SERVICE_DESTROY, SERVICE_INIT, SERVICE_REQUIRE} from '../di-service.mjs';

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
    const services = new DIService();
    const result = await services.execute(fn);
    assert.equal(result.a instanceof A, true);
    assert.equal(result.b instanceof B, true);
});

test('it should execute function with declared dependencies and predefined parameters', async () => {
    fn[SERVICE_REQUIRE] = [A, B];
    function fn(text, a, b) { return { text, a, b } }
    const services = new DIService();
    const result = await services.execute(fn, ['hi there']);
    assert.equal(result.text, 'hi there');
    assert.equal(result.a instanceof A, true);
    assert.equal(result.b instanceof B, true);
});

test('it should create instance with no dependencies', async () => {
    const services = new DIService();
    const a = await services.getInstance(A);
    assert.equal(a instanceof A, true);
});

test('it should create instance with a dependency', async () => {
    const services = new DIService();
    const b = await services.getInstance(B);
    assert.equal(b instanceof B, true);
    assert.equal(b.a instanceof A, true);
});

test('it should create instance with dependency chain', async () => {
    const services = new DIService();
    const c = await services.getInstance(C);
    assert.equal(c instanceof C, true);
    assert.equal(c.b instanceof B, true);
    assert.equal(c.b.a instanceof A, true);
});

test('it should create instance with dependency graph', async () => {
    const services = new DIService();
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
    const services = new DIService();
    await assert.rejects(services.getInstance(CircularC), {
        name: 'Error',
        message: 'Circular dependency detected: CircularC->CircularB->CircularA->CircularC'
    });
});

test('it should decorate function or class', async () => {
    const fn = DIService.define([A], a => ({ a })); // Public Morozov anti-pattern, do not do it in real code
    const clz = DIService.define([A], class {
        constructor(a) { this.a = a }
    });

    const services = new DIService();

    const result = await services.execute(fn);
    assert.equal(result.a instanceof A, true);

    const inst = await services.getInstance(clz);
    assert.equal(inst.a instanceof A, true);
});

test('id should cal service initialization method', async () => {
    let initialized = false;
    const Init = class {
        [SERVICE_INIT] = function() {
            initialized = true;
        }
    }
    const services = new DIService();
    const instance = await services.getInstance(Init);
    assert.equal(initialized, true);
    assert.equal(instance instanceof Init, true);
});

test('it should call service instance destructor on DIService destroy', async () => {
    let destroyed = false;
    const destroyable = class {
        [SERVICE_DESTROY] = function() {
            destroyed = true;
        }
    }
    const services = new DIService();
    const instance = await services.getInstance(destroyable);
    await services.destroy();
    assert.equal(destroyed, true);
    assert.equal(instance instanceof destroyable, true);
});

test('it should remove instance and all dependants graph from internal cache', async () => {
    let destroyed1 = false;
    let destroyed2 = false;
    let constructed1 = 0;
    let constructed2 = 0;
    const destroyable1 = class {
        constructor() {
            constructed1++;
        }
        [SERVICE_DESTROY]() {
            destroyed1 = true;
        };
    }
    const destroyable2 = class {
        static [SERVICE_REQUIRE] = [ destroyable1 ];
        constructor() {
            constructed2++;
        }
        [SERVICE_DESTROY]() {
            destroyed2 = true;
        };
    }
    const services = new DIService();
    const instance0 = await services.getInstance(destroyable2);
    await services.deleteInstance(destroyable1); // removing destroyable1 and expect all requiring instances will be removed too
    const instance1 = await services.getInstance(destroyable2);
    assert.equal(destroyed1, true);
    assert.equal(destroyed2, true);
    assert.equal(constructed1, 2);
    assert.equal(constructed2, 2);
    assert.equal(instance0 instanceof destroyable2, true);
    assert.equal(instance1 instanceof destroyable2, true);

});
