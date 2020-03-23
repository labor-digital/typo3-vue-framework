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

import {ComponentOptions, CreateElement, VNode} from "vue";
import {Vue} from "vue/types/vue";

export default <ComponentOptions<Vue>>{
	render(createElement: CreateElement): VNode {
		return createElement("div", {
			staticStyle: {
				backgroundColor: "#1e3c5a",
				fontFamily: "Arial, sans-serif",
				color: "#ffffff",
				border: "2px solid #ffffff",
				fontSize: "18px",
				lineHeight: "20px",
				padding: "10px",
				position: "fixed",
				top: "20px",
				right: "20px",
				zIndex: 20000,
				cursor: "default"
			}
		}, "PREVIEW");
	}
};