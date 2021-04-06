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


import {PlainObject} from "@labor-digital/helferlein";
import {AppErrorConfigInterface} from "../Config/BasicAppConfigInterface";
import {SpaAppErrorConfigInterface} from "../Config/SpaAppConfigInterface";
import {AppError} from "./AppError";

export interface ContentElementErrorHandler {
	(error: ReasonType, code?: number, additionalPayload?: PlainObject): Promise<any>
}

export interface ComponentPromiseCatchHandler {
	(reason: ReasonType): PromiseLike<any>
}

export interface ConcreteErrorHandlerInterface {
	(context: ConcreteErrorHandlerContextInterface): Promise<void>
}

export interface ConcreteErrorHandlerContextInterface {
	/**
	 * The emitted error object
	 */
	error: AppError
	
	/**
	 * The configuration for the error handler
	 */
	config: AppErrorConfigInterface | SpaAppErrorConfigInterface
	
	/**
	 * True if this error should be completely ignored
	 */
	ignore: boolean
	
	/**
	 * True if the error should be printed to the console
	 */
	printToConsole: boolean
	
	/**
	 * True if the error should be send to the console
	 */
	sendToLogger: boolean
}

export type ReasonType = AppError | Error | string | any;

export type AppErrorType = "global" | "framework" | "contentElement" | "network";