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
 * Last modified: 2019.09.27 at 14:43
 */

import {forEach} from "@labor-digital/helferlein/lib/Lists/forEach";
import {getPath} from "@labor-digital/helferlein/lib/Lists/Paths/getPath";
import {isEmpty} from "@labor-digital/helferlein/lib/Types/isEmpty";
import {isUndefined} from "@labor-digital/helferlein/lib/Types/isUndefined";
import {ComponentOptions, CreateElement, VNode} from "vue";
import {Vue} from "vue/types/vue";
import {ContentElementContext} from "../Core/Context/ContentElementContext";
import {PageContext} from "../Core/Context/PageContext";
import {ContentElementColumnListInterface} from "../Core/Interface/ContentElementColumnListInterface";
import {ContentElementComponentDefinitionInterface} from "../Core/Interface/ContentElementComponentDefinitionInterface";
import ContentElementComponent from "./ContentElementComponent";

/**
 * This component is used to render a list of content elements based on the children of the parent component
 */
export default <ComponentOptions<Vue>>{
	props: {
		col: {
			type: Number,
			default: 0
		},
		children: {
			type: [Object, Array],
			default: () => {
				return {};
			}
		} as ContentElementColumnListInterface,
		context: null as PageContext | ContentElementContext | any
	},
	render(createElement: CreateElement): VNode {
		
		// Find children either by prop or by context
		let children: ContentElementColumnListInterface = this.children;
		
		if (isEmpty(children)) {
			// Check if we got a context
			if (this.context !== null) children = getPath(this, ["context", "children"], {});
			else children = getPath(this, ["$parent", "$vnode", "data", "props", "context", "children"], {});
			if (isEmpty(children)) return createElement("div");
		}
		
		// Check if the required column exists
		if (isUndefined(children[this.col])) return createElement("div");
		
		// Get the elements in the column
		const colDefinition = [];
		forEach(children[this.col], (definition: ContentElementComponentDefinitionInterface) => {
			colDefinition.push(createElement(ContentElementComponent, {
				on: this.$listeners,
				props: {
					definition: definition
				}
			}));
		});
		
		return createElement("div", colDefinition);
	}
};