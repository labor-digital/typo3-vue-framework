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
 * Last modified: 2019.11.29 at 21:46
 */

import {getPath} from "@labor-digital/helferlein/lib/Lists/Paths/getPath";
import {hasPath} from "@labor-digital/helferlein/lib/Lists/Paths/hasPath";
import {isFunction} from "@labor-digital/helferlein/lib/Types/isFunction";
import {isUndefined} from "@labor-digital/helferlein/lib/Types/isUndefined";
import {Route} from "vue-router";
import {AppContext} from "../../Context/AppContext";
import {EventList} from "../../Interface/EventList";
import {JsonApiGetQuery, JsonApiState} from "../../JsonApi/IdeHelper";

export class RouteHandler {
	
	/**
	 * True as long we did not sent at least a single request to the page api
	 */
	protected _initialRequest: boolean;
	
	/**
	 * The app context we are handling the routes of
	 */
	protected _appContext: AppContext;
	
	/**
	 * Route handler constructor
	 * @param appContext
	 */
	public constructor(appContext: AppContext) {
		this._appContext = appContext;
		this._initialRequest = true;
	}
	
	/**
	 * Is called in the route component in the beforeRouteEnter() gate
	 * and handles the request of new page data from the server
	 * @param to
	 * @param from
	 * @param next
	 */
	public handle(to: Route, from: Route, next: Function): void {
		const appContext = this._appContext;
		const pageContext = appContext.pageContext;
		
		// Emit event
		appContext.eventEmitter.emit(EventList.EVENT_ROUTE_BEFORE_NAVIGATION, {to, from});
		
		// Store the navigation
		appContext.errorHandler.pushNavigationStack(to.fullPath);
		
		// Make the request
		this.buildQuery(to.path)
			.then(args => {
				// Check if we are running in the browser and may fetch the initial request from the global marker
				// when the framework was rendered by the SSR counterpart
				if (this._initialRequest && appContext.isClient &&
					hasPath(window, ["__INITIAL_STATE__"]))
					return appContext.resourceApi.makeStateOrStateList(
						getPath(window, ["__INITIAL_STATE__"], {}));
				
				// Request the information using the api
				return appContext.resourceApi.getSingle("page/bySlug", null, args.query);
			})
			.then((state) => {
				// Allow filtering
				return appContext.eventEmitter.emitHook(EventList.HOOK_ROUTE_STATE_PRE_PROCESSOR, {
						state,
						context: appContext,
						to,
						from
					})
					.then(args => {
						// Mark that we are running a subsequent request
						this._initialRequest = false;
						
						// Special SSR handling on the server side
						if (appContext.isServer) {
							
							// Store the state
							appContext.vueRenderContext.state = args.state.response;
							
							// Disable the browser caching on SSR, if the API responded with a no-cache header
							const browserCacheState = getPath(args.state, ["response", "headers", "t3fa-browser-cache-enabled"], "yes");
							const renderContext = appContext.vueRenderContext;
							if (!isUndefined(renderContext.serverResponse) &&
								isFunction(renderContext.serverResponse.setHeader)) {
								const res = renderContext.serverResponse;
								if (res.headersSent) {
									console.log("DISABLE CACHE: Headers have already been sent!");
								} else {
									if (browserCacheState === "no") {
										res.setHeader("Expires", "0");
										res.setHeader("Cache-Control", "no-cache, must-revalidate, max-age=0");
										res.setHeader("Pragma", "no-cache");
									}
									res.setHeader("t3fa-browser-cache-enabled", browserCacheState);
								}
							}
						}
						
						// Update the page context using the new state
						const state: JsonApiState = args.state;
						pageContext.__setProperty("currentRoute", args.to);
						pageContext.__setCurrentPage(state);
						appContext.translation.__setLanguageForPageRoute(state as any);
						
						// Update page meta
						pageContext.pageMeta.setRaw({
							title: state.get(["data", "title"]),
							htmlAttrs: {
								lang: appContext.translation.languageCode
							},
							link: [
								{
									rel: "canonical", href: state.get(["data", "canonicalUrl"])
								}
							],
							meta: state.get(["data", "metaTags"])
						});
						
						// Allow filtering
						return appContext.eventEmitter.emitHook(EventList.HOOK_ROUTE_STATE_POST_PROCESSOR, {
							state,
							context: appContext.pageContext,
							to,
							from
						});
					})
					.then((args) => {
						// Emit event
						appContext.eventEmitter.emit(EventList.EVENT_ROUTE_AFTER_NAVIGATION, args);
						
						// Carry on
						next();
					});
			})
			.catch(e => {
				const err = appContext.errorHandler.makeNetworkError(e);
				const context = {to, from, routerNextValue: false};
				err.addAdditionalPayload(context);
				return appContext.errorHandler.emitError(err).then(() => {
					const nextValue = getPath(err.additionalPayload, ["routerNextValue"], context.routerNextValue);
					next(nextValue);
				});
			});
	}
	
	/**
	 * Internal helper to build the api query based on the given slug
	 * @param slug
	 */
	protected buildQuery(slug: string): Promise<JsonApiGetQuery> {
		const query: JsonApiGetQuery = {
			slug: slug
		};
		
		// Handle the initial query
		if (this._initialRequest) query.include = "*";
		else {
			// Handle subsequent query
			query.loadedLanguageCodes = this._appContext.translation.loadedLanguageCodes;
			query.currentLayout = this._appContext.pageContext.layout;
			query.include = ["content", "data"];
		}
		
		// Done
		return this._appContext.eventEmitter.emitHook(EventList.HOOK_ROUTE_QUERY_FILTER, {query, slug});
	}
}