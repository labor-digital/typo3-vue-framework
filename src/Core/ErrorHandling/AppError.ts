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
 * Last modified: 2019.12.12 at 11:45
 */

import {PlainObject} from "@labor-digital/helferlein/lib/Interfaces/PlainObject";
import {forEach} from "@labor-digital/helferlein/lib/Lists/forEach";
import {map} from "@labor-digital/helferlein/lib/Lists/map";
import {getPath} from "@labor-digital/helferlein/lib/Lists/Paths/getPath";
import {ucFirst} from "@labor-digital/helferlein/lib/Strings/ucFirst";
import {isArray} from "@labor-digital/helferlein/lib/Types/isArray";
import {isObject} from "@labor-digital/helferlein/lib/Types/isObject";
import {isString} from "@labor-digital/helferlein/lib/Types/isString";
import {isUndefined} from "@labor-digital/helferlein/lib/Types/isUndefined";
import {ContentElementContext} from "../Context/ContentElementContext";
import {AppErrorType, ReasonType} from "./ErrorHandler.interfaces";

export class AppError extends Error {
	protected _code: number;
	protected _reason: ReasonType;
	protected _type: AppErrorType;
	protected _el: HTMLElement;
	protected _additionalPayload: PlainObject;
	protected _navigationStack: Array<string>;
	protected _handled: boolean;
	
	public constructor(type: AppErrorType, reason: ReasonType, message: string, navigationStack: Array<string>) {
		super(message);
		Object.setPrototypeOf(this, new.target.prototype);
		this._reason = reason;
		this._code = 500;
		this._type = type;
		this._additionalPayload = {};
		this._navigationStack = navigationStack;
		this._handled = false;
		this.name = ucFirst(type) + "Error";
		if (isString(reason.stack)) this.stack = reason.stack;
	}
	
	/**
	 * Returns true if this error object was already handled
	 */
	public get isHandled(): boolean {
		return this._handled;
	}
	
	/**
	 * Marker to define this error as an app error object
	 */
	public get isAppError(): boolean {
		return true;
	}
	
	/**
	 * Returns the type key of this error object
	 */
	public get type(): AppErrorType {
		return this._type;
	}
	
	/**
	 * Returns the raw reason why this error was thrown.
	 */
	public get reason(): ReasonType {
		return this._reason;
	}
	
	/**
	 * Returns the html element this error is linked to, or undefined
	 */
	public get el(): HTMLElement | undefined {
		return this._el;
	}
	
	/**
	 * Returns an array of the last 5 url's that were served before this error was thrown.
	 */
	public get navigationStack(): Array<string> {
		return this._navigationStack;
	}
	
	/**
	 * Sets the element this error is linked to
	 * @param el
	 */
	public setEl(el: HTMLElement): AppError {
		this._el = el;
		return this;
	}
	
	/**
	 * Returns the error code of this error -> 500 by default
	 */
	public get code(): number {
		return this._code;
	}
	
	/**
	 * Can be used to set the code of this error object
	 * @param code
	 */
	public setCode(code: number): AppError {
		this._code = code;
		return this;
	}
	
	/**
	 * Returns an object containing additional error related information for debugging
	 */
	public get additionalPayload(): PlainObject {
		return this._additionalPayload;
	}
	
	/**
	 * Allow to override the additional payload
	 * @param value
	 */
	public set additionalPayload(value: PlainObject) {
		this._additionalPayload = value;
	}
	
	/**
	 * Can be used to add additional payload to the error
	 * @param payload
	 */
	public addAdditionalPayload(payload: PlainObject): AppError {
		forEach(payload, (v, k) => {
			this._additionalPayload[k] = v;
		});
		return this;
	}
	
	/**
	 * This method provides integration into the @labor-digital/sentry-browser package
	 */
	public getSentryExtra(): PlainObject {
		const encoder = function (v, encoder, depth) {
			try {
				if (isUndefined(v)) return v;
				if (isObject(v) || isArray(v)) {
					if (depth > 5) return "[DEPTH LIMIT - " + typeof v + "]";
					try {
						// Handle VM
						if (v._isVue === true) {
							let props = isObject(v.$options) && isObject(v.$options.propsData) ?
								v.$options.propsData : {};
							if (!isUndefined(props.context) && props.context.type === "contentElement") {
								const context: ContentElementContext = props.context;
								props = {
									data: context.data.getAll(),
									initialType: context.initialType,
									initialState: context.initialState.getAll(),
									query: context.initialQuery,
									store: context.appContext.store.getRaw(),
									globalData: getPath(context.appContext.vueRenderContext, ["globalData", "data"], {})
								};
							}
							return {
								type: "[VUE VM instance]",
								props: encoder(props, encoder, 0)
							};
						}
						
						// Default encoding
						return map(v, (v) => {
							return encoder(v, encoder, depth + 1);
						});
					} catch (e) {
						console.error("SENTRY EXTRA CONVERSION FAILED!", v, e);
						return "[CONVERSION ERROR]";
					}
				}
				return v;
			} catch (e) {
				return "[CONVERSION ERROR]";
			}
		};
		return {
			name: this.name,
			code: this.code,
			type: this.type,
			additional: encoder(this._additionalPayload, encoder, 0),
			navigationStack: this.navigationStack,
			reason: this._reason
		};
	}
	
	/**
	 * Internal helper to mark this error as handled
	 * @private
	 */
	public __setAsHandled(): void {
		this._handled = true;
	}
}