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
 * Last modified: 2019.10.07 at 17:41
 */

import {isUndefined} from "@labor-digital/helferlein/lib/Types/isUndefined";
import {ComponentOptions, CreateElement, VNode} from "vue";
import {Route} from "vue-router";
import {Vue} from "vue/types/vue";
import {PageContext} from "../Core/Context/PageContext";
import {RouteHandler} from "../Core/Module/Spa/RouteHandler";

export default <ComponentOptions<Vue>>{
	props: {
		context: null as PageContext | any
	},
	render(createElement: CreateElement): VNode {
		// Select the layout component for this page
		const layout = this.context.layout;
		const layoutComponents = this.context.layoutComponents;
		const layoutComponent = isUndefined(layoutComponents[layout]) ?
			layoutComponents["default"] : layoutComponents[layout];
		
		// Render the layout component
		return createElement(layoutComponent, {
			key: this.$route.fullPath,
			props: {
				context: this.context
			}
		});
	},
	beforeRouteUpdate(to: Route, from: Route, next) {
		(to.meta.handler as RouteHandler).handle(to, from, next);
	},
	beforeRouteEnter(to: Route, from: Route, next) {
		(to.meta.handler as RouteHandler).handle(to, from, next);
	}
};