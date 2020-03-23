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
 * Last modified: 2019.10.21 at 16:52
 */

import {ComponentOptions, CreateElement, VNode} from "vue";
import {Vue} from "vue/types/vue";
import {AppContext} from "../Core/Context/AppContext";
import {AppError} from "../Core/ErrorHandling/AppError";

export default <ComponentOptions<Vue>>{
	props: {
		context: null as AppContext | any,
		error: null as AppError | any
	},
	render(createElement: CreateElement): VNode {
		return createElement("div", {class: "appError"}, [
			createElement("h1", ["Fatal error!"]),
			createElement("h4", ["Reason: " + this.error.message]),
			createElement("p", ["The code was: " + this.error.code])
		]);
	}
};