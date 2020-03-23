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
 * Last modified: 2020.01.10 at 14:14
 */

import {getPath} from "@labor-digital/helferlein/lib/Lists/Paths/getPath";
import {isUndefined} from "@labor-digital/helferlein/lib/Types/isUndefined";
import {ComponentOptions, CreateElement, VNode} from "vue";
import {Vue} from "vue/types/vue";
import DefaultPreviewMarkerComponent from "./DefaultPreviewMarkerComponent";

export default <ComponentOptions<Vue>>{
	render(createElement: CreateElement): VNode {
		return createElement("div", {
			staticClass: "typo3-spa-app"
		}, [createElement("router-view"),
			isUndefined(this.previewComponent) ? undefined : createElement(this.previewComponent)]);
	},
	computed: {
		previewComponent() {
			if (!this.$root.appContext.store.get("pageIsPreview", false)) return;
			return getPath(this.$root.appContext.config, ["vue", "staticComponents", "previewModeMarkerComponent"],
				DefaultPreviewMarkerComponent);
		}
	}
	
};