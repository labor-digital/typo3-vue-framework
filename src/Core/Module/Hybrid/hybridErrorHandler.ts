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
 * Last modified: 2019.12.30 at 15:48
 */

import {getPath} from "@labor-digital/helferlein/lib/Lists/Paths/getPath";
import {isUndefined} from "@labor-digital/helferlein/lib/Types/isUndefined";
import {AppContext} from "../../Context/AppContext";
import {AppError} from "../../ErrorHandling/AppError";
import {ConcreteErrorHandlerContextInterface} from "../../ErrorHandling/ErrorHandler.interfaces";
import {EventList} from "../../Interface/EventList";

export default function hybridErrorHandler(handlerContext: ConcreteErrorHandlerContextInterface, appContext: AppContext): Promise<void> {
	return appContext.eventEmitter
		.emitHook(EventList.HOOK_ON_ERROR, {
			handlerContext,
			appContext
		})
		.then(args => {
			// Skip if we should not handle the error
			if (args.handlerContext.ignore === true) return;
			
			// Check if we should handle a content element error
			const error: AppError = args.handlerContext.error;
			if (error.type === "contentElement") {
				const component = getPath(error.additionalPayload, ["component"]);
				if (!isUndefined(component)) component.componentFailed = true;
			}
		})
		.catch(e => {
			console.error("Fatal error inside the error handler!");
			console.error(e);
		});
}