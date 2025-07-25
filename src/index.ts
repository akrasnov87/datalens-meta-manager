/* eslint-disable import/order */
import {nodekit} from './nodekit';

import {AppMiddleware, ExpressKit} from '@gravity-ui/expresskit';

import {registerAppPlugins} from './registry/register-app-plugins';
import {initSwagger} from './components/api-docs';
import {ctxInfo, finalRequestHandler} from './components/middlewares';
import {initTemporal} from './components/temporal/utils';
import {appAuth} from './components/auth/middlewares/app-auth';
import {rpcAuth} from './components/auth/middlewares/rpc-auth';
import {registry} from './registry';
import {getAppRoutes} from './routes';
import {setRegistryToContext} from './components/app-context';

setRegistryToContext(nodekit, registry);
registerAppPlugins();

const beforeAuth: AppMiddleware[] = [];
const afterAuth: AppMiddleware[] = [ctxInfo];

if (nodekit.config.appDevMode) {
    require('source-map-support').install();
}

if (nodekit.config.isAuthEnabled) {
    nodekit.config.appAuthHandler = appAuth;
} else {
    nodekit.config.appAuthHandler = rpcAuth;
}

nodekit.config.appFinalErrorHandler = finalRequestHandler;

if (require.main === module) {
    initTemporal({ctx: nodekit.ctx});
}

const routes = getAppRoutes(nodekit, {beforeAuth, afterAuth});

const app = new ExpressKit(nodekit, routes);
registry.setupApp(app);

if (nodekit.config.swaggerEnabled) {
    initSwagger(app, routes);
}

if (require.main === module) {
    app.run();
}

export default app;
