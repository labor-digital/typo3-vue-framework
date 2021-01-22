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
 * Last modified: 2019.12.12 at 11:20
 */

import {isBrowser} from "@labor-digital/helferlein/lib/Environment/isBrowser";
import {PlainObject} from "@labor-digital/helferlein/lib/Interfaces/PlainObject";
import {BasicBootstrap} from "../Core/Bootstrap/BasicBootstrap";
import {SpaBootstrap} from "../Core/Bootstrap/SpaBootstrap";
import {SpaAppConfigInterface} from "../Core/Config/SpaAppConfigInterface";

export class SpaApp {
	/**
	 * Initializes a full single-page-app with routing and site meta management,
	 * based on the given configuration object
	 * @param config
	 */
	public static init(config: SpaAppConfigInterface): Promise<any> | Function {
		
		// Once in a lifetime bootstrapping
		config = BasicBootstrap.initialize(config);
		SpaBootstrap.initialize();
		
		/**
		 * Async boot wrapper for both the browser and the ssr renderer
		 * @param vueContext
		 */
		const boot = function (vueContext: PlainObject) {
			// Run the bootstrap
			return BasicBootstrap
				.makeAppContext("spa", config, vueContext)
				.then(SpaBootstrap.registerConcreteErrorHandler)
				.then(SpaBootstrap.registerPageContext)
				.then(BasicBootstrap.applyContextFilter)
				.then(SpaBootstrap.registerRouter)
				.then(BasicBootstrap.configureVue)
				.then(SpaBootstrap.registerSpaVueConfig)
				.then(BasicBootstrap.applyVueConfigFilter)
				.then(BasicBootstrap.makeVueInstance)
				.then(SpaBootstrap.finalizePageMeta)
				.then(BasicBootstrap.emitInitHook)
				.then(SpaBootstrap.mount);
		};
		
		// Run the bootstrap in the browser or return the callback for ssr
		return isBrowser() ? boot({}) : boot;
	}
}