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
 * Last modified: 2019.12.12 at 11:43
 */

import {isBrowser} from "@labor-digital/helferlein/lib/Environment/isBrowser";
import {PlainObject} from "@labor-digital/helferlein/lib/Interfaces/PlainObject";
import {ucFirst} from "@labor-digital/helferlein/lib/Strings/ucFirst";
import {isEmpty} from "@labor-digital/helferlein/lib/Types/isEmpty";
import {isFunction} from "@labor-digital/helferlein/lib/Types/isFunction";
import {isNumber} from "@labor-digital/helferlein/lib/Types/isNumber";
import {isObject} from "@labor-digital/helferlein/lib/Types/isObject";
import {isString} from "@labor-digital/helferlein/lib/Types/isString";
import {isUndefined} from "@labor-digital/helferlein/lib/Types/isUndefined";
import {Component} from "vue";
import {AppErrorConfigInterface} from "../Config/BasicAppConfigInterface";
import {ContentElementComponentDefinitionInterface} from "../Interface/ContentElementComponentDefinitionInterface";
import {AppError} from "./AppError";
import {
	AppErrorType,
	ConcreteErrorHandlerContextInterface,
	ConcreteErrorHandlerInterface,
	ContentElementErrorHandler,
	ReasonType
} from "./ErrorHandler.interfaces";

export class ErrorHandler {
	
	/**
	 * The error handling configuration
	 */
	protected _config: AppErrorConfigInterface;
	
	/**
	 * Contains the navigation stack that holds the last 5 served urls
	 */
	protected _navigationStack: Array<string>;
	
	/**
	 * Holds the reference to the concrete error handler that differs between spa and hybrid apps.
	 */
	protected _concreteErrorHandler: ConcreteErrorHandlerInterface;
	
	/**
	 * Holds the last error that occurred
	 */
	protected _lastError: AppError | undefined;
	
	public constructor(config: AppErrorConfigInterface) {
		this._config = config;
		this._navigationStack = [];
		this._concreteErrorHandler = function () {
			return Promise.resolve();
		};
	}
	
	/**
	 * Returns the last error that occurred in the system
	 */
	public get lastError(): AppError | undefined {
		return this._lastError;
	}
	
	/**
	 * Emits a given error object and lets it handle by the concrete error handler
	 * @param error
	 */
	public emitError(error: AppError): Promise<void> {
		// Check if this error is already handled
		if (error.isHandled) return Promise.resolve();
		error.__setAsHandled();
		
		// Store the error
		this._lastError = error;
		
		// Create the context
		const context: ConcreteErrorHandlerContextInterface = {
			error,
			config: this._config,
			ignore: false,
			printToConsole: true,
			sendToLogger: true
		};
		
		// Handle the error
		return this._concreteErrorHandler(context).then(() => {
			// Print this error to the console if required
			if (context.printToConsole)
				this.printMessageToConsole(error);
			
			// Send this error to the logger if required
			if (context.sendToLogger && isFunction(this._config.logger))
				this._config.logger(error);
		});
	}
	
	/**
	 * Creates a new global error object
	 * @param reason
	 * @param code
	 */
	public makeGlobalError(reason: ReasonType, code?: number): AppError {
		return this.makeError("global", reason, code);
	}
	
	/**
	 * Creates a new network error object
	 * @param reason
	 * @param code
	 */
	public makeNetworkError(reason: ReasonType, code?: number): AppError {
		return this.makeError("network", reason, code);
	}
	
	/**
	 * Creates a new content element error object
	 * @param reason
	 * @param component
	 * @param definition
	 * @param code
	 */
	public makeContentElementError(reason: ReasonType, component: Component,
								   definition: ContentElementComponentDefinitionInterface,
								   code?: number): AppError {
		const e = this.makeError("contentElement", reason, code);
		if (!isUndefined((component as any).$el)) e.setEl((component as any).$el);
		e.addAdditionalPayload({component});
		return e;
	}
	
	/**
	 * Adds a new location to the navigation stack
	 * @param location
	 */
	public pushNavigationStack(location: string): ErrorHandler {
		this._navigationStack.push(location);
		if (this._navigationStack.length > 5) this._navigationStack.shift();
		return this;
	}
	
	/**
	 * Can be used to set the concrete error handler
	 * @param handler
	 */
	public setConcreteErrorHandler(handler: ConcreteErrorHandlerInterface): ErrorHandler {
		this._concreteErrorHandler = handler;
		return this;
	}
	
	/**
	 * Generates a new closure that is used as error handler, already scoped to a single content element component
	 * @param component
	 * @param definition
	 */
	public getContentElementErrorHandler(component: Component, definition: ContentElementComponentDefinitionInterface): ContentElementErrorHandler {
		const that = this;
		return function (error: ReasonType, code?: number, additionalPayload?: PlainObject): Promise<any> {
			const e = that.makeContentElementError(error, component, definition, code);
			e.addAdditionalPayload(additionalPayload);
			return that.emitError(e);
		};
	}
	
	/**
	 * Internal factory to create a new error instance
	 * @param type
	 * @param reason
	 * @param code
	 */
	protected makeError(type: AppErrorType, reason: ReasonType, code?: number): AppError {
		// Check if the reason is already an error object
		const reasonIsObject = isObject(reason);
		if (reasonIsObject && reason.isAppError === true) return reason;
		
		// Convert the reason into a string
		let reasonString = isString(reason) ? reason :
			(reasonIsObject && isString(reason.message) ? reason.message : reason + "");
		
		// Prepare the error code
		if (!isNumber(code)) {
			code = isUndefined(this._config.defaultErrorCode) ? 500 : this._config.defaultErrorCode;
			// Convert axios error code
			if (reasonIsObject && !isUndefined(reason.response)) {
				code = reason.response.status;
				reasonString += " " + reason.config.url;
			}
		}
		
		// Create the error
		const e = new AppError(type, reason, reasonString, JSON.parse(JSON.stringify(this._navigationStack)));
		e.setCode(code);
		return e;
	}
	
	/**
	 * Internal helper that is used to print the given error object to the browser console
	 * @param error
	 */
	protected printMessageToConsole(error: AppError) {
		// Ignore if we should not print anything to the console
		if (this._config.printErrorToConsole === false) return;
		
		// Render the message
		if (isFunction(console.group)) console.group(ucFirst(error.type) + " error!");
		if (isBrowser()) console.error(error.message);
		else console.log(error.message);
		if (error.code !== 404 || isBrowser()) {
			// if (!isEmpty(error.additionalPayload)) console.log("Additional data:", error.additionalPayload);
			if (!isEmpty(error.navigationStack)) console.log("Navigation Stack:", error.navigationStack);
			if (!isUndefined(error.reason)) console.log("Stack:", error.reason);
			else console.log("Stack:", error.stack);
			console.log("Internal Stack:", (new Error()).stack);
		}
		if (isFunction(console.groupEnd)) console.groupEnd();
	}
}