import { SERVICE_REQUIRE } from './di-service';

export interface InjectableFunction<T> {

    [SERVICE_REQUIRE]?: any[];

    (...params: any[]): T | Promise<T>;

}
