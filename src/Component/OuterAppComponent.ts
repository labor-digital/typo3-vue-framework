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
 * Last modified: 2020.04.19 at 14:42
 */

import {getPath} from "@labor-digital/helferlein/lib/Lists/Paths/getPath";
import {hasPath} from "@labor-digital/helferlein/lib/Lists/Paths/hasPath";
import {isUndefined} from "@labor-digital/helferlein/lib/Types/isUndefined";
import {ComponentOptions, CreateElement, VNode} from "vue";
import {Vue} from "vue/types/vue";
import {SpaAppVueConfigInterface} from "../Core/Config/SpaAppConfigInterface";
import {AppContext} from "../Core/Context/AppContext";
import {FrameworkStoreKeys} from "../Core/Interface/FrameworkStoreKeys";
import {Store} from "../Core/Module/General/Store";
import DefaultAppComponent from "./DefaultAppComponent";
import DefaultPreviewMarkerComponent from "./DefaultPreviewMarkerComponent";

/**
 * This component is used as an outer wrapper around the whole application.
 * It is used to serve all the framework related stuff, like the preview marker
 * or the rendering of the app component
 */
export default <ComponentOptions<Vue | any>>{
	render(createElement: CreateElement): VNode {
		
		// Handle an app with global errors
		if (!isUndefined(this.errorComponent))
			return this.createErrorComponent(createElement);
		
		// Don't render anything before we got our first data
		if (!this.appContext.store.get(FrameworkStoreKeys.SPA_APP_HAS_CONTENT, false)) {
			if (this.appPreloadComponent === null) {
				return createElement("div", ["..."]);
			} else {
				createElement(this.appPreloadComponent);
			}
		}
		
		// Handle the default app scaffold
		return createElement("div", {
			staticClass: "typo3-spa-app"
		}, [
			createElement(this.appComponent,
				{
					props: {
						appContext: this.appContext,
						pageContext: this.appContext.pageContext
					}
				}),
			isUndefined(this.previewComponent) ? undefined : createElement(this.previewComponent)
		]);
	},
	computed: {
		appContext(): AppContext {
			return this.$root.appContext;
		},
		store(): Store {
			return this.appContext.store;
		},
		errorComponent() {
			return this.store.get(FrameworkStoreKeys.SPA_APP_ERROR_COMPONENT, undefined);
		},
		appPreloadComponent() {
			return hasPath(this.appContext.config, ["vue", "staticComponents", "preloader"]) ?
				(this.appContext.config.vue as SpaAppVueConfigInterface).staticComponents.preloader : null;
		},
		appComponent() {
			// Check if we got an app component override
			const componentOverride = this.store.get(FrameworkStoreKeys.SPA_APP_COMPONENT_OVERWRITE, null);
			if (componentOverride !== null)
				return componentOverride;
			
			// Return the configured app component
			return hasPath(this.appContext.config, ["vue", "appComponent"]) ?
				(this.appContext.config.vue as SpaAppVueConfigInterface).appComponent : DefaultAppComponent;
		},
		previewComponent() {
			if (!this.appContext.pageContext.isPreview) return;
			return getPath(this.$root.appContext.config, ["vue", "staticComponents", "previewModeMarkerComponent"],
				DefaultPreviewMarkerComponent);
		}
	},
	methods: {
		/**
		 * Builds the error component to be rendered
		 * @param createElement
		 */
		createErrorComponent(createElement: CreateElement): VNode {
			return createElement(this.errorComponent, {
				props: {
					context: this.appContext,
					error: this.appContext.errorHandler.lastError
				}
			});
		}
	},
	mounted(): void {
		this.$watch(() => this.$route.fullPath, () => {
			// Reset the error component on navigation
			if (!isUndefined(this.errorComponent))
				this.store.set(FrameworkStoreKeys.SPA_APP_ERROR_COMPONENT, undefined);
		});
	}
};