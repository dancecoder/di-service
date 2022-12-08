import { InjectableFunction } from './injectable-function';
import { ServiceConstructor } from './service-constructor';

declare const SERVICE_MULTIPLE: unique symbol;
declare const SERVICE_REQUIRE: unique symbol;
declare const SERVICE_INIT: unique symbol;
declare const SERVICE_DESTROY: unique symbol;

export class DIService {
    static define<T>(deps: { new (...params: any) }[], ctor: T): T;
    execute<T>(fn: InjectableFunction<T>, params?: any[]): Promise<T>;
    getInstance<T extends ServiceConstructor>(ctor: T): Promise<InstanceType<T>>;
    deleteInstance(ctor: ServiceConstructor): Promise<void>;
    destroy(): Promise<void>;
}
