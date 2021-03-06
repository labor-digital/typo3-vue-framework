/*
 * Copyright 2019 LABOR.digital
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * Last modified: 2019.12.12 at 13:54
 */

import {getPath, hasPath, isArray, isPlainObject, isString, isUndefined} from "@labor-digital/helferlein";
import Vue, {CreateElement, VNode} from "vue";
import Meta from "vue-meta";
import VueRouter, {RouterOptions} from "vue-router";
import DefaultPageLayoutComponent from "../../Component/DefaultPageLayoutComponent";
import OuterAppComponent from "../../Component/OuterAppComponent";
import routeComponent from "../../Component/RouteComponent";
import {SpaAppConfigInterface} from "../Config/SpaAppConfigInterface";
import {AppContext} from "../Context/AppContext";
import {PageContext} from "../Context/PageContext";
import {FrameworkEventList} from "../Interface/FrameworkEventList";
import {LinkRepository} from "../Module/Spa/LinkRepository";
import {PageMeta} from "../Module/Spa/PageMeta";
import {PidRepository} from "../Module/Spa/PidRepository";
import {RouteHandler} from "../Module/Spa/RouteHandler";
import spaErrorHandler from "../Module/Spa/spaErrorHandler";
import {BasicBootstrap} from "./BasicBootstrap";

export class SpaBootstrap {
	
	/**
	 * Register the spa specific error handler in the context
	 * @param appContext
	 */
	public static registerConcreteErrorHandler(appContext: AppContext): Promise<AppContext> {
		appContext.errorHandler.setConcreteErrorHandler((context) => spaErrorHandler(context, appContext));
		return Promise.resolve(appContext);
	}
	
	/**
	 * Registers the required vue plugins for this bootstrap
	 */
	public static initialize(): void {
		Vue.use(VueRouter);
		Vue.use(Meta);
	}
	
	/**
	 * Creates a new page context instance and injects it into the app config object
	 * @param appContext
	 */
	public static registerPageContext(appContext: AppContext): Promise<AppContext> {
		// Prepare the base url
		const config: SpaAppConfigInterface = appContext.config;
		const isProd = config.environment === "production";
		let baseUrl = getPath(config, ["api", "baseUrl"], "");
		if (!isProd && hasPath(config, ["api", "devBaseUrl"])) baseUrl = config.api.devBaseUrl;
		config.baseUrl = baseUrl;
		
		// Prepare the layout components
		if (!isPlainObject(config.vue.layoutComponents)) config.vue.layoutComponents = {};
		if (isUndefined(config.vue.layoutComponents.default)) config.vue.layoutComponents.default = DefaultPageLayoutComponent;
		const layoutComponents = config.vue.layoutComponents;
		
		// Create the page context
		appContext.__setProperty("pageContext", new PageContext({
			siteUrl: baseUrl,
			appContext,
			layoutComponents,
			pidRepository: new PidRepository(appContext.store, appContext.eventEmitter),
			linkRepository: new LinkRepository(appContext)
		}));
		
		// Done
		return Promise.resolve(appContext);
	}
	
	/**
	 * Configures and registers the vue router instance and registers it in the context
	 * @param appContext
	 */
	public static registerRouter(appContext: AppContext): Promise<AppContext> {
		
		// Prepare the basic router config
		const config: SpaAppConfigInterface = appContext.config;
		let routerConfig: RouterOptions = {};
		if (hasPath(config, ["router", "vueRouter"]))
			routerConfig = config.router.vueRouter;
		if (hasPath(config, ["router", "basePath"]))
			routerConfig.base = "/" + BasicBootstrap.stripSlashes(config.router.basePath);
		if (isUndefined(routerConfig.mode))
			routerConfig.mode = "history";
		if (!isArray(routerConfig.routes))
			routerConfig.routes = [];
		
		// Create global route
		routerConfig.routes.push({
			name: "cmsRouter",
			path: "*",
			component: routeComponent,
			props: {
				context: appContext.pageContext
			},
			meta: {
				handler: new RouteHandler(appContext)
			}
		});
		
		// Create the new router instance
		return appContext.eventEmitter.emitHook(FrameworkEventList.HOOK_ROUTER_CONFIG_FILTER, {
				context: appContext,
				config: routerConfig
			})
			.then(args => {
				// Create the router instance and set it to the page context
				appContext.pageContext.__setProperty("router", new VueRouter(args.config));
				return appContext;
			});
	}
	
	/**
	 * Registers additional configuration and plugins for an app in spa mode
	 * @param appContext
	 */
	public static registerSpaVueConfig(appContext: AppContext): Promise<AppContext> {
		const vueConfig = appContext.config.vue.config;
		const config: SpaAppConfigInterface = appContext.config;
		
		// Prepare mountpoint
		vueConfig.el = hasPath(config, ["vue", "mountPoint"]) ? config.vue.mountPoint : "#app";
		
		// Register our render method and the router instance
		vueConfig.render = (createElement: CreateElement): VNode => createElement(OuterAppComponent);
		vueConfig.router = appContext.pageContext.router;
		
		// Initialize vue meta plugin
		const staticMeta = isUndefined(config.staticMeta) ? {} : config.staticMeta;
		const pageMeta = new PageMeta(staticMeta, appContext.eventEmitter);
		appContext.pageContext.__setProperty("pageMeta", pageMeta);
		vueConfig.metaInfo = function () {
			return pageMeta.metaInfo;
		};
		
		// Done
		return Promise.resolve(appContext);
	}
	
	/**
	 * Finalizes the boot sequence for the vue meta plugin
	 * @param appContext
	 */
	public static finalizePageMeta(appContext: AppContext): Promise<AppContext> {
		const metaPlugin = appContext.vue.$meta();
		appContext.pageContext.pageMeta.__setMetaPlugin(metaPlugin);
		appContext.vueRenderContext.meta = metaPlugin;
		return Promise.resolve(appContext);
	}
	
	/**
	 * Mounts the application either for the ssr or the browser renderer
	 * @param appContext
	 */
	public static mount(appContext: AppContext): Promise<Vue> | Vue {
		if (appContext.isServer) {
			// Set the router to the correct domain when we are running on the server
			return new Promise((resolve) => {
				// Helper to resolve the mount process when all errors have been processed
				const resolver = function () {
					appContext.errorHandler.waitForAllPromises().then(() => {
						resolve(appContext.vue);
					});
				};
				
				// Set the router url when we doing the server side rendering
				const router = appContext.pageContext.router;
				router.replace(
					isString(appContext.vueRenderContext.url) ? appContext.vueRenderContext.url : "/")
					.then((route) => {
						// Prevent error on a direct request -> Always redirect to home.
						if (route.name === "error") return router.push("/")
							.then(resolver);
						resolver();
					})
					.catch((e) => {
						// Skip if there was an error given
						if (!isUndefined(e)) return resolve(appContext.vue);
						
						// Register fallback
						const fallbackTimeout = setTimeout(() => {
							resolver();
						}, 5000);
						
						// We probably got a redirect! Wait until the router is ready
						router.onReady(() => {
							resolver();
							clearTimeout(fallbackTimeout);
						});
					});
			});
		} else {
			// Mount the client to the mountpoint
			appContext.vue.$mount(appContext.config.vue.config.el);
			return appContext.vue;
		}
	}
}