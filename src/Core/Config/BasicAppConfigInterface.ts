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
 * Last modified: 2019.12.12 at 11:21
 */

import {PlainObject} from "@labor-digital/helferlein/lib/Interfaces/PlainObject";
import {AxiosRequestConfig} from "axios";
import Vue, {ComponentOptions} from "vue";
import {AppEnvironmentType, VueEnvironmentType} from "../Context/AppContext";
import {
	AdditionalConfigurationInterface,
	AppErrorLogger,
	AppEventListener,
	AppStaticComponentListInterface,
	VueConfigurationInterface,
	VueDynamicComponentResolverInterface
} from "./AppConfig.interfaces";

export interface AppApiConfigInterface {
	/**
	 * Contains the protocol, domain and (optional) port of the api provider we should connect to.
	 * There MUST NOT be any uri segments given!
	 */
	baseUrl?: string
	
	/**
	 * The same as baseUrl but overrides it when the framework is running in development mode
	 */
	devBaseUrl?: string
	
	/**
	 * This part should match the configuration of the router config in your Typo3 installation.
	 * The uri element which defines the first part in the API uri path.
	 * It is the main entry point to all your API endpoints
	 */
	rootUriPart?: string
	
	/**
	 * This part should match the configuration of the router config in your Typo3 installation.
	 * The uri element which defines the uri part which is used to group the resource uri's under
	 */
	resourceBaseUriPart?: string
	
	/**
	 * Additional configuration for the axios library
	 */
	axios?: AxiosRequestConfig
}

export interface AppVueConfigInterface {
	
	/**
	 * Can be used to manually set the vue environment type.
	 * This is normally defined by the VUE_ENV environment variable
	 */
	vueEnvironment?: VueEnvironmentType;
	
	/**
	 * Can be used to provide the default vue configuration options for the vue framework
	 */
	config?: ComponentOptions<Vue>
	
	/**
	 * Can be used to register additional plugins, directives and similar adjustments
	 * on the global vue instance
	 */
	globalConfiguration?: VueConfigurationInterface
	
	/**
	 * This function is used to define how you want to import the dynamic content
	 * element components we use on a page
	 */
	dynamicComponentResolver?: VueDynamicComponentResolverInterface
	
	/**
	 * Additional, static components that are required in the framework
	 */
	staticComponents?: AppStaticComponentListInterface
	
}

export interface AppErrorConfigInterface {
	/**
	 * A callback that is executed when an error occurs.
	 * The callback receives the error object and can be used to log the error to external services
	 */
	logger?: AppErrorLogger
	
	/**
	 * By default the framework registers a global error handler to capture events in callbacks
	 * and timeouts. If you don't want that set this to FALSE
	 */
	registerGlobalErrorHandler?: boolean
	
	/**
	 * By default the framework print's all errors to the console output.
	 * Set this to FALSE to disable this feature
	 */
	printErrorToConsole?: boolean
	
	/**
	 * The default, numeric error code -> This is 500 by default
	 */
	defaultErrorCode?: number;
}

export interface BasicAppConfigInterface {
	/**
	 * Determines the type of environment the page runs in.
	 * This will be set by the NODE_ENV environment variable by default.
	 * If there is no NODE_ENV and this option is not set the framework will fall back to "production"
	 */
	environment?: AppEnvironmentType
	
	/**
	 * Can be used to provide the initial value of the "Store"s content.
	 * This should be a function that returns an object literal
	 */
	initialStore?: Function
	
	/**
	 * A list of event names and their matching listeners that should
	 * be registered when the frameworks creates the event emitter instance
	 */
	events?: PlainObject<AppEventListener>
	
	/**
	 * Options for the json api endpoint we should consume
	 */
	api?: AppApiConfigInterface
	
	/**
	 * Options for the vue framework itself
	 */
	vue?: AppVueConfigInterface
	
	/**
	 * Configuration for the error handling in your application
	 */
	errorHandling?: AppErrorConfigInterface,
	
	/**
	 * Similar to TYPO3's additional configuration,
	 * you can use this callback to change the configuration object based on the environment if you need to.
	 */
	additionalConfiguration?: AdditionalConfigurationInterface
	
}