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
 * Last modified: 2019.12.12 at 13:05
 */

import {PlainObject} from "@labor-digital/helferlein/lib/Interfaces/PlainObject";
import {forEach} from "@labor-digital/helferlein/lib/Lists/forEach";

export abstract class AbstractContext {
	
	/**
	 * Initialize the context
	 * @param properties
	 */
	protected constructor(properties: PlainObject) {
		forEach(properties, (v, k) => this.__setProperty(k, v));
	}
	
	/**
	 * Internal interface to update properties of the context after it was created
	 * @param name
	 * @param value
	 */
	public __setProperty(name: string, value: any): void {
		this["_" + name] = value;
	}
}