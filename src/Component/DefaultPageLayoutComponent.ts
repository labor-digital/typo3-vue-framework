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
 * Last modified: 2019.09.26 at 16:33
 */

import {ComponentOptions, CreateElement, VNode} from "vue";
import {Vue} from "vue/types/vue";
import ContentElementChildrenComponent from "./ContentElementChildrenComponent";

/**
 * Is used as default page layout if no custom layout component was registered
 */
export default <ComponentOptions<Vue>>{
	render: (createElement: CreateElement): VNode => {
		return createElement("div", {}, [
			createElement("h1", ["Default page layout"]),
			createElement(ContentElementChildrenComponent)
		]);
	}
};