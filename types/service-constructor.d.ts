import { SERVICE_MULTIPLE, SERVICE_REQUIRE } from './di-service';

export interface ServiceConstructor {
    [SERVICE_MULTIPLE]?: boolean;
    [SERVICE_REQUIRE]?: NonNullable<any>[];
    new (...injections: any[]): InstanceType<this>;
}
