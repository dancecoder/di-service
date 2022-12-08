import { SERVICE_DESTROY, SERVICE_INIT } from './di-service';
import { ServiceConstructor } from './service-constructor';

export type ServiceInstance = ServiceConstructor & {
    [SERVICE_INIT]?: () => Promise<any>;
    [SERVICE_DESTROY]?: () => Promise<any>;
};
