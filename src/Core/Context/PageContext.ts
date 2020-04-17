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
import Vue from "vue";
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
	
	public constructor(properties: PlainObject) {
		super(properties);
		this.store.set("page:common", {});
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
	 * Returns the instance of the event emitter, for this framework instance
	 * The event emitter is used for global events that should be handled across multiple components
	 */
	public get eventEmitter(): EventEmitter {
		return this._appContext.eventEmitter;
	}
	
	/**
	 * Returns either the currently active route or undefined if this method is called
	 * before the first page data was received from the server
	 */
	public get currentRoute(): Route | undefined {
		return this._currentRoute;
	}
	
	/**
	 * Returns the raw state object which holds the information about the current page
	 */
	public get state(): JsonApiState {
		return this.store.get("page:state");
	}
	
	/**
	 * Returns the page's meta data that was provided by the backend
	 */
	public get data(): State {
		console.log(this.store.get("page:data"));
		return this.store.get("page:data");
	}
	
	/**
	 * Returns the list of the common elements that were registered for this page
	 */
	public get commonElements(): PlainObject {
		console.log("HERE!", this.store.get("page:common"));
		return this.store.get("page:common");
	}
	
	/**
	 * Returns the numeric id of the current page
	 */
	public get id(): number {
		return this.state.get("id", 0);
	}
	
	/**
	 * Returns the current language code of the page.
	 * The code is a two char iso-code
	 */
	public get languageCode(): string {
		return this.state.get("languageCode", "en");
	}
	
	/**
	 * Returns the root line of this page, back to the root page of the tree
	 */
	public get rootLine(): Array<RootLineElementInterface> {
		return this.state.get("rootLine", []);
	}
	
	/**
	 * Returns the layout key/id/name that should be used for the current page
	 */
	public get layout(): string {
		return this.state.get("pageLayout", "default");
	}
	
	/**
	 * Can be used to manually refresh the definition of a common element
	 * @param key
	 */
	public refreshCommonElement(key: string): Promise<any> {
		return this.appContext.resourceApi.getSingle("commonElement", key)
			.then((state: JsonApiState) => {
				Vue.set(this.commonElements, key, state.get("element", {}));
				return true;
			});
	}
	
	/**
	 * Returns the child content of this page
	 */
	public get children(): ContentElementColumnListInterface {
		return this.state.get(["content", "children"], {});
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
		if (isUndefined(this.state)) return false;
		return this.state.get("isPreview", false);
	}
	
	/**
	 * Internal helper to update the current page state of the context
	 * @param page
	 * @private
	 */
	public __setCurrentPage(page: JsonApiState): void {
		// Store the raw page state and data
		this.store.set("page:state", page);
		this.store.set("page:data", new State(page.get("data", {})));
		
		// Update the common elements if there are any
		if (page.has("common")) {
			const common = this.store.get("page:common");
			forEach(page.get("common", {}), el => {
				Vue.set(common, el.id, el.element);
			});
		}
	}
}