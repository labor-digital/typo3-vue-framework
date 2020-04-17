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
 * Last modified: 2019.12.12 at 12:53
 */

import {EventEmitter} from "@labor-digital/helferlein/lib/Events/EventEmitter";
import {PlainObject} from "@labor-digital/helferlein/lib/Interfaces/PlainObject";
import {forEach} from "@labor-digital/helferlein/lib/Lists/forEach";
import {isUndefined} from "@labor-digital/helferlein/lib/Types/isUndefined";
import {Route, VueRouter} from "vue-router/types/router";
import {SpaAppLayoutComponentListInterface} from "../Config/AppConfig.interfaces";
import {ContentElementColumnListInterface} from "../Interface/ContentElementColumnListInterface";
import {RootLineElementInterface} from "../Interface/RootLineElementInterface";
import {JsonApiState, State} from "../JsonApi/IdeHelper";
import {Store} from "../Module/General/Store";
import {PageMeta} from "../Module/Spa/PageMeta";
import {AbstractContext} from "./AbstractContext";
import {AppContext} from "./AppContext";

export class PageContext extends AbstractContext {
	
	/**
	 * The reference to the app context
	 */
	protected _appContext: AppContext;
	
	/**
	 * The list of layout components that are registered for this framework instance
	 */
	protected _layoutComponents: SpaAppLayoutComponentListInterface;
	
	/**
	 * The vue router we use for this app
	 */
	protected _router: VueRouter;
	
	/**
	 * The page meta object to modify the page's metadata and title
	 */
	protected _pageMeta: PageMeta;
	
	/**
	 * The base url of the current application
	 */
	protected _baseUrl: string;
	
	/**
	 * The currently active route
	 */
	protected _currentRoute: Route;
	
	/**
	 * Holds the current page information
	 */
	protected _page: JsonApiState;
	
	/**
	 * Holds the page data as state object
	 */
	protected _data: State;
	
	/**
	 * Holds the common elements as definition object
	 */
	protected _commonElements: PlainObject;
	
	public constructor(properties: PlainObject) {
		super(properties);
		if (isUndefined(this._commonElements)) this._commonElements = {};
	}
	
	/**
	 * Return the type of this context
	 */
	public get type(): string {
		return "page";
	}
	
	/**
	 * Returns the parent/app context object
	 */
	public get appContext(): AppContext {
		return this._appContext;
	}
	
	/**
	 * Returns the instance of the vue router
	 */
	public get router(): VueRouter {
		return this._router;
	}
	
	/**
	 * Returns the list of all registered layout components of this framework instance
	 */
	public get layoutComponents(): SpaAppLayoutComponentListInterface {
		return this._layoutComponents;
	}
	
	/**
	 * Returns the page meta object to modify the page's metadata and title
	 */
	public get pageMeta(): PageMeta {
		return this._pageMeta;
	}
	
	/**
	 * Returns the store instance to hold global application data
	 */
	public get store(): Store {
		return this.appContext.store;
	}
	
	/**
	 * Returns either the currently active route or undefined if this method is called
	 * before the first page data was received from the server
	 */
	public get currentRoute(): Route | undefined {
		return this._currentRoute;
	}
	
	/**
	 * Returns the numeric id of the current page
	 */
	public get id(): number {
		return this._page.get("id", 0);
	}
	
	/**
	 * Returns the current language code of the page.
	 * The code is a two char iso-code
	 */
	public get languageCode(): string {
		return this._page.get("languageCode", "en");
	}
	
	/**
	 * Returns the root line of this page, back to the root page of the tree
	 */
	public get rootLine(): Array<RootLineElementInterface> {
		return this._page.get("rootLine", []);
	}
	
	/**
	 * Returns the layout key/id/name that should be used for the current page
	 */
	public get layout(): string {
		return this._page.get("pageLayout", "default");
	}
	
	/**
	 * Returns the page's meta data that was provided by the backend
	 */
	public get data(): State {
		return this._data;
	}
	
	/**
	 * Returns the list of the common elements that were registered for this page
	 */
	public get commonElements(): PlainObject {
		return this._commonElements;
	}
	
	/**
	 * Can be used to manually refresh the definition of a common element
	 * @param key
	 */
	public refreshCommonElement(key: string): Promise<any> {
		return this.appContext.resourceApi.getSingle("commonElement", key)
			.then((state: JsonApiState) => {
				this._commonElements[key] = state.get("element", {});
				return true;
			});
	}
	
	/**
	 * Returns the raw state object which holds the information about the current page
	 */
	public get state(): JsonApiState {
		return this._page;
	}
	
	/**
	 * Returns the child content of this page
	 */
	public get children(): ContentElementColumnListInterface {
		return this._page.get(["content", "children"], {});
	}
	
	/**
	 * An alias for children()
	 */
	public get content(): ContentElementColumnListInterface {
		return this.children;
	}
	
	/**
	 * Returns the base url that was configured for this framework instance
	 */
	public get baseUrl(): string {
		return this._baseUrl;
	}
	
	/**
	 * Returns true if the current page is in preview mode
	 */
	public get isPreview(): boolean {
		return this._page.get("isPreview", false);
	}
	
	/**
	 * Returns the instance of the event emitter, for this framework instance
	 * The event emitter is used for global events that should be handled across multiple components
	 */
	public get eventEmitter(): EventEmitter {
		return this._appContext.eventEmitter;
	}
	
	/**
	 * Internal helper to update the current page state of the context
	 * @param page
	 * @private
	 */
	public __setCurrentPage(page: JsonApiState): void {
		// Store the raw page state
		this._page = page;
		
		// Create the data state object
		this._data = new State(page.get("data", {}));
		
		// Update the common elements if there are any
		if (this._page.has("common")) {
			forEach(this._page.get("common", {}), el => {
				this._commonElements[el.id] = el.element;
			});
		}
		
		// Update the store
		this.appContext.store.set("pageIsPreview", this.isPreview);
	}
}