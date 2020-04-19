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
import {isArray} from "@labor-digital/helferlein/lib/Types/isArray";
import {isFunction} from "@labor-digital/helferlein/lib/Types/isFunction";
import {isUndefined} from "@labor-digital/helferlein/lib/Types/isUndefined";
import {CreateElement, VNode} from "vue";
import {Route} from "vue-router";
import {AppContext} from "../../Context/AppContext";
import {FrameworkEventList} from "../../Interface/FrameworkEventList";
import {FrameworkStoreKeys} from "../../Interface/FrameworkStoreKeys";
import {JsonApiGetQuery, JsonApiState, JsonApiStateList} from "../../JsonApi/IdeHelper";

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
		const isInitialRequest = this._initialRequest;
		
		// Emit event
		appContext.eventEmitter.emit(FrameworkEventList.EVENT_ROUTE_BEFORE_NAVIGATION, {to, from});
		
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
				// Handle special responses
				if (state.response.status === 203)
					return this.handleSpecialResponse(state, appContext, next);
				
				// Allow filtering
				return appContext.eventEmitter.emitHook(FrameworkEventList.HOOK_ROUTE_STATE_PRE_PROCESSOR, {
						state, context: appContext.pageContext, to, from
					})
					.then(args => {
						// Mark that we are running a subsequent request
						this._initialRequest = false;
						
						// Special SSR handling on the server side
						if (appContext.isServer)
							this.handleSsrCacheHeaders(args.state, args.context.appContext);
						
						// Update the framework
						return appContext.eventEmitter.emitHook(FrameworkEventList.HOOK_UPDATE_FRAMEWORK_AFTER_NAVIGATION, {
							state: args.state, context: appContext.pageContext, to: args.to, from: args.from
						});
					})
					.then(args => {
						// Allow filtering
						return appContext.eventEmitter.emitHook(FrameworkEventList.HOOK_ROUTE_STATE_POST_PROCESSOR, {
							state: args.state, context: appContext.pageContext, to: args.to, from: args.from
						});
					})
					.then((args) => {
						appContext.eventEmitter.emit(FrameworkEventList.EVENT_ROUTE_AFTER_NAVIGATION, args);
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
			})
			.finally(() => {
				// Activate the app rendering as we now have content to show...
				if (isInitialRequest)
					appContext.store.set(FrameworkStoreKeys.SPA_APP_HAS_CONTENT, true);
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
			
			// Check if we have to refresh common objects
			const refreshCommon = getPath(this._appContext.config, "router.refreshCommonElements");
			if (isArray(refreshCommon)) query.refreshCommon = refreshCommon.join(",");
		}
		
		// Done
		return this._appContext.eventEmitter.emitHook(FrameworkEventList.HOOK_ROUTE_QUERY_FILTER, {query, slug});
	}
	
	/**
	 * Internal logic to handle special server responses from the page resource endpoint
	 * If a 203 status code was returned by the API we expect an object containing a "type" property
	 * that defines how we should handle the response.
	 *
	 * Currently supported types:
	 * 		"redirect": Redirects a request to another website using a 30x status code
	 *
	 * @param state
	 * @param appContext
	 * @param next
	 */
	protected handleSpecialResponse(state: JsonApiState | JsonApiStateList, appContext: AppContext, next: Function): Promise<any> {
		// Check if we can handle the special response type
		switch (state.get("type")) {
			case "redirect":
				// Handle redirect
				
				// Make sure we don't render the app on the server side
				if (appContext.isServer) {
					appContext.store.set(FrameworkStoreKeys.SPA_APP_COMPONENT_OVERWRITE, {
						render(createElement: CreateElement): VNode {
							const renderContext = appContext.vueRenderContext;
							if (!isUndefined(renderContext.serverResponse) &&
								isFunction(renderContext.serverResponse.redirect)) {
								renderContext.serverResponse.redirect(
									state.get("code", 301), state.get("target"));
							}
							return createElement("div", ["Redirecting..."]);
						}
					});
				} else {
					// Update the location
					window.location.href = state.get("target");
				}
				next(false);
				return Promise.resolve();
			default:
				return Promise.reject(new Error("Error while handling special API instructions (code: 203). No valid type was returned!"));
		}
	}
	
	/**
	 * Internal logic to update the express server's response headers based on the API headers
	 * we received from the backend
	 *
	 * @param state
	 * @param appContext
	 */
	protected handleSsrCacheHeaders(state: JsonApiState | JsonApiStateList, appContext: AppContext): void {
		// Store the state
		appContext.vueRenderContext.state = state.response;
		
		// Disable the browser caching on SSR, if the API responded with a no-cache header
		const browserCacheState = getPath(state, ["response", "headers", "t3fa-browser-cache-enabled"], "yes");
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
}