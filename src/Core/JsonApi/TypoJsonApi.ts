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
 * Last modified: 2020.05.22 at 21:00
 */

import {getPath} from "@labor-digital/helferlein/lib/Lists/Paths/getPath";
import {debouncePromise} from "@labor-digital/helferlein/lib/Misc/debouncePromise";
import {isNumber} from "@labor-digital/helferlein/lib/Types/isNumber";
import {isUndefined} from "@labor-digital/helferlein/lib/Types/isUndefined";
import {JsonApi} from "@labor-digital/json-api/lib/JsonApi";
import {JsonApiGetQuery} from "@labor-digital/json-api/lib/JsonApi.interfaces";
import {Collection, Resource} from "./IdeHelper";

/**
 * Extends the default JSON API object with methods for the TYPO3 backend setup in mind.
 */
export class TypoJsonApi extends JsonApi {
	
	/**
	 * Finds the data for "additional routes" that are registered on a certain resource type.
	 *
	 * @param resourceType 	The type of entity to resolve the data for
	 * @param uriFragment	The additional uri fragment that should be added after the resource type in the uri
	 * @param query 		An optional query to use when requesting the resource
	 * @param debounceLimit Can be used to debounce multiple, subsequent requests for a certain number of milli-seconds,
	 *                      before they should be actually submitted to the server. Can be used to avoid multiple request
	 *                      for text inputs or similar occurrences.
	 */
	public getAdditional(resourceType: string, uriFragment: string, query?: JsonApiGetQuery, debounceLimit?: number): Promise<Resource | Collection | any> {
		debounceLimit = isNumber(debounceLimit) ? debounceLimit : 0;
		return debouncePromise(this._guid, () => {
			const queryString = this.makeQueryString(query);
			return this.axios
				.get("/" + resourceType + "/" + uriFragment + queryString)
				.then((response): Promise<Resource | Collection | any> => {
					// Throw an error if we got a non-200 response code
					if (response.status < 200 || response.status > 299) {
						let error = getPath(response.data, ["errors", "title"]);
						if (isUndefined(error)) error = response.statusText;
						return Promise.reject(new Error(error));
					}
					
					// Check if we got a JSON-API result
					if (response.headers["content-type"] === "application/vnd.api+json")
						return this.handleAxiosResponse(response);
					
					// Extend the response data by the status code and the response headers
					return Promise.resolve(response.data);
				});
		}, debounceLimit, true);
	}
	
}