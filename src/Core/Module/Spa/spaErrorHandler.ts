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
 * Last modified: 2019.12.12 at 15:17
 */

import {forEach} from "@labor-digital/helferlein/lib/Lists/forEach";
import {getPath} from "@labor-digital/helferlein/lib/Lists/Paths/getPath";
import {isArray} from "@labor-digital/helferlein/lib/Types/isArray";
import {isFunction} from "@labor-digital/helferlein/lib/Types/isFunction";
import {isUndefined} from "@labor-digital/helferlein/lib/Types/isUndefined";
import DefaultAppErrorComponent from "../../../Component/DefaultAppErrorComponent";
import {AppErrorConfigRouteDefinition, AppErrorRouteResolver} from "../../Config/AppConfig.interfaces";
import {SpaAppErrorConfigInterface} from "../../Config/SpaAppConfigInterface";
import {AppContext} from "../../Context/AppContext";
import {ConcreteErrorHandlerContextInterface} from "../../ErrorHandling/ErrorHandler.interfaces";
import {FrameworkEventList} from "../../Interface/FrameworkEventList";
import {FrameworkStoreKeys} from "../../Interface/FrameworkStoreKeys";

/**
 * The main error handler for spa apps
 * @param handlerContext
 * @param appContext
 */
export default function (handlerContext: ConcreteErrorHandlerContextInterface, appContext: AppContext): Promise<void> {
	let error = handlerContext.error;
	const config: SpaAppErrorConfigInterface = handlerContext.config;
	
	// Check if we have to redirect the user
	const isGlobalError = error.type !== "contentElement";
	let errorRoute = "/";
	let redirect = false;
	if (isArray(config.routes)) {
		const code = error.code;
		forEach(config.routes, (route: AppErrorConfigRouteDefinition) => {
			if (route.code === code) {
				if (isGlobalError) redirect = true;
				if (isFunction(route.route)) {
					errorRoute = (route.route as AppErrorRouteResolver)(error, appContext);
				} else {
					errorRoute = route.route as string;
				}
				if (route.sendToLogger === false) handlerContext.sendToLogger = false;
				if (route.printToConsole === false) handlerContext.printToConsole = false;
				return false;
			}
		});
	}
	
	// Prevent infinite loops
	const lastRoutes = appContext.errorHandler.navigationStack.slice(-2);
	if (lastRoutes.indexOf(errorRoute) !== -1) {
		console.error("Failed to redirect! It seems there would be an infinite loop between: " +
			(lastRoutes[1] ?? lastRoutes[0]) + " -> " + errorRoute);
		if (lastRoutes.indexOf("/") === -1) {
			console.info("Trying to redirect to root page...");
			errorRoute = "/";
		} else {
			console.error("I stay here!");
			redirect = false;
		}
	}
	
	return appContext.eventEmitter
		.emitHook(FrameworkEventList.HOOK_ON_ERROR, {
			handlerContext,
			appContext,
			errorRoute,
			redirect
		})
		.then(args => {
			// Skip if we should not handle the error
			if (args.handlerContext.ignore === true) return;
			
			// Check if we should handle a content element error
			error = args.handlerContext.error;
			if (!isGlobalError) {
				const component = getPath(error.additionalPayload, ["component"]);
				if (!isUndefined(component)) component.componentFailed = true;
			}
			
			// Set status for SSR
			appContext.vueRenderContext.status = error.code;
			
			// Wrap the redirecting into a promise we can chain
			return (() => {
				// Redirect the user to the error route
				if (args.redirect === true && appContext.pageContext.router.currentRoute.name !== "error") {
					const router = appContext.pageContext.router;
					const routeChanger = function (): Promise<any> {
						// Check if we have a router error
						if (!isUndefined(error.additionalPayload.routerNextValue)) {
							error.additionalPayload.routerNextValue = args.errorRoute;
							return Promise.resolve();
						}
						
						// Try to force the router to move to another route
						return router.replace(args.errorRoute);
					};
					return routeChanger()
						.catch(e => {
							console.error("Fatal error when navigating to the error component!");
							console.error(e);
						}).then(() => {
						});
				} else {
					// Get the app error component
					const appErrorComponent = getPath(appContext.config, ["vue", "staticComponents", "appErrorComponent"],
						DefaultAppErrorComponent);
					
					// Set the error component
					appContext.store.set(FrameworkStoreKeys.SPA_APP_ERROR_COMPONENT, appErrorComponent);
					
					return Promise.resolve();
				}
			})().then(() => {
				// Disable the browser caching on SSR
				if (appContext.isServer) {
					const renderContext = appContext.vueRenderContext;
					
					// Check if we have a response we can update
					if (!isUndefined(renderContext.serverResponse)) {
						const res = renderContext.serverResponse;
						
						// Set the no-cache headers on error
						if (isFunction(res.setHeader)) {
							if (res.headersSent) {
								console.log("DISABLE CACHE: Headers have already been sent!");
							} else {
								res.setHeader("Expires", "0");
								res.setHeader("Cache-Control", "no-cache, must-revalidate, max-age=0");
								res.setHeader("Pragma", "no-cache");
								res.setHeader("t3fa-browser-cache-enabled", "no");
							}
						}
						
						// Set the status for the response
						if (isFunction(res.status)) res.status(error.code);
					}
				}
			});
			
		})
		.catch(e => {
			console.error("Fatal error inside the error handler!");
			console.error(e);
		});
	
}