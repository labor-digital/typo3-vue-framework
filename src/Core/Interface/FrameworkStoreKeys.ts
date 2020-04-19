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
 * Last modified: 2020.04.19 at 15:16
 */

export enum FrameworkStoreKeys {
	
	/**
	 * Can be used to overwrite the configured app component with something else
	 * This is mostly an internal feature
	 */
	SPA_APP_COMPONENT_OVERWRITE = "framework:spaAppComponentOverwrite",
	
	/**
	 * Contains the raw JsonApiState for the currently served page
	 */
	SPA_PAGE_STATE = "framework:spaPage:state",
	
	/**
	 * Contains the page data as a State object
	 */
	SPA_PAGE_DATA = "framework:spaPage:data",
	
	/**
	 * Contains the list of loaded common elements
	 */
	SPA_PAGE_COMMON_ELEMENTS = "framework:spaPage:common",
	
	/**
	 * The pid configuration provided by the api
	 */
	SPA_PAGE_PID_CONFIGURATION = "framework:spaPage:pid",
	
	/**
	 * The current route when the app is running in SPA mode
	 */
	SPA_PAGE_ROUTE = "framework:spaPage:route"
}