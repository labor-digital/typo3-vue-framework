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

import {EventEmitter, EventEmitterEvent, forEach, isString, isUndefined, PlainObject} from "@labor-digital/helferlein";
import {AxiosInstance} from "axios";
import Vue from "vue";
import {Route, VueRouter} from "vue-router/types/router";
import {SpaAppLayoutComponentListInterface} from "../Config/AppConfig.interfaces";
import {ContentElementColumnListInterface} from "../Interface/ContentElementColumnListInterface";
import {FrameworkEventList} from "../Interface/FrameworkEventList";
import {FrameworkStoreKeys} from "../Interface/FrameworkStoreKeys";
import {RootLineElementInterface} from "../Interface/RootLineElementInterface";
import {JsonApi, Resource, State} from "../JsonApi/IdeHelper";
import {Store} from "../Module/General/Store";
import {Translation} from "../Module/General/Translation";
import {LinkRepository} from "../Module/Spa/LinkRepository";
import {PageMeta} from "../Module/Spa/PageMeta";
import {PidRepository} from "../Module/Spa/PidRepository";
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
	 * The repository to look up the configured PIDs (page-ids).
	 * The pid configuration is passed by the frontend api every
	 * time a page response is requested from the server
	 */
	protected _pidRepository: PidRepository;
	
	/**
	 * Allows to access all links that have been given by the current page
	 * @protected
	 */
	protected _linkRepository: LinkRepository;
	
	public constructor(properties: PlainObject) {
		super(properties);
		this.store.set(FrameworkStoreKeys.SPA_PAGE_SITE_URL, properties.siteUrl);
		this.store.set(FrameworkStoreKeys.SPA_PAGE_COMMON_ELEMENTS, {});
		this.store.set(FrameworkStoreKeys.SPA_PAGE_STATE, new State({}));
		this.store.set(FrameworkStoreKeys.SPA_PAGE_DATA, new State({}));
		this.eventEmitter.bind(FrameworkEventList.HOOK_UPDATE_FRAMEWORK_AFTER_NAVIGATION,
			e => this.afterNavigation(e));
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
	 * Returns the axios instance to communicate with api endpoint's that are not considered a "resource"
	 */
	public get axios(): AxiosInstance {
		return this._appContext.axios;
	}
	
	/**
	 * Returns the resource api axios wrapper that handles communication with the TYPO3 resource api
	 */
	public get resourceApi(): JsonApi {
		return this._appContext.resourceApi;
	}
	
	/**
	 * Returns the translation class with information about the current localization of the framework instance
	 */
	public get translation(): Translation | undefined {
		return this._appContext.translation;
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
		return this.store.get(FrameworkStoreKeys.SPA_PAGE_ROUTE);
	}
	
	/**
	 * Returns the raw state object which holds the information about the current page
	 */
	public get state(): Resource {
		return this.store.get(FrameworkStoreKeys.SPA_PAGE_STATE);
	}
	
	/**
	 * Returns the page's meta data that was provided by the backend
	 */
	public get data(): State {
		return this.store.get(FrameworkStoreKeys.SPA_PAGE_DATA);
	}
	
	/**
	 * Returns the list of the common elements that were registered for this page
	 */
	public get commonElements(): PlainObject {
		return this.store.get(FrameworkStoreKeys.SPA_PAGE_COMMON_ELEMENTS);
	}
	
	/**
	 * Returns the numeric id of the current page
	 */
	public get id(): number {
		return this.state.get("id", 0);
	}
	
	/**
	 * Return the repository to look up the configured PIDs (page-ids)
	 */
	public get pidRepository(): PidRepository {
		return this._pidRepository;
	}
	
	/**
	 * Returns the repository which allows to access all links that have been given by the current page
	 */
	public get linkRepository(): LinkRepository {
		return this._linkRepository;
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
		return this.appContext.resourceApi.getResource("commonElement", key)
			.then((state: Resource) => {
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
	 * Alias for baseUrl
	 * @see siteUrl
	 */
	public get siteUrl(): string {
		return this.baseUrl;
	}
	
	/**
	 * Returns the site's base url for the current page
	 */
	public get baseUrl(): string {
		return this.store.get(FrameworkStoreKeys.SPA_PAGE_SITE_URL);
	}
	
	/**
	 * Returns true if the current page is in preview mode
	 */
	public get isPreview(): boolean {
		if (isUndefined(this.state)) return false;
		return this.state.get("isPreview", false);
	}
	
	/**
	 * Event handler to update the context after a navigation took place
	 * @param e
	 */
	protected afterNavigation(e: EventEmitterEvent): void {
		// Update the route
		this.store.set(FrameworkStoreKeys.SPA_PAGE_ROUTE, e.args.to);
		
		// Store the raw page state and data
		const state: Resource = e.args.state;
		this.store.set(FrameworkStoreKeys.SPA_PAGE_STATE, state);
		this.store.set(FrameworkStoreKeys.SPA_PAGE_DATA, new State(state.get("data", {})));
		
		// Update site url if required
		if (state.get("siteUrl") !== this.siteUrl &&
			isString(state.get("siteUrl")) &&
			state.get("siteUrl").trim() !== "") {
			this.store.set(FrameworkStoreKeys.SPA_PAGE_SITE_URL, state.get("siteUrl"));
		}
		
		// Update the common elements if there are any
		if (state.has("common")) {
			const common = this.store.get(FrameworkStoreKeys.SPA_PAGE_COMMON_ELEMENTS);
			forEach(state.get("common", {}), el => {
				Vue.set(common, el.id, el.element);
			});
		}
	}
}