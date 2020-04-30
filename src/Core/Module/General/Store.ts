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

import {EventEmitter} from "@labor-digital/helferlein/lib/Events/EventEmitter";
import {ListPath} from "@labor-digital/helferlein/lib/Interfaces/List";
import {PlainObject} from "@labor-digital/helferlein/lib/Interfaces/PlainObject";
import {forEach} from "@labor-digital/helferlein/lib/Lists/forEach";
import {getPath} from "@labor-digital/helferlein/lib/Lists/Paths/getPath";
import {hasPath} from "@labor-digital/helferlein/lib/Lists/Paths/hasPath";
import {isFunction} from "@labor-digital/helferlein/lib/Types/isFunction";
import {isPlainObject} from "@labor-digital/helferlein/lib/Types/isPlainObject";
import {isUndefined} from "@labor-digital/helferlein/lib/Types/isUndefined";
import Vue from "vue";

export interface StoreWatcher {
	(n: any, o: any): void
}

interface StoreVue extends Vue {
	state: PlainObject;
}

/**
 * This class is a super simple state storage object.
 * It is designed as a super lightweight alternative to vuex in smaller applications.
 */
export class Store {
	
	/**
	 * The event emitter to perform the binding proxy with
	 */
	protected _emitter: EventEmitter;
	
	/**
	 * The internal, reactive storage object
	 */
	protected _store: StoreVue;
	
	/**
	 * The list of already watched properties inside the store
	 */
	protected _watched: Set<string>;
	
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
		this._store = new Vue({
			data: {state: loadedState}
		});
		
		// Create the event emitter instance and the list of watched properties
		this._emitter = new EventEmitter(true);
		this._watched = new Set<string>();
	}
	
	/**
	 * Returns true if the store has a value for a given key
	 * @param key
	 */
	public has(key: ListPath): boolean {
		return hasPath(this._store.state, key);
	}
	
	/**
	 * Returns the value of a certain storage key or the default value if it does not exist
	 * @param key The name of the stored value to extract
	 * @param defaultValue An optional default value to return if the given key was not found
	 */
	public get(key: ListPath, defaultValue?: any): any {
		return getPath(this._store.state, key, defaultValue);
	}
	
	/**
	 * This is used to update or set the value of a certain key in the store
	 * @param key The name of the stored value to set
	 * @param value The value to set for the given key
	 */
	public set(key: string, value: any): Store {
		Vue.set(this._store.state, key, value);
		return this;
	}
	
	/**
	 * An alias for bind()
	 * @param key
	 * @param callback
	 * @see Store.bind()
	 */
	public watch(key: string, callback: StoreWatcher): Store {
		return this.bind(key, callback);
	}
	
	/**
	 * Used to watch a certain store property for changes. Works in the same way your
	 * normal vue watchers work, the callback receives two values, the first is the new the second the previous value.
	 *
	 * @param key The key of the property to watch
	 * @param callback The callback to execute when a property changes
	 */
	public bind(key: string, callback: StoreWatcher): Store {
		// Check if we have to watch for changes
		if (!this._watched.has(key)) {
			// Register a new watcher
			this._watched.add(key);
			this._store.$watch(() => this._store.state[key], (n, o) => {
				this._emitter.emit("update", [n, o]);
			});
		}
		// Add the callback as listener
		this._emitter.bind("update", callback);
		return this;
	}
	
	/**
	 * Used to unbind a previously bound callback from watching a property.
	 * @param key The key of the property to unbind the given callback from
	 * @param callback The callback to unbind from watching a property. If this is not given
	 * all callbacks are removed for the given property
	 */
	public unbind(key: string, callback?: StoreWatcher): Store {
		this._emitter.unbind("update", callback);
		return this;
	}
	
	/**
	 * Returns the internal store object.
	 * Note: be careful with this or you can break things quite easily.
	 */
	public getRaw(): PlainObject {
		return this._store.state;
	}
	
}