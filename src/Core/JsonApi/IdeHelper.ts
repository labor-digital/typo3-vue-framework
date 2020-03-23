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
 * Last modified: 2019.12.12 at 13:22
 */

import {JsonApi as RootJsonApi} from "@labor-digital/json-api/lib/JsonApi";
import {
	ApiPagination,
	JsonApiGetQuery as RootJsonApiGetQuery,
	JsonApiResponse as RootJsonApiResponse
} from "@labor-digital/json-api/lib/JsonApi.interfaces";
import {JsonApiState as RootJsonApiState} from "@labor-digital/json-api/lib/JsonApiState";
import {JsonApiStateList as RootJsonApiStateList} from "@labor-digital/json-api/lib/JsonApiStateList";
import {State as RootState} from "@labor-digital/json-api/lib/State";

// I just pass those classes and interfaces through to help IDEs like phpstorm to resolve them correctly.

export class State extends RootState {
}

export class JsonApi extends RootJsonApi {
}

export interface JsonApiGetQuery extends RootJsonApiGetQuery {
}

export interface JsonApiPagination extends ApiPagination {
}

export interface JsonApiResponse extends RootJsonApiResponse {
}

export interface JsonApiState extends RootJsonApiState {
}

export interface JsonApiStateList extends RootJsonApiStateList {
}