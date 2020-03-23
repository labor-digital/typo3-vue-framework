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
 * Last modified: 2019.10.22 at 10:53
 */

import {ComponentOptions, CreateElement, VNode} from "vue";
import {Vue} from "vue/types/vue";

export default <ComponentOptions<Vue>>{
	render: function (createElement: CreateElement): VNode | VNode[] {
		return createElement("div", {
			style: {
				backgroundColor: "red",
				color: "white",
				padding: "10px"
			}
		}, "This element has thrown an error!");
	}
};