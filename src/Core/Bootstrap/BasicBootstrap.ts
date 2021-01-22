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
 * Last modified: 2019.12.12 at 11:20
 */

import {cloneList} from "@labor-digital/helferlein";
import {EventBus} from "@labor-digital/helferlein/lib/Events/EventBus";
import {EventEmitter} from "@labor-digital/helferlein/lib/Events/EventEmitter";
import {PlainObject} from "@labor-digital/helferlein/lib/Interfaces/PlainObject";
import {forEach} from "@labor-digital/helferlein/lib/Lists/forEach";
import {merge} from "@labor-digital/helferlein/lib/Lists/merge";
import {getPath} from "@labor-digital/helferlein/lib/Lists/Paths/getPath";
import {hasPath} from "@labor-digital/helferlein/lib/Lists/Paths/hasPath";
import {isFunction} from "@labor-digital/helferlein/lib/Types/isFunction";
import {isObject} from "@labor-digital/helferlein/lib/Types/isObject";
import {isPlainObject} from "@labor-digital/helferlein/lib/Types/isPlainObject";
import {isString} from "@labor-digital/helferlein/lib/Types/isString";
import {isUndefined} from "@labor-digital/helferlein/lib/Types/isUndefined";
import {AxiosInstance, AxiosRequestConfig} from "axios";
import Vue, {ComponentOptions} from "vue";
import VueI18n from "vue-i18n";
import ContentElementChildrenComponent from "../../Component/ContentElementChildrenComponent";
import ContentElementComponent from "../../Component/ContentElementComponent";
import {BasicAppConfigInterface} from "../Config/BasicAppConfigInterface";
import {AppContext, AppEnvironmentType, AppMode, VueEnvironmentType} from "../Context/AppContext";
import {ErrorHandler} from "../ErrorHandling/ErrorHandler";
import {FrameworkEventList} from "../Interface/FrameworkEventList";
import {JsonApi} from "../JsonApi/IdeHelper";
import {Store} from "../Module/General/Store";
import {Translation} from "../Module/General/Translation";

const axios = require("axios").default;

export class BasicBootstrap {
	
	/**
	 * True as soon as vue is initialized at least once
	 * @protected
	 */
	protected static _vueIsInitialized = false;
	
	/**
	 * Initializes the "only once" configuration of vue that must not take place for every app.
	 * @param config
	 */
	public static initialize(config: BasicAppConfigInterface): BasicAppConfigInterface {
		// Prepare config
		if (!isPlainObject(config)) config = {};
		
		// Prepare the environment
		let environment: AppEnvironmentType = config.environment;
		if (environment !== "production" && environment !== "development")
			environment = getPath(process, ["env", "NODE_ENV"], typeof process.env.NODE_ENV === "string" ? process.env.NODE_ENV : "production");
		config.environment = environment;
		
		// Prepare the vue environment
		if (!isPlainObject(config.vue)) config.vue = {};
		let vueEnvironment: VueEnvironmentType = getPath(config, ["vue", "vueEnvironment"]);
		if (vueEnvironment !== "client" && vueEnvironment !== "server")
			vueEnvironment = getPath(process, ["env", "VUE_ENV"], typeof process.env.VUE_ENV === "string" ? process.env.VUE_ENV : "client");
		config.vue.vueEnvironment = vueEnvironment;
		
		// Register our internal components
		Vue.component("content-element", ContentElementComponent);
		Vue.component("content-element-children", ContentElementChildrenComponent);
		
		// Register plugins
		Vue.use(VueI18n);
		
		return config;
	}
	
	/**
	 * Creates the app context object and returns it as a promise
	 * @param mode
	 * @param config
	 * @param vueRenderContext
	 */
	public static makeAppContext(mode: AppMode, config: BasicAppConfigInterface, vueRenderContext?: PlainObject): Promise<AppContext> {
		// Make a deep copy of the configuration, so we don't pollute the globals.
		config = cloneList(config);
		
		// Initialize the error handler
		const errorHandler = new ErrorHandler(getPath(config, ["errorHandling"], {}));
		
		// Register global error handler in browser
		const useGlobalErrorHandler = getPath(config, ["errorHandling", "registerGlobalErrorHandler"], true);
		if (useGlobalErrorHandler && config.vue.vueEnvironment === "client")
			window.onerror = function (message, source, lineno, colno, error) {
				
				// Ignore external, global errors
				if ((message + "").indexOf("webpack-internal://") === -1) return;
				
				const e = errorHandler.makeGlobalError(message);
				e.addAdditionalPayload({source, lineno, colno, error});
				errorHandler.emitError(e);
			};
		
		// Apply the additional config if it exists
		if (isFunction(config.additionalConfiguration))
			config.additionalConfiguration({
				type: config.environment,
				mode: mode,
				vueContext: vueRenderContext,
				envVars: config.vue.vueEnvironment === "client" ?
					getPath(window, ["VUE_ENV"], {}) :
					getPath(vueRenderContext, ["env"],
						getPath(process, ["env"], {}))
			}, config);
		
		// Prepare the event emitter
		const eventEmitter: EventEmitter | any = config.vue.vueEnvironment === "client" ?
			EventBus.getEmitter() : new EventEmitter();
		
		let context = undefined;
		if (isPlainObject(config.events))
			forEach(config.events, (listener, event) => {
				eventEmitter.bind(event, (e) => {
					const res = listener(e, context);
					if (isObject(res) && isFunction(res.catch)) {
						res.catch((err) => {
							return errorHandler.emitError(
								err.isAxiosError === true ?
									errorHandler.makeNetworkError(err) :
									errorHandler.makeGlobalError(err)
							);
						});
					}
					return res;
				});
			});
		return eventEmitter.emitHook(FrameworkEventList.HOOK_BEFORE_CONTEXT_CREATE, {config}).then(args => {
			// Make the app context
			config = args.config;
			vueRenderContext = isUndefined(vueRenderContext) ? {} : vueRenderContext;
			
			// Create axios instances
			const axiosInstances = [];
			const generalAxios = BasicBootstrap.makeAxiosInstance(config, false, vueRenderContext);
			const resourceAxios = BasicBootstrap.makeAxiosInstance(config, true, vueRenderContext);
			axiosInstances.push(generalAxios);
			axiosInstances.push(resourceAxios);
			
			return context = new AppContext(mode, {
				env: config.environment,
				vueEnv: config.vue.vueEnvironment,
				errorHandler,
				store: new Store({}, getPath(config, ["initialStore"])),
				axios: generalAxios,
				axiosInstances,
				resourceApi: new JsonApi({
					axios: resourceAxios
				}),
				eventEmitter,
				dynamicComponentResolver: getPath(config, ["vue", "dynamicComponentResolver"]),
				staticComponents: getPath(config, ["vue", "staticComponents"], {}),
				config: config,
				vueRenderContext: vueRenderContext
			});
		});
	}
	
	/**
	 * Applies a hook that allows you to filter the context object after it was created
	 * @param appContext
	 */
	public static applyContextFilter(appContext: AppContext): Promise<AppContext> {
		return appContext.eventEmitter.emitHook(FrameworkEventList.HOOK_CONTEXT_FILTER, {appContext})
			.then(args => args.appContext);
	}
	
	/**
	 * Prepares the configuration object that will be used to create the vue instances
	 * It will also register our components and plugins we use on a global scale
	 * @param appContext
	 */
	public static configureVue(appContext: AppContext): Promise<AppContext> {
		// Prepare the default config and mountPoint
		const vueConfig: ComponentOptions<Vue> = hasPath(appContext.config, ["vue", "config"]) ?
			appContext.config.vue.config : {};
		
		// Register global vue event handler
		// Don't extend already existing error handlers but replace them
		const originalErrorHandler =
			Vue.config.errorHandler && (Vue.config.errorHandler as any).frameworkErrorHandler
				? null : Vue.config.errorHandler;
		Vue.config.errorHandler = function (err, vm, info) {
			
			// Ignore external, global errors
			if ((err.stack + "").indexOf("webpack-internal://") === -1) return;
			
			if (isFunction(originalErrorHandler)) {
				originalErrorHandler(err, vm, info);
			}
			
			const e = appContext.errorHandler.makeGlobalError(err);
			e.addAdditionalPayload({vm, info});
			appContext.errorHandler.emitError(e);
		};
		(Vue.config.errorHandler as any).frameworkErrorHandler = true;
		
		// Inject outlet for SSR Errors to be passed to the frontend
		if (appContext.isServer) {
			const renderContext = appContext.vueRenderContext;
			renderContext.afterRendering = function (res) {
				return appContext.errorHandler.waitForAllPromises()
					.then(() => {
						if (renderContext.ssrErrors) {
							res.write(renderContext.ssrErrors.join("\n"));
						}
					});
			};
		}
		
		// Initialize the localization logic
		vueConfig.i18n = new VueI18n({
			locale: "en",
			messages: {
				en: {}
			}
		});
		appContext.__setProperty("translation",
			new Translation(
				(vueConfig.i18n as VueI18n),
				appContext.resourceApi,
				appContext.eventEmitter,
				appContext.allAxiosInstances
			)
		);
		
		// Register the app context in the main component's data list
		if (isFunction(vueConfig.data)) {
			// Handle function
			vueConfig.data = function (a, b, c, d) {
				const data = (vueConfig.data as any)(a, b, c, d);
				data.appContext = appContext;
				return data;
			};
		} else {
			// Handle anything else
			if (!isPlainObject(vueConfig.data)) vueConfig.data = {};
			(vueConfig.data as PlainObject).appContext = appContext;
		}
		
		// Reinject the vue config into the config object
		if (!isPlainObject(appContext.config.vue)) appContext.config.vue = {};
		appContext.config.vue.config = vueConfig;
		
		// Apply a custom, global vue configuration
		if (!BasicBootstrap._vueIsInitialized && hasPath(appContext.config, ["vue", "globalConfiguration"]))
			appContext.config.vue.globalConfiguration(appContext, Vue);
		BasicBootstrap._vueIsInitialized = true;
		
		// Done
		return Promise.resolve(appContext);
	}
	
	/**
	 * Applies a hook that allows you to filter the vue config object before the instances are created
	 * @param appContext
	 */
	public static applyVueConfigFilter(appContext: AppContext): Promise<AppContext> {
		return appContext.eventEmitter.emitHook(FrameworkEventList.HOOK_VUE_CONFIG_FILTER, {
				vueConfig: appContext.config.vue.config, appContext
			})
			.then(args => args.appContext);
	}
	
	/**
	 * Creates the vue instance and injects it into the app context
	 * @param appContext
	 */
	public static makeVueInstance(appContext: AppContext): Promise<AppContext> {
		// Remove the mount point from the vue config -> this will lead to issues when using ssr otherwise
		// @ts-ignore
		const config = appContext.config.vue.config;
		const mountPoint = config.el;
		delete config.el;
		
		// Create the instance
		const i = new Vue(config);
		appContext.__setProperty("vue", i);
		
		// Reinject the mountpoint
		config.el = mountPoint;
		
		// Done
		return Promise.resolve(appContext);
	}
	
	/**
	 * Emits the init hook chain
	 * @param appContext
	 */
	public static emitInitHook(appContext: AppContext): Promise<AppContext> {
		return appContext.eventEmitter.emitHook(FrameworkEventList.HOOK_INIT, {appContext})
			.then(args => {
				appContext = args.appContext;
				return appContext.eventEmitter.emitHook(
					appContext.isClient ? FrameworkEventList.HOOK_INIT_BROWSER : FrameworkEventList.HOOK_INIT_SERVER, {appContext})
					.then(args => args.appContext);
			});
	}
	
	/**
	 * Creates a new axios instance based on the given configuration object and returns it
	 * @param config
	 * @param forResourceApi
	 * @param vueRenderContext
	 */
	protected static makeAxiosInstance(config: BasicAppConfigInterface, forResourceApi: boolean, vueRenderContext: PlainObject): AxiosInstance {
		
		// Build the configuration object
		const isProd = config.environment === "production";
		let axiosConfig: AxiosRequestConfig = {};
		if (hasPath(config, ["api", "axios"])) axiosConfig = config.api.axios;
		
		// Prepare the base url
		let baseUrl = getPath(config, ["api", "baseUrl"]);
		if (!isProd && hasPath(config, ["api", "devBaseUrl"])) baseUrl = config.api.devBaseUrl;
		if (isString(baseUrl))
			baseUrl = BasicBootstrap.stripSlashes(baseUrl);
		else if (!isUndefined((config as any).baseUrl))
			baseUrl = (config as any).baseUrl;
		else if (config.vue.vueEnvironment === "client")
			baseUrl = window.location.protocol + "//" + window.location.hostname;
		else baseUrl = "127.0.0.1";
		
		// Prepare the root uri
		let baseUri = getPath(config, ["api", "rootUriPart"], "api");
		baseUri = "/" + BasicBootstrap.stripSlashes(baseUri) + "/";
		if (forResourceApi === true)
			baseUri += getPath(config, ["api", "resourceBaseUriPart"], "resources") + "/";
		
		// Combine base url and uri
		axiosConfig.baseURL = baseUrl + baseUri;
		
		// Inject request-headers in an SSR context
		if (!isUndefined(vueRenderContext.serverRequest) && !isUndefined(vueRenderContext.serverRequest.headers))
			axiosConfig.headers = merge(getPath(axiosConfig, ["headers"], {}), vueRenderContext.serverRequest.headers);
		
		// Make sure we can use self signed ssl certificates when in development mode
		if (!isProd && isUndefined(axiosConfig.httpsAgent) && config.vue.vueEnvironment === "server")
			process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
		
		// Create a new instance
		return axios.create(axiosConfig);
	}
	
	/**
	 * Internal helper to remove slashes at the beginning and end of the given path
	 * @param path
	 */
	public static stripSlashes(path: string): string {
		return path.replace(/^(\s|\/)|(\s|\/)$/g, "");
	}
}