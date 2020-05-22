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
 * Last modified: 2020.04.19 at 19:48
 */

import {EventEmitter, EventEmitterEvent} from "@labor-digital/helferlein/lib/Events/EventEmitter";
import {ListPath} from "@labor-digital/helferlein/lib/Interfaces/List";
import {PlainObject} from "@labor-digital/helferlein/lib/Interfaces/PlainObject";
import {getPath} from "@labor-digital/helferlein/lib/Lists/Paths/getPath";
import {isNumber} from "@labor-digital/helferlein/lib/Types/isNumber";
import {isNumeric} from "@labor-digital/helferlein/lib/Types/isNumeric";
import {isUndefined} from "@labor-digital/helferlein/lib/Types/isUndefined";
import {FrameworkEventList} from "../../Interface/FrameworkEventList";
import {FrameworkStoreKeys} from "../../Interface/FrameworkStoreKeys";
import {Resource} from "../../JsonApi/IdeHelper";
import {Store} from "../General/Store";

export class PidRepository {
	
	/**
	 * The reactive store to read the pid configuration from
	 */
	protected _store: Store;
	
	/**
	 * PidRepository constructor.
	 * @param store
	 * @param eventEmitter
	 */
	public constructor(store: Store, eventEmitter: EventEmitter) {
		this._store = store;
		
		// Bind update event
		eventEmitter.bind(FrameworkEventList.HOOK_UPDATE_FRAMEWORK_AFTER_NAVIGATION,
			e => this.afterNavigation(e));
	}
	
	/**
	 * Returns the pid for the given key
	 * @param key A key like "myKey", "$pid.storage.stuff" or "storage.myKey" for hierarchical data
	 * If a key's value is numeric and can be parsed as integer it will be returned if no pid could be found
	 * @param fallback An optional fallback which will be returned, if the required pid was not found
	 * NOTE: If no fallback is defined -1 is returned if no value was found for the key
	 */
	public getPid(key: ListPath, fallback?: number | string): number {
		if (!isNumeric(fallback)) fallback = -1;
		if (!isNumber(fallback)) fallback = parseInt(fallback as string);
		const result = getPath(this.getAllPids(), key, fallback);
		if (!isNumber(result)) return fallback as number;
		return result;
	}
	
	/**
	 * Returns true if the pid with the given key exists
	 *
	 * @param key A key like "myKey" or "storage.myKey" for hierarchical data
	 */
	public hasPid(key: ListPath): boolean {
		return this.getPid(key, -9999) === -9999;
	}
	
	/**
	 * Returns the whole list of all registered pid's by their keys as hierarchical object
	 */
	public getAllPids(): PlainObject {
		return this._store.get(FrameworkStoreKeys.SPA_PAGE_PID_CONFIGURATION, {});
	}
	
	/**
	 * Returns the current page's pid
	 * Returns -1 if there is currently no TYPO3 page in the page context
	 */
	public getCurrentPid(): number {
		const state: Resource | undefined = this._store.get(FrameworkStoreKeys.SPA_PAGE_STATE);
		if (isUndefined(state)) return -1;
		return state.get("id", -1);
	}
	
	/**
	 * Event handler to update the stored information after a navigation
	 * @param e
	 */
	protected afterNavigation(e: EventEmitterEvent): void {
		const state: Resource = e.args.state;
		this._store.set(FrameworkStoreKeys.SPA_PAGE_PID_CONFIGURATION, state.get("pidConfig", {}));
	}
}