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
 * Last modified: 2019.12.12 at 11:24
 */

import {EventEmitterEvent} from "@labor-digital/helferlein/lib/Events/EventEmitter";
import {PlainObject} from "@labor-digital/helferlein/lib/Interfaces/PlainObject";
import {Component, VueConstructor} from "vue";
import {AppContext, AppEnvironmentType, AppMode} from "../Context/AppContext";
import {AppError} from "../ErrorHandling/AppError";
import {ContentElementComponentDefinitionInterface} from "../Interface/ContentElementComponentDefinitionInterface";
import {BasicAppConfigInterface} from "./BasicAppConfigInterface";
import {HybridAppConfigInterface} from "./HybridAppConfigInterface";
import {SpaAppConfigInterface} from "./SpaAppConfigInterface";

export interface AdditionalConfigurationEnvironmentInterface {
	/**
	 * The mode the app is currently running in
	 */
	mode: AppMode;
	
	/**
	 * The type of the environment the app is currently running in
	 */
	type: AppEnvironmentType;
	
	/**
	 * The environment variables that have been passed to the node process.
	 * When running on a server the env variables are passed from process.env,
	 * if the script is running on the client side the variables can be passed at:
	 * window.VUE_ENV -> which is a plain object
	 *
	 * Works in combination with expressSsrPlugin and the "envVars" option for the
	 * frontend as well.
	 */
	envVars: PlainObject;
	
	/**
	 * The vue rendering context when running on the server side an empty plain object
	 * if running on the client side
	 */
	vueContext: PlainObject;
}

export interface AdditionalConfigurationInterface {
	(environment: AdditionalConfigurationEnvironmentInterface,
	 config: BasicAppConfigInterface | SpaAppConfigInterface | HybridAppConfigInterface): void
}

export interface VueConfigurationInterface {
	(context: AppContext, vue: VueConstructor): void
}

export interface VueDynamicComponentResolverInterface {
	(componentType: string, componentKey: string, definition: ContentElementComponentDefinitionInterface): Promise<{ default: any }>
}

export interface SpaAppLayoutComponentListInterface {
	/**
	 * The key/name of the layout has to match the value of the defined
	 * layout field of the typo3 backend
	 */
	[key: string]: Component
	
	/**
	 * The layout with the key "default" will handle all layouts that are not manually
	 */
	default?: Component
}

export interface AppStaticComponentListInterface {
	/**
	 * The component that is rendered on the /error page
	 */
	appErrorComponent?: Component;
	
	/**
	 * The component that is rendered if a content element component fails
	 */
	contentElementErrorComponent?: Component;
	
	/**
	 * The component that will be displayed while the chunk for a single content element is loaded from the server
	 */
	contentElementLoaderComponent?: Component;
}

export interface AppEventListener {
	(evt: EventEmitterEvent, appContext: AppContext): void;
}

export interface AppErrorRouteResolver {
	(error: AppError, appContext: AppContext): string;
}

export interface AppErrorConfigRouteDefinition {
	/**
	 * The error code that triggers a redirect to the given route
	 */
	code: number,
	
	/**
	 * The route with a leading slash that should be redirected to when the error code occurs
	 */
	route: string | AppErrorRouteResolver,
	
	/**
	 * By default all errors will be send to the registered logger function.
	 * If this error should not be logged -> Set this to FALSE
	 */
	sendToLogger?: boolean
	
	/**
	 * By default all errors will be rendered into the browser console.
	 * If this error should not be logged -> Set this to FALSE
	 */
	printToConsole?: boolean
}

export interface AppErrorLogger {
	(error: AppError): void
}