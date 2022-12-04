import { ServiceClz } from './service-clz';
import { InjectableFunction } from './injectable-function';

declare const SERVICE_MULTIPLE: unique symbol;
declare const SERVICE_REQUIRE: unique symbol;
declare const SERVICE_INIT: unique symbol;
declare const SERVICE_DESTROY: unique symbol;

export class DIService {
    static define<T>(deps: { new (...params: any) }[], ctor: T): T;
    execute<T>(fn: InjectableFunction<T>, params?: any[]): Promise<T>;
    getInstance<T extends ServiceClz>(ctor: T): Promise<InstanceType<T>>;
    deleteInstance(ctor: ServiceClz): Promise<void>;
    destroy(): Promise<void>;
}
