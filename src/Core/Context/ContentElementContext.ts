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
 * Last modified: 2019.12.12 at 16:55
 */

import {PlainObject} from "@labor-digital/helferlein/lib/Interfaces/PlainObject";
import {getPath} from "@labor-digital/helferlein/lib/Lists/Paths/getPath";
import {isUndefined} from "@labor-digital/helferlein/lib/Types/isUndefined";
import {ContentElementErrorHandler, ReasonType} from "../ErrorHandling/ErrorHandler.interfaces";
import {ContentElementColumnListInterface} from "../Interface/ContentElementColumnListInterface";
import {ContentElementComponentDefinitionInterface} from "../Interface/ContentElementComponentDefinitionInterface";
import {JsonApiGetQuery, JsonApiState, JsonApiStateList, State} from "../JsonApi/IdeHelper";
import {Store} from "../Module/General/Store";
import {AppContext} from "./AppContext";

export class ContentElementContext {
	
	/**
	 * The app context instance this component belongs to
	 */
	protected _appContext: AppContext;
	
	/**
	 * The unique id of the content element this context belongs to
	 */
	protected _id: number | string;
	
	/**
	 * The given data we received from the server
	 */
	protected _data: State;
	
	/**
	 * The initial state object (only if configured from the backend element)
	 */
	protected _initialState: JsonApiState | JsonApiStateList;
	
	/**
	 * The initial state query object (only if configured from the backend element)
	 */
	protected _initialQuery: JsonApiGetQuery;
	
	/**
	 * The initial state's resource type
	 */
	protected _initialType: string;
	
	/**
	 * The list of children of the current content element
	 */
	protected _children: ContentElementColumnListInterface;
	
	/**
	 * The error handler to trigger errors for this content element
	 */
	protected _errorHandler: ContentElementErrorHandler;
	
	public constructor(context: AppContext, initialState: JsonApiState | JsonApiStateList,
					   definition: ContentElementComponentDefinitionInterface, errorHandler: ContentElementErrorHandler) {
		this._id = definition.id;
		this._children = definition.children;
		this._initialType = getPath(definition, ["initialState", "resourceType"], null);
		this._initialState = initialState;
		this._initialQuery = getPath(definition, ["initialState", "query"], null);
		this._data = new State(definition.data);
		this._appContext = context;
		this._errorHandler = errorHandler;
		
	}
	
	/**
	 * Return the type of this context
	 */
	public get type(): string {
		return "contentElement";
	}
	
	/**
	 * Returns the given data we received from the server
	 */
	public get data(): State {
		return this._data;
	}
	
	/**
	 * Returns the store instance to hold global application data
	 */
	public get store(): Store {
		return this._appContext.store;
	}
	
	/**
	 * Returns the list of children of the current content element
	 */
	public get children(): ContentElementColumnListInterface {
		return isUndefined(this._children) ? {} : this._children;
	}
	
	/**
	 * Returns the app context instance this component belongs to
	 */
	public get appContext(): AppContext {
		return this._appContext;
	}
	
	/**
	 * Returns the unique id of the content element this context belongs to
	 */
	public get id(): number | string {
		return this._id;
	}
	
	/**
	 * Returns the initial state object (only if configured from the backend element)
	 */
	public get initialState(): JsonApiState | JsonApiStateList {
		return this._initialState;
	}
	
	/**
	 * Returns the initial state query object (only if configured from the backend element)
	 */
	public get initialQuery(): JsonApiGetQuery {
		return this._initialQuery;
	}
	
	/**
	 * Returns the initial state's resource type
	 */
	public get initialType(): string {
		return this._initialType;
	}
	
	/**
	 * This method can be used to emit an error for this content element.
	 * The error will be handled by the error handler class
	 * @param reason
	 * @param code
	 * @param additionalPayload
	 */
	public emitError(reason: ReasonType, code?: number, additionalPayload?: PlainObject): Promise<any> {
		return this._errorHandler(reason, code, additionalPayload);
	}
}