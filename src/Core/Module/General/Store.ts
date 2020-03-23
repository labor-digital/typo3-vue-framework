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
 * Last modified: 2019.10.29 at 17:41
 */

import {PlainObject} from "@labor-digital/helferlein/lib/Interfaces/PlainObject";
import {forEach} from "@labor-digital/helferlein/lib/Lists/forEach";
import {getPath} from "@labor-digital/helferlein/lib/Lists/Paths/getPath";
import {hasPath} from "@labor-digital/helferlein/lib/Lists/Paths/hasPath";
import {isArray} from "@labor-digital/helferlein/lib/Types/isArray";
import {isFunction} from "@labor-digital/helferlein/lib/Types/isFunction";
import {isPlainObject} from "@labor-digital/helferlein/lib/Types/isPlainObject";
import {isString} from "@labor-digital/helferlein/lib/Types/isString";
import {isUndefined} from "@labor-digital/helferlein/lib/Types/isUndefined";
import Vue from "vue";

/**
 * This class is a super simple state storage object.
 * It is designed as a super lightweight alternative to vuex in smaller applications.
 */
export class Store {
	
	/**
	 * The internal, reactive storage object
	 */
	protected _store;
	
	public constructor(internalInitialState: PlainObject, initialState ?: Function) {
		
		// Use a fallback to create an internal state if we did not got one provided
		if (isUndefined(initialState)) initialState = () => {
			return {};
		};
		
		// Validate the given initial state function
		if (!isFunction(initialState)) throw new Error("The given initial state for the Store has to be a function!");
		
		// Generate the loaded state and merge our internal values
		const loadedState: PlainObject = initialState();
		if (!isPlainObject(loadedState)) throw new Error("The given initial state function did not return a plain object!");
		forEach(internalInitialState, (v, k) => isUndefined(loadedState[k]) ? loadedState[k] = v : null);
		this._store = Vue.observable(loadedState);
	}
	
	/**
	 * Returns true if the store has a value for a given key
	 * @param key
	 */
	public has(key: string | Array<string>): boolean {
		if (isArray(key) || isString(key) && key.indexOf(".") !== -1) return hasPath(this._store, key);
		return !isUndefined(this._store[(key as string)]);
	}
	
	/**
	 * Returns the value of a certain storage key or the default value if it does not exist
	 * @param key The name of the stored value to extract
	 * @param defaultValue An optional default value to return if the given key was not found
	 */
	public get(key: string | Array<string>, defaultValue?: any): any {
		if (isArray(key) || isString(key) && key.indexOf(".") !== -1) return getPath(this._store, key, defaultValue);
		return isUndefined(this._store[(key as string)]) ? defaultValue : this._store[(key as string)];
	}
	
	/**
	 * This is used to update or set the value of a certain key in the store
	 * @param key The name of the stored value to set
	 * @param value The value to set for the given key
	 */
	public set(key: string, value: any): Store {
		Vue.set(this._store, key, value);
		return this;
	}
	
	/**
	 * Returns the internal store object.
	 * Note: be careful with this or you can break things quite easily.
	 */
	public getRaw(): PlainObject {
		return this._store;
	}
	
}