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

import {EventEmitterEvent, isPlainObject, PlainObject} from "@labor-digital/helferlein";
import {Route} from "vue-router";
import {AppContext} from "../../Context/AppContext";
import {FrameworkEventList} from "../../Interface/FrameworkEventList";
import {FrameworkStoreKeys} from "../../Interface/FrameworkStoreKeys";
import {Resource} from "../../JsonApi/IdeHelper";

export class LinkRepository {
	
	/**
	 * The app context object to access both the store and the vue router
	 * @protected
	 */
	protected _context: AppContext;
	
	
	/**
	 * LinkRepository constructor.
	 * @param appContext
	 */
	public constructor(appContext: AppContext) {
		this._context = appContext;
		
		// Bind update event
		appContext.eventEmitter.bind(FrameworkEventList.HOOK_UPDATE_FRAMEWORK_AFTER_NAVIGATION,
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
	 * Allows you to navigate the user to the link with the given key.
	 * Note: This only works for internal links.
	 * @param key
	 */
	public goTo(key: string): Promise<Route> {
		let url = this.get(key);
		if (url === "")
			return Promise.reject(new Error("Could not go to link with key: \"" + key + "\" because it was not found!"));
		// @todo better handling for external urls/ if the user is already on the page
		try {
			return this._context.pageContext.router.push(url.replace(/^(?:\/\/|[^/]+)*\//, ""));
		} catch (e) {
			return Promise.reject(e);
		}
	}
	
	/**
	 * Returns all links that have been registered for this page
	 */
	public getAll(): PlainObject<string> {
		return this._context.store.get(FrameworkStoreKeys.SPA_PAGE_LINKS, {});
	}
	
	/**
	 * Event handler to update the stored information after a navigation
	 * @param e
	 */
	protected afterNavigation(e: EventEmitterEvent): void {
		const state: Resource = e.args.state;
		this._context.store.set(FrameworkStoreKeys.SPA_PAGE_LINKS,
			isPlainObject(state.response.links) ? state.response.links : {}
		);
	}
}