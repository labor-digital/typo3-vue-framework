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
 * Last modified: 2019.12.12 at 11:19
 */

import {BasicBootstrap} from "../Core/Bootstrap/BasicBootstrap";
import {HybridBootstrap} from "../Core/Bootstrap/HybridBootstrap";
import {HybridAppConfigInterface} from "../Core/Config/HybridAppConfigInterface";
import {AppContext} from "../Core/Context/AppContext";

export class HybridApp {
	/**
	 * Initializes the hybrid widgets on an existing page, all widgets will be loaded
	 * into their own, separate vue instances
	 * @param config
	 */
	public static init(config: HybridAppConfigInterface): Promise<Array<AppContext>> {
		return BasicBootstrap
			.makeAppContext("hybrid", BasicBootstrap.initialize(config))
			.then(HybridBootstrap.registerConcreteErrorHandler)
			.then(BasicBootstrap.applyContextFilter)
			.then(HybridBootstrap.loadGlobalDataIntoRenderingContext)
			.then(BasicBootstrap.configureVue)
			.then(HybridBootstrap.registerTranslation)
			.then(BasicBootstrap.emitInitHook)
			.then(HybridBootstrap.makeVueApps);
	}
}