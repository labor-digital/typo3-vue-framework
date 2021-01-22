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
 * Last modified: 2019.12.30 at 15:47
 */

import {getData} from "@labor-digital/helferlein/lib/Dom/getData";
import {PlainObject} from "@labor-digital/helferlein/lib/Interfaces/PlainObject";
import {cloneList} from "@labor-digital/helferlein/lib/Lists/cloneList";
import {forEach} from "@labor-digital/helferlein/lib/Lists/forEach";
import {getPath} from "@labor-digital/helferlein/lib/Lists/Paths/getPath";
import {isPlainObject} from "@labor-digital/helferlein/lib/Types/isPlainObject";
import {Component, CreateElement, VNode} from "vue";
import ContentElementComponent from "../../Component/ContentElementComponent";
import {HybridAppConfigInterface} from "../Config/HybridAppConfigInterface";
import {AppContext} from "../Context/AppContext";
import {ContentElementComponentDefinitionInterface} from "../Interface/ContentElementComponentDefinitionInterface";
import hybridErrorHandler from "../Module/Hybrid/hybridErrorHandler";
import {BasicBootstrap} from "./BasicBootstrap";

export class HybridBootstrap {
	/**
	 * Register the hybrid specific error handler in the context
	 * @param appContext
	 */
	public static registerConcreteErrorHandler(appContext: AppContext): Promise<AppContext> {
		appContext.errorHandler.setConcreteErrorHandler((context) => hybridErrorHandler(context, appContext));
		return Promise.resolve(appContext);
	}
	
	/**
	 * This method is used to load global data either from the process' environment
	 * or from a global window variable, that can be configured in the hybrid app's config object
	 * @param appContext
	 */
	public static loadGlobalDataIntoRenderingContext(appContext: AppContext): Promise<AppContext> {
		let globalData = {};
		if (appContext.isServer) globalData = getPath(process, ["env", "FRONTEND_API_DATA"], {});
		else {
			if (typeof process.env.FRONTEND_API_DATA !== "undefined")
				globalData = process.env.FRONTEND_API_DATA;
			else globalData = getPath(window, [
				getPath((appContext.config as HybridAppConfigInterface), ["globalDataWindowVar"], "FRONTEND_API_DATA")], {});
		}
		appContext.vueRenderContext.globalData = globalData;
		return Promise.resolve(appContext);
	}
	
	/**
	 * This method is used to prepare the translation plugin by providing the translation strings from the global data object
	 * @param appContext
	 */
	public static registerTranslation(appContext: AppContext): Promise<AppContext> {
		appContext.translation.__setLanguageForHybridApp(
			getPath(appContext, ["vueRenderContext", "globalData", "translations"], {}));
		return Promise.resolve(appContext);
	}
	
	/**
	 * Finds the content elements on a page and creates vue apps based on their definitions
	 * @param appContext
	 */
	public static makeVueApps(appContext: AppContext): Promise<Array<AppContext>> {
		// Find all elements we want to initialize
		const selector = getPath((appContext.config as HybridAppConfigInterface), ["contentElementSelector"],
			"div[data-typo-frontend-api-content-element]");
		const definitionTags = document.querySelectorAll(selector) as any;
		if (definitionTags.length === 0) return Promise.resolve([]);
		
		// Instantiate the vue apps
		const promises = [];
		const contexts = [];
		forEach(definitionTags, (container: HTMLElement) => {
			promises.push(new Promise((resolve) => {
				// Create a clone of the app context
				const localAppContext = appContext.__clone();
				
				// Store the context
				contexts.push(localAppContext);
				
				// Create the container and the mount point for this element
				const mountPoint = container.appendChild(document.createElement("div"));
				
				// Prepare our working slots
				let definition: ContentElementComponentDefinitionInterface | PlainObject = {};
				let component: Component | PlainObject = {$el: mountPoint};
				
				// Wrap the boot of a single component in a promise
				return Promise.resolve()
					.then(() => {
						
						// Read the definition
						definition = HybridBootstrap.readElementDefinition(container, appContext);
						
						
						// Register the content element component as render function
						localAppContext.config.vue.config.render =
							(createElement: CreateElement): VNode =>
								createElement(ContentElementComponent, {props: {definition: definition}});
						
						// Set the mountPoint as element
						localAppContext.config.vue.config.el = mountPoint;
						
						// Call the config filter for each instance
						return BasicBootstrap.applyVueConfigFilter(localAppContext);
						
					}).then(localAppContext => {
						
						// Create the vue instance on our mountPoint
						return BasicBootstrap.makeVueInstance(localAppContext);
						
					}).then(localAppContext => {
						
						// Mount the app
						localAppContext.vue.$mount(mountPoint);
						
					}).catch(e => {
						// Make sure every component is handled separately
						const error = localAppContext.errorHandler.makeContentElementError(e, component, definition as any);
						return localAppContext.errorHandler.emitError(error);
					})
					.then(() => {
						// Done
						resolve(contexts);
					});
			}));
			
		});
		
		// Wait till all elements are resolved and return the contexts
		return Promise.all(promises).then(() => contexts);
	}
	
	/**
	 * Internal helper to read the json element definition from the html mount point
	 * @param el
	 * @param appContext
	 */
	protected static readElementDefinition(el: HTMLElement, appContext: AppContext): ContentElementComponentDefinitionInterface {
		const attribute = getPath((appContext.config as HybridAppConfigInterface), ["contentElementDefinitionAttribute"],
			"data-typo-frontend-api-content-element");
		let definition = getData(el, attribute, {});
		if (!isPlainObject(definition) || !isPlainObject(definition.data)) throw new Error("Invalid definition for content element");
		if (isPlainObject(definition.data.attributes)) {
			let definitionClone = definition.data.attributes;
			definitionClone.id = definition.data.id;
			definition = definitionClone;
		}
		return cloneList(definition) as any;
	}
}