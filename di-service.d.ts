export class DIService {
    static define<T>(deps: { new (...params: any) }[], ctor: T): T;
    execute<T>(fn: (...params) => T | Promise<T>, params?: any[]): Promise<T>;
    getInstance<T extends { new (...params: any) }>(ctor: T): Promise<InstanceType<T>>;
    destroy(): Promise<void>;
}
