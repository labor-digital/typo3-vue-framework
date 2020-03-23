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
 * Last modified: 2019.09.30 at 19:04
 */

export enum EventList {
	/**
	 * This hook is executed before the appContext object is created
	 */
	HOOK_BEFORE_CONTEXT_CREATE = "t3fapi__beforeContextCreate",
	
	/**
	 * This hook can be used to filter the appContext object after it was created
	 */
	HOOK_CONTEXT_FILTER = "t3fapi__contextFilter",
	
	/**
	 * Allows you to filter the configuration object for the vue router
	 */
	HOOK_ROUTER_CONFIG_FILTER = "t3fapi__routerConfigFilter",
	
	/**
	 * Is used to filter the vue configuration object before the vue instance(s) are created
	 */
	HOOK_VUE_CONFIG_FILTER = "t3fapi__vueConfigFilter",
	
	/**
	 * Emitted right after the vue instance was created (but not yet mounted) this is the perfect
	 * point in time to do some last minute changes and adjustments. Note: This is emitted both on server and on client!
	 */
	HOOK_INIT = "t3fapi__init",
	
	/**
	 * The same as HOOK_INIT but runs ONLY in the browser
	 */
	HOOK_INIT_BROWSER = "t3fapi__init--browser",
	
	/**
	 * The same as HOOK_INIT but runs ONLY on the server
	 */
	HOOK_INIT_SERVER = "t3fapi__init--server",
	
	/**
	 * Emitted before a navigation occurs
	 */
	EVENT_ROUTE_BEFORE_NAVIGATION = "t3fapi__routeBeforeNavigation",
	
	/**
	 * Can be used to modify the api query when a new route was requested
	 */
	HOOK_ROUTE_QUERY_FILTER = "t3fapi__routeQueryFilter",
	
	/**
	 * Can be used to modify the state object, passed by the api before it is given to the page context
	 */
	HOOK_ROUTE_STATE_PRE_PROCESSOR = "t3fapi__routeState--preProcess",
	
	/**
	 * Potential post-navigation handlers when the page context was successfully updated
	 */
	HOOK_ROUTE_STATE_POST_PROCESSOR = "t3fapi__routeState--postProcess",
	
	/**
	 * Emitted after a navigation was executed
	 */
	EVENT_ROUTE_AFTER_NAVIGATION = "t3fapi__routeAfterNavigation",
	
	/**
	 * Emitted when the component definition is resolved in the content element component.
	 */
	HOOK_CONTENT_ELEMENT_DEFINITION_FILTER = "t3fapi__contentElement--filterDefinition",
	
	/**
	 * Emitted as soon as a content element reached the rendered ready state
	 */
	EVENT_CONTENT_ELEMENT_LOADED = "t3fapi__contentElement--loaded",
	
	/**
	 * This hook is emitted in the error handler and can hold different arguments based on the mode you are running in
	 */
	HOOK_ON_ERROR = "t3fapi__onError"
}