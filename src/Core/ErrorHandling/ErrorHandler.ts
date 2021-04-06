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

import {
	cloneList,
	isBrowser,
	isEmpty,
	isFunction,
	isNumber,
	isObject,
	isString,
	isUndefined,
	maxLength,
	PlainObject,
	ucFirst
} from "@labor-digital/helferlein";
import PrettyError from "pretty-error";
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
	
	/**
	 * The list of promises that are currently handled
	 * @protected
	 */
	protected _handlingErrors: Array<Promise<any>>;
	
	public constructor(config: AppErrorConfigInterface) {
		this._config = config;
		this._navigationStack = [];
		this._handlingErrors = [];
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
		const promise = this._concreteErrorHandler(context).then(() => {
			// Print this error to the console if required
			if (context.printToConsole)
				this.printMessageToConsole(error);
			
			// Send this error to the logger if required
			if (context.sendToLogger && isFunction(this._config.logger))
				this._config.logger(error);
		});
		
		// Store the promise so we can wait for it
		this._handlingErrors.push(promise.then(v => {
			// Remove this promise from the list
			this._handlingErrors = this._handlingErrors.splice(
				this._handlingErrors.indexOf(promise), 1
			);
			return v;
		}));
		
		return promise;
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
	 * Returns the navigation stack, containing the previously opened pages
	 */
	public get navigationStack(): Array<string> {
		return this._navigationStack;
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
	 * Returns a promise that is resolved when all error promises have been resolved completely
	 */
	public waitForAllPromises(): Promise<void> {
		if (isEmpty(this._handlingErrors)) return Promise.resolve();
		return Promise.all(cloneList(this._handlingErrors)).then(() => {
		});
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
		if (isBrowser()) {
			// Render the message for a browser
			if (isFunction(console.group)) console.group(ucFirst(error.type) + " error!");
			console.error(error.message);
			if (error.outerStack !== error.stack) {
				const e = new Error("The outer stack that created the AppError");
				e.stack = error.outerStack;
				console.log("Outer stack", e);
			}
			if (!isEmpty(error.navigationStack)) console.log("Navigation Stack:", error.navigationStack);
			if (!isUndefined(error.reason)) {
				if (isObject(error.reason)) {
					console.log(error.reason);
				} else {
					console.log(new Error(error.reason));
				}
			}
			if (!isEmpty(error.additionalPayload)) {
				console.log("Additional payload", error.additionalPayload);
			}
			if (isFunction(console.groupEnd)) console.groupEnd();
		} else {
			// Render the message for the cli
			const output = [];
			output.push("=".repeat(80));
			output.push(ucFirst(error.type) + " error: " + maxLength(error.message, 4096));
			output.push("-".repeat(80));
			if (error.code !== 404) {
				const prettyError = new PrettyError();
				output.push(prettyError.render(error));
				
				if (error.outerStack !== error.stack) {
					output.push("Outer stack:");
					const e = new Error("The outer stack that created the AppError");
					e.stack = error.outerStack;
					output.push(prettyError.render(e));
				}
				
				if (error.navigationStack.length > 0) {
					output.push("Navigation stack:");
					output.push("   - " + error.navigationStack.join("   - "));
				}
				
				if (!isUndefined(error.reason) && !isObject(error.reason)) {
					output.push("Reason:");
					output.push(prettyError.render(
						new Error(maxLength(error.reason + "", 4096)))
					);
				}
				
				if (!isEmpty(error.additionalPayload)) {
					output.push("Additional payload:");
					
					// Make sure we don't overflow the console by trimming down the data
					const seen = [];
					const objDepth = [];
					const level = 2;
					output.push(JSON.stringify(
						error.additionalPayload,
						function (_, value) {
							if (typeof value === "object" && value !== null) {
								if (seen.indexOf(value) !== -1) return;
								else seen.push(value);
							}
							if (isString(value)) {
								return maxLength(value, 512);
							}
							if (objDepth.indexOf(this) === -1)
								objDepth.push(this);
							else while (objDepth[objDepth.length - 1] !== this)
								objDepth.pop();
							
							if (objDepth.length > level)
								return undefined;
							return value;
						}, 3));
				}
			}
			output.push("");
			console.log(output.join("\n"));
		}
	}
}