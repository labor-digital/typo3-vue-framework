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

import {Collection as RootCollection} from "@labor-digital/json-api/lib/Elements/Collection";
import {Resource as RootResource} from "@labor-digital/json-api/lib/Elements/Resource";
import {
	JsonApiGetQuery as RootJsonApiGetQuery,
	JsonApiPagination as RootJsonApiPagination,
	JsonApiResponse as RootJsonApiResponse
} from "@labor-digital/json-api/lib/JsonApi.interfaces";
import {JsonApiState as RootJsonApiState} from "@labor-digital/json-api/lib/JsonApiState";
import {JsonApiStateList as RootJsonApiStateList} from "@labor-digital/json-api/lib/JsonApiStateList";
import {State as RootState} from "@labor-digital/json-api/lib/State";
import {TypoJsonApi} from "./TypoJsonApi";

// I just pass those classes and interfaces through to help IDEs like phpstorm to resolve them correctly.

export class State extends RootState {
}

export class JsonApi extends TypoJsonApi {
}

export interface JsonApiGetQuery extends RootJsonApiGetQuery {
}

export interface JsonApiPagination extends RootJsonApiPagination {
}

export interface JsonApiResponse extends RootJsonApiResponse {
}

export interface Resource extends RootResource {
}

export interface Collection extends RootCollection {
}

/**
 * @deprecated will be removed in v3.0 - Use "Resource" instead
 */
export interface JsonApiState extends RootJsonApiState {
}

/**
 * @deprecated will be removed in v3.0 - Use "Collection" instead
 */
export interface JsonApiStateList extends RootJsonApiStateList {
}