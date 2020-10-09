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
 * Last modified: 2020.10.09 at 11:47
 */

import {EventEmitter, EventEmitterEvent} from "@labor-digital/helferlein/lib/Events/EventEmitter";
import {PlainObject} from "@labor-digital/helferlein/lib/Interfaces/PlainObject";
import {isPlainObject} from "@labor-digital/helferlein/lib/Types/isPlainObject";
import {FrameworkEventList} from "../../Interface/FrameworkEventList";
import {FrameworkStoreKeys} from "../../Interface/FrameworkStoreKeys";
import {Resource} from "../../JsonApi/IdeHelper";
import {Store} from "../General/Store";

export class LinkRepository {
	/**
	 * The reactive store to read the links from
	 */
	protected _store: Store;
	
	/**
	 * LinkRepository constructor.
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
	 * Returns true if a certain link exists, false if not
	 * @param key
	 */
	public has(key: string): boolean {
		return this.get(key) !== "";
	}
	
	/**
	 * Returns a single link that was registered for this page or an empty string if it does not exist
	 * @param key
	 */
	public get(key: string): string {
		return this.getAll()[key] ?? "";
	}
	
	/**
	 * Returns all links that have been registered for this page
	 */
	public getAll(): PlainObject<string> {
		return this._store.get(FrameworkStoreKeys.SPA_PAGE_LINKS, {});
	}
	
	/**
	 * Event handler to update the stored information after a navigation
	 * @param e
	 */
	protected afterNavigation(e: EventEmitterEvent): void {
		const state: Resource = e.args.state;
		this._store.set(FrameworkStoreKeys.SPA_PAGE_LINKS,
			isPlainObject(state.response.links) ? state.response.links : {}
		);
	}
}