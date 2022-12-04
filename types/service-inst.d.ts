import { SERVICE_DESTROY, SERVICE_INIT } from './di-service';

export interface ServiceInst {
    [SERVICE_INIT]?: () => Promise<any>;
    [SERVICE_DESTROY]?: () => Promise<any>;
}
