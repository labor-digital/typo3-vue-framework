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
 * Last modified: 2019.10.23 at 00:51
 */

import Vue from "vue";
import ContentElementChildrenComponent from "./lib/Component/ContentElementChildrenComponent";
import ContentElementComponent from "./lib/Component/ContentElementComponent";

Vue.component("content-element", ContentElementComponent);
Vue.component("content-element-children", ContentElementChildrenComponent);