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
 * Last modified: 2019.09.27 at 14:48
 */

import {PlainObject} from "@labor-digital/helferlein/lib/Interfaces/PlainObject";
import {forEach} from "@labor-digital/helferlein/lib/Lists/forEach";
import {getPath} from "@labor-digital/helferlein/lib/Lists/Paths/getPath";
import {htmlDecode} from "@labor-digital/helferlein/lib/Strings/htmlDecode";
import {inflectToCamelCase} from "@labor-digital/helferlein/lib/Strings/Inflector/inflectToCamelCase";
import {isArray} from "@labor-digital/helferlein/lib/Types/isArray";
import {isFunction} from "@labor-digital/helferlein/lib/Types/isFunction";
import {isPlainObject} from "@labor-digital/helferlein/lib/Types/isPlainObject";
import {isString} from "@labor-digital/helferlein/lib/Types/isString";
import {isUndefined} from "@labor-digital/helferlein/lib/Types/isUndefined";
import {ComponentOptions, CreateElement, VNode} from "vue";
import {hydrateWhenIdle} from "vue-lazy-hydration/dist/LazyHydrate.js";
import {Component} from "vue/types/options";
import {Vue} from "vue/types/vue";
import {AppContext} from "../Core/Context/AppContext";
import {ContentElementContext} from "../Core/Context/ContentElementContext";
import {ContentElementErrorHandler, ReasonType} from "../Core/ErrorHandling/ErrorHandler.interfaces";
import {ContentElementComponentDefinitionInterface} from "../Core/Interface/ContentElementComponentDefinitionInterface";
import {FrameworkEventList} from "../Core/Interface/FrameworkEventList";
import DefaultContentElementErrorComponent from "./DefaultContentElementErrorComponent";
import DefaultContentElementLoaderComponent from "./DefaultContentElementLoaderComponent";
import StaticHtmlComponent from "./StaticHtmlComponent";

/**
 * This component acts as a outer renderer around a certain component.
 * It will show the "loading" and "error" states of the component as well.
 * In addition to that it acts as an "Error boundary" to catch errors inside the component and propagate them
 * to the event handler
 */
export default <ComponentOptions<Vue>>{
	props: {
		definition: null as ContentElementComponentDefinitionInterface | any
	},
	
	name: "contentElement",
	
	data() {
		return {
			componentFailed: false,
			componentLoaded: false,
			component: null,
			componentProps: {},
			errorHandler: null as ContentElementErrorHandler
		};
	},
	
	errorCaptured(err, vm, info) {
		// Build additional data list
		const props: PlainObject = typeof vm.$options !== "undefined" && typeof vm.$options.propsData !== "undefined" ?
			vm.$options.propsData : {};
		const additional: PlainObject = {info};
		if (typeof props.context !== "undefined" && typeof props.context.type === "string") {
			const context: ContentElementContext = props.context;
			additional.store = context.store.getRaw();
		}
		
		// Handle the error
		if (!isUndefined(this.componentProps.context))
			return this.componentProps.context.emitError(err, undefined, additional);
		else if (!isUndefined(this.errorHandler)) {
			(this.errorHandler as ContentElementErrorHandler)(err, undefined, additional);
		} else {
			this.$root.appContext.errorHandler.emitGlobalError(err, undefined, additional);
		}
	},
	
	render(createElement: CreateElement): VNode {
		// Get the framework context from the root
		const appContext: AppContext = this.$root.appContext;
		
		/**
		 * Internal helper to create the content element node for the server or the client side
		 * @param childCreate
		 * @param component
		 */
		const createElementWrapper = (childCreate: CreateElement, component): VNode => {
			// Extract the additional classes from the data subset
			const classDefinition = getPath(this.definition, ["cssClasses"], null);
			const classes = {};
			if (isArray(classDefinition)) {
				forEach(classDefinition, (c: string) => {
					c = c.trim();
					if (c !== "") classes[c] = true;
				});
			}
			this.$listeners;
			// Create the component element
			return childCreate(component as any, {
				props: this.componentProps,
				class: classes,
				on: this.$listeners,
				domProps: {
					id: "content-element-" + this.definition.id
				}
			});
		};
		
		// Check if we are on the server side
		if (appContext.isServer) {
			// Render the child element using a proxy to make sure we have time to resolve the component props
			// using our async component bootstrap when running in SSR mode
			return createElement(() => {
				return new Promise((resolve, reject) => {
					this.findComponentDefinition().then((component) => {
						resolve({
							render(createElement: CreateElement): VNode {
								// Render the default component
								return createElementWrapper(createElement, component);
							}
						});
					}).catch(reject);
				});
			});
		}
		
		// Show error handler if required
		if (this.componentFailed) {
			const errorComponent = !isUndefined(appContext.staticComponents.contentElementErrorComponent) ?
				appContext.staticComponents.contentElementErrorComponent : DefaultContentElementErrorComponent;
			return createElement(errorComponent, {
				props: {
					context: appContext,
					component: this.component,
					componentProps: this.componentProps
				}
			});
		}
		
		// Hydrate content elements only when the browser has time for it
		if (appContext.mode === "spa") {
			return createElement(hydrateWhenIdle(() => {
				return this.findComponentDefinition().then(component => {
					return {
						default: {
							render(createElement: CreateElement): VNode {
								// Render the default component
								return createElementWrapper(createElement, component);
							}
						}
					};
				});
			}));
		}
		
		// Show the loader until the component is ready
		if (!this.componentLoaded) {
			const loaderComponent = !isUndefined(appContext.staticComponents.contentElementLoaderComponent)
			&& getPath(this.definition, "useLoaderComponent", true) === true ?
				appContext.staticComponents.contentElementLoaderComponent : DefaultContentElementLoaderComponent;
			return createElement(loaderComponent, {
				props: {
					context: appContext,
					component: this.component,
					componentProps: this.componentProps
				}
			}, [this.component]);
		}
		
		// Default rendering
		return createElementWrapper(createElement, this.component);
	},
	
	methods: {
		findComponentDefinition(): Promise<Component> {
			const that = this as any;
			
			// Get the framework context from the root
			const appContext: AppContext = that.$root.appContext;
			
			// Create the error handler
			const errorHandler = appContext.errorHandler.getContentElementErrorHandler(that, that.definition);
			that.errorHandler = errorHandler;
			
			// Check if we got a definition
			if (!isPlainObject(that.definition)) {
				that.componentFailed = true;
				that.componentLoaded = true;
				return errorHandler(new Error("Could not render a component, because it does not have a valid definition!"));
			}
			
			// Allow filtering
			return appContext.eventEmitter
				.emitHook(FrameworkEventList.HOOK_CONTENT_ELEMENT_DEFINITION_FILTER, {definition: that.definition})
				.then(args => {
					that.definition = args.definition;
					
					// Try to resolve the component
					const componentType = that.definition.componentType;
					
					// Handle special "html" type -> We render a static html here
					// We also abuse the "html" type, so we are backward compatible with older versions
					if (componentType === "html") {
						
						// Handle error in definition
						// This is a temporary workaround until the next major release,
						// where errors are transferred as their own content element type!
						if (isString(that.definition.data) && that.definition.data.indexOf("SERVER_ERROR::") !== -1) {
							let error: PlainObject;
							
							try {
								const errorString = that.definition.data.replace(
									/^.*?<!--SERVER_ERROR::(.*?)::SERVER_ERROR-->.*?$/gm, "$1");
								error = JSON.parse(htmlDecode(errorString));
							} catch (e) {
								error = {
									message: "A server error occurred, but it could not be decoded!",
									context: {
										raw: that.definition.data
									}
								};
							}
							
							that.componentFailed = true;
							that.componentLoaded = true;
							return errorHandler(
								new Error(error.message ?? "Unknown error"),
								error.code ?? 500,
								error.context ?? {}
							).then(() => false);
						}
						
						that.component = StaticHtmlComponent;
						that.componentProps = {html: that.definition.data};
						that.componentLoaded = true;
						return false;
					}
					
					// Handle content element component import
					const componentKey = inflectToCamelCase(componentType.replace(/[^a-zA-Z0-9]/g, "-"));
					
					return (new Promise((resolve, reject) => {
						
						// Check my local components
						if (!isUndefined(that.$options.components[componentKey]))
							return resolve(that.$options.components[componentKey]);
						
						// Check my parent components
						else if (!isUndefined(that.$parent.$options.components[componentKey]))
							return resolve(that.$parent.$options.components[componentKey]);
						
						// Check the dynamic resolver
						else if (!isUndefined(appContext.dynamicComponentResolver)) {
							const resolver = appContext.dynamicComponentResolver;
							return resolver(componentType, componentKey, that.definition)
								.catch((e) => {
									// If we fail... try it again -> We probably had a network issue
									return resolver(componentType, componentKey, that.definition);
								})
								.then(c => {
									if (!isUndefined(c.default) &&
										(isPlainObject(c.default) || isFunction(c.default)))
										return resolve(c.default);
									
									reject(appContext.errorHandler.makeContentElementError(
										new Error("The loaded component " + componentType + " does not expose a default export!"),
										that, that.definition, 500));
								})
								.catch(reject);
						}
						
						// Not found
						reject(appContext.errorHandler.makeContentElementError(
							new Error("Could not find the required component: \"" + componentType + "\"!"),
							that, that.definition, 500));
					}));
				})
				.then((component: Component | boolean) => {
					if (component === false) return;
					
					// Store the component
					that.component = component;
					
					// Deserialize the initial state
					// @todo update this
					return appContext.resourceApi.makeStateOrStateList(
						getPath(that.definition, ["initialState", "data"], {})
					).then(initialState => {
						// Create the content element context
						const context = new ContentElementContext(appContext, initialState, that.definition, errorHandler);
						that.componentProps = {context: context};
						
						// Emit event
						appContext.eventEmitter.emit(FrameworkEventList.EVENT_CONTENT_ELEMENT_LOADED, {
							definition: that.definition,
							context
						});
						
						// Mark the component as loaded
						that.componentLoaded = true;
					});
				})
				.catch((err: ReasonType) => {
					that.componentLoaded = true;
					return errorHandler(err);
				})
				.then(() => {
					return that.component;
				});
		}
	}
};