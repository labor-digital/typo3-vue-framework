/*
 * Copyright 2020 LABOR.digital
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
 * Last modified: 2020.04.19 at 20:30
 */

export enum FrameworkEventList {
	/**
	 * This hook is executed before the appContext object is created
	 */
	HOOK_BEFORE_CONTEXT_CREATE = "framework:beforeContextCreate",
	
	/**
	 * This hook can be used to filter the appContext object after it was created
	 */
	HOOK_CONTEXT_FILTER = "framework:contextFilter",
	
	/**
	 * Allows you to filter the configuration object for the vue router
	 */
	HOOK_ROUTER_CONFIG_FILTER = "framework:routerConfigFilter",
	
	/**
	 * Is used to filter the vue configuration object before the vue instance(s) are created
	 */
	HOOK_VUE_CONFIG_FILTER = "framework:vueConfigFilter",
	
	/**
	 * Emitted right after the vue instance was created (but not yet mounted) this is the perfect
	 * point in time to do some last minute changes and adjustments. Note: This is emitted both on server and on client!
	 */
	HOOK_INIT = "framework:init",
	
	/**
	 * The same as HOOK_INIT but runs ONLY in the browser
	 */
	HOOK_INIT_BROWSER = "framework:init:browser",
	
	/**
	 * The same as HOOK_INIT but runs ONLY on the server
	 */
	HOOK_INIT_SERVER = "framework:init:server",
	
	/**
	 * Emitted before a navigation occurs
	 */
	EVENT_ROUTE_BEFORE_NAVIGATION = "framework:routeBeforeNavigation",
	
	/**
	 * Can be used to modify the api query when a new route was requested
	 */
	HOOK_ROUTE_QUERY_FILTER = "framework:routeQueryFilter",
	
	/**
	 * Can be used to modify the state object, passed by the api before it is given to the page context
	 */
	HOOK_ROUTE_STATE_PRE_PROCESSOR = "framework:routeState:preProcess",
	
	/**
	 * Internal event for all framework services to execute the updates after navigation was performed
	 */
	HOOK_UPDATE_FRAMEWORK_AFTER_NAVIGATION = "framework:routeState:updateInternal",
	
	/**
	 * Potential post-navigation handlers when the page context was successfully updated
	 */
	HOOK_ROUTE_STATE_POST_PROCESSOR = "framework:routeState:postProcess",
	
	/**
	 * Emitted after a navigation was executed
	 */
	EVENT_ROUTE_AFTER_NAVIGATION = "framework:routeAfterNavigation",
	
	/**
	 * Emitted when the component definition is resolved in the content element component.
	 */
	HOOK_CONTENT_ELEMENT_DEFINITION_FILTER = "framework:contentElement:filterDefinition",
	
	/**
	 * Emitted as soon as a content element reached the rendered ready state
	 */
	EVENT_CONTENT_ELEMENT_LOADED = "framework:contentElement:loaded",
	
	/**
	 * This hook is emitted in the error handler and can hold different arguments based on the mode you are running in
	 */
	HOOK_ON_ERROR = "framework:onError"
}