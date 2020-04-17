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
 * Last modified: 2019.12.12 at 11:22
 */

import {Component} from "vue";
import {MetaInfo} from "vue-meta";
import {RouterOptions} from "vue-router";
import {AppEnvironmentType} from "../Context/AppContext";
import {
	AppErrorConfigRouteDefinition,
	AppStaticComponentListInterface,
	SpaAppLayoutComponentListInterface
} from "./AppConfig.interfaces";
import {AppErrorConfigInterface, AppVueConfigInterface, BasicAppConfigInterface} from "./BasicAppConfigInterface";


export interface SpaAppStaticComponentListInterface extends AppStaticComponentListInterface {
	
	/**
	 * The component that should be displayed when a page is rendered in preview mode
	 */
	previewModeMarkerComponent?: Component
}

export interface SpaAppVueConfigInterface extends AppVueConfigInterface {
	/**
	 * By default the app will be mounted on an element with the #app selector
	 * You can change this by defining an alternative mountPoint using this option.
	 */
	mountPoint?: string | Element
	
	/**
	 * Defines the app/root component where the <router-view> should be defined
	 * If not given we use a lightweight default instead
	 */
	appComponent?: Component
	
	/**
	 * The list of layouts you want to provide for your page
	 * Layout's are the outermost frame of your application.
	 *
	 * registered in this array
	 */
	layoutComponents?: SpaAppLayoutComponentListInterface
	
	/**
	 * Additional, static components that are required in the framework
	 */
	staticComponents?: SpaAppStaticComponentListInterface
}

export interface SpaAppErrorConfigInterface extends AppErrorConfigInterface {
	
	/**
	 * A list of routes to redirect to when an error with a given code occurs
	 */
	routes?: Array<AppErrorConfigRouteDefinition>
}

export interface SpaAppConfigInterface extends BasicAppConfigInterface {
	
	/**
	 * Determines the type of environment the page runs in.
	 * This will be set by the NODE_ENV environment variable by default.
	 * If there is no NODE_ENV and this option is not set the framework will fall back to "production"
	 */
	environment?: AppEnvironmentType
	
	/**
	 * Contains the protocol, domain and (optional) port of the application.
	 * You can always use the current base url path using the page context object.
	 * It is also automatically used as api.baseUrl if there is none defined.
	 * There MUST NOT be any uri segments given!
	 */
	baseUrl?: string
	
	/**
	 * The same as baseUrl but overrides it when the framework is running in development mode
	 */
	devBaseUrl?: string
	
	/**
	 * Options for the vue router instance
	 */
	router?: {
		/**
		 * This part of the url's path will be ignored by the router
		 * By default this will be "/"
		 */
		basePath?: string
		
		/**
		 * Additional configuration for the vue router
		 */
		vueRouter?: RouterOptions
		
		/**
		 * A list of common element keys that should be reloaded
		 * every time a new url is required from the server
		 */
		refreshCommonElements?: Array<string>
	}
	
	/**
	 * Options for the vue framework itself
	 */
	vue?: SpaAppVueConfigInterface
	
	/**
	 * Additional meta information that should be static and not change
	 * This can be used for app icons, app manifests or similar tags
	 */
	staticMeta?: MetaInfo
	
	/**
	 * Configuration for the error handling in your application
	 */
	errorHandling?: SpaAppErrorConfigInterface
	
}