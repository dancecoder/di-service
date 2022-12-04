import { SERVICE_MULTIPLE, SERVICE_REQUIRE } from './di-service';
import { ServiceInst } from './service-inst';

export interface ServiceClz {
    [SERVICE_MULTIPLE]?: boolean;
    [SERVICE_REQUIRE]?: ServiceClz[];
    new (...injections: ServiceInst[]): ServiceInst;
}
