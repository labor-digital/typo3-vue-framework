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

import {BasicAppConfigInterface} from "./BasicAppConfigInterface";

export interface HybridAppConfigInterface extends BasicAppConfigInterface {
	/**
	 * Defines the selector to find content elements on the html page. This replaces the mountpoint configuration on spa apps.
	 * By default the selector is set to: div[data-typo-frontend-api-content-element].
	 */
	contentElementSelector?: string
	
	/**
	 * Defines the name of the data attribute that contains the content element definition as a json string.
	 * By default the data attribute matches the contentElementSelector and is set to: data-typo-frontend-api-content-element
	 */
	contentElementDefinitionAttribute?: string
	
	/**
	 * In hybrid mode the app tries to load global data from a window var "FRONTEND_API_DATA" by default.
	 * If you want to change the name of the variable you may change the name using this option.
	 */
	globalDataWindowVar?: string
}