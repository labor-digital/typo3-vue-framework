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
 * Last modified: 2019.12.12 at 11:41
 */

import {EventEmitter} from "@labor-digital/helferlein/lib/Events/EventEmitter";
import {PlainObject} from "@labor-digital/helferlein/lib/Interfaces/PlainObject";
import {cloneList} from "@labor-digital/helferlein/lib/Lists/cloneList";
import {forEach} from "@labor-digital/helferlein/lib/Lists/forEach";
import {isUndefined} from "@labor-digital/helferlein/lib/Types/isUndefined";
import {AxiosInstance} from "axios";
import {CombinedVueInstance, Vue} from "vue/types/vue";
import {AppStaticComponentListInterface, VueDynamicComponentResolverInterface} from "../Config/AppConfig.interfaces";
import {BasicAppConfigInterface} from "../Config/BasicAppConfigInterface";
import {HybridAppConfigInterface} from "../Config/HybridAppConfigInterface";
import {SpaAppConfigInterface} from "../Config/SpaAppConfigInterface";
import {ErrorHandler} from "../ErrorHandling/ErrorHandler";
import {JsonApi} from "../JsonApi/IdeHelper";
import {Store} from "../Module/General/Store";
import {Translation} from "../Module/General/Translation";
import {AbstractContext} from "./AbstractContext";
import {PageContext} from "./PageContext";

export type AppMode = "hybrid" | "spa";

export type AppEnvironmentType = "development" | "production";

export type VueEnvironmentType = "client" | "server";


export class AppContext extends AbstractContext {
	
	/**
	 * Defines the variant/mode we are running in
	 */
	protected _mode: AppMode;
	
	/**
	 * The string that defines the type of environment we are currently running in
	 */
	protected _env: AppEnvironmentType;
	
	/**
	 * Defines if the app is currently rendered using ssr or in the browser
	 */
	protected _vueEnv: VueEnvironmentType;
	
	/**
	 * The error handler that is used for potential errors in this context
	 */
	protected _errorHandler: ErrorHandler;
	
	/**
	 * Holds the page context which holds information about the currently viewed page
	 * Note: This is only set if we are running in spa mode! Otherwise this will be undefined!
	 */
	protected _pageContext: PageContext | undefined;
	
	/**
	 * The translation class for this framework instance
	 */
	protected _translation: Translation;
	
	/**
	 * The internal event emitter of the framework instance
	 */
	protected _eventEmitter: EventEmitter;
	
	/**
	 * The axios instance to communicate with api endpoint's that are not considered a "resource"
	 */
	protected _axios: AxiosInstance;
	
	/**
	 * The list of created axios instances to pass to other services
	 *
	 * @protected
	 */
	protected _axiosInstances: Array<AxiosInstance>;
	
	/**
	 * The resource api axios wrapper that handles communication with the TYPO3 resource api
	 */
	protected _resourceApi: JsonApi;
	
	/**
	 * Holds the store instance to hold global application data
	 */
	protected _store: Store;
	
	/**
	 * Additional components that are used in the framework
	 */
	protected _staticComponents: AppStaticComponentListInterface;
	
	/**
	 * Holds the reference to the dynamic component resolver if it was registered
	 * in the framework config. Otherwise this property is "undefined"
	 */
	protected _dynamicComponentResolver: VueDynamicComponentResolverInterface | undefined;
	
	/**
	 * The vue instance we use in this app
	 */
	protected _vue: CombinedVueInstance<Vue, any, any, any, any>;
	
	/**
	 * This is mostly internal and only used if the app is rendered using SSR.
	 * It holds the reference to the vue context object to pass information to express
	 */
	protected _vueRenderContext: PlainObject;
	
	/**
	 * Holds the configuration object for this app
	 */
	protected _config: SpaAppConfigInterface | HybridAppConfigInterface | BasicAppConfigInterface;
	
	public constructor(mode: AppMode, properties: PlainObject) {
		super(properties);
		this._mode = mode;
	}
	
	/**
	 * Returns the mode that is currently running for this app
	 */
	public get mode(): AppMode {
		return this._mode;
	}
	
	/**
	 * Returns the page context object.
	 * Note: This only works for SPA apps!
	 */
	public get pageContext(): PageContext {
		if (this._mode !== "spa") throw new Error("You can't request the page context if you are not running your app in \"SPA\" mode!");
		return this._pageContext;
	}
	
	/**
	 * Return the type of this context
	 */
	public get type(): string {
		return "framework";
	}
	
	/**
	 * Returns the configuration object for this app
	 */
	public get config(): SpaAppConfigInterface | HybridAppConfigInterface | BasicAppConfigInterface {
		return this._config;
	}
	
	/**
	 * Returns the store instance to hold global application data
	 */
	public get store(): Store {
		return this._store;
	}
	
	/**
	 * Returns the string that defines the type of environment we are currently running in
	 */
	public get env(): AppEnvironmentType {
		return this._env;
	}
	
	/**
	 * Returns a string that defines if the app is currently running on the SSR server or in the browser
	 */
	public get vueEnv(): VueEnvironmentType {
		return this._vueEnv;
	}
	
	/**
	 * Returns true if the script is currently executed at the client's browser
	 */
	public get isClient(): boolean {
		return this._vueEnv === "client";
	}
	
	/**
	 * Returns true if the script is currently executed by the SSR renderer
	 */
	public get isServer(): boolean {
		return this._vueEnv === "server";
	}
	
	/**
	 * Returns true if the environment is a development server
	 */
	public get isDev(): boolean {
		return this._env === "development";
	}
	
	/**
	 * Returns true if the environment is in production mode
	 */
	public get isProduction(): boolean {
		return this._env === "production";
	}
	
	/**
	 * Returns the axios instance to communicate with api endpoint's that are not considered a "resource"
	 */
	public get axios(): AxiosInstance {
		return this._axios;
	}
	
	/**
	 * Returns the list of all registered axios instances in this context
	 */
	public get allAxiosInstances(): Array<AxiosInstance> {
		return this._axiosInstances;
	}
	
	/**
	 * Returns the resource api axios wrapper that handles communication with the TYPO3 resource api
	 */
	public get resourceApi(): JsonApi {
		return this._resourceApi;
	}
	
	/**
	 * Returns the instance of the event emitter, for this framework instance
	 * The event emitter is used for global events that should be handled across multiple components
	 */
	public get eventEmitter(): EventEmitter {
		return this._eventEmitter;
	}
	
	/**
	 * Returns the reference to the dynamic component resolver or undefined
	 * if there was none registered
	 */
	public get dynamicComponentResolver(): VueDynamicComponentResolverInterface | undefined {
		return this._dynamicComponentResolver;
	}
	
	/**
	 * Returns the translation class with information about the current localization of the framework instance
	 */
	public get translation(): Translation | undefined {
		return this._translation;
	}
	
	/**
	 * Returns the vue instance we use in this context
	 */
	public get vue(): CombinedVueInstance<Vue, any, any, any, any> {
		return this._vue;
	}
	
	/**
	 * Returns the error handler instance
	 */
	public get errorHandler(): ErrorHandler {
		return this._errorHandler;
	}
	
	/**
	 * Returns the list of static components that were registered in the framework configuration.
	 */
	public get staticComponents(): AppStaticComponentListInterface {
		return this._staticComponents;
	}
	
	/**
	 * This is mostly internal and only used if the app is rendered using SSR.
	 * It returns the reference to the vue context object to pass information to express
	 */
	public get vueRenderContext(): PlainObject {
		return this._vueRenderContext;
	}
	
	/**
	 * Creates a clone of the current context. Note: this is only a shallow clone for use in hybrid apps
	 * @private
	 */
	public __clone(): AppContext {
		const props: PlainObject = {};
		forEach(this, (v, k) => {
			props[k.replace(/^_/, "")] = v;
		});
		
		// Deep clone the configuration object
		if (!isUndefined(props.config))
			props.config = cloneList(props.config, {depth: 3});
		
		// Create the new context object
		return new AppContext(this._mode, props);
	}
}