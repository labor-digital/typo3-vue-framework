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
 * Last modified: 2019.09.30 at 11:12
 */

import {
	EventEmitter,
	EventEmitterEvent,
	forEach,
	isPlainObject,
	isString,
	PlainObject
} from "@labor-digital/helferlein";
import {AxiosInstance} from "axios";
import VueI18n, {Values} from "vue-i18n";
import {FrameworkEventList} from "../../Interface/FrameworkEventList";
import {JsonApi, Resource} from "../../JsonApi/IdeHelper";

export class Translation {
	
	/**
	 * The vue i18n instance we use for our translations
	 */
	protected _translator: VueI18n;
	
	/**
	 * The resource api instance to request other languages via ajax
	 */
	protected _resourceApi: JsonApi;
	
	/**
	 * The list of already registered language codes
	 */
	protected _loadedLanguageCodes: Array<string>;
	
	/**
	 * Contains the list of all valid language codes for this page
	 */
	protected _siteLanguageCodes: Array<string>;
	
	/**
	 * The list of existing axios instance so we can update the language header
	 * @protected
	 */
	protected _axiosInstances: Array<AxiosInstance>;
	
	/**
	 * The event emitter instance
	 * @protected
	 */
	protected _eventEmitter: EventEmitter;
	
	public constructor(
		translator: VueI18n,
		resourceApi: JsonApi,
		eventEmitter: EventEmitter,
		axiosInstances: Array<AxiosInstance>
	) {
		this._translator = translator;
		this._loadedLanguageCodes = [];
		this._siteLanguageCodes = ["en"];
		this._resourceApi = resourceApi;
		this._axiosInstances = axiosInstances;
		this._eventEmitter = eventEmitter;
		
		// Bind event handler
		eventEmitter.bind(FrameworkEventList.HOOK_UPDATE_FRAMEWORK_AFTER_NAVIGATION, e => this.afterNavigation(e));
	}
	
	/**
	 * Returns the current language code of this page
	 */
	public get languageCode(): string {
		return this.translator.locale;
	}
	
	/**
	 * Returns the list of all loaded language codes
	 */
	public get loadedLanguageCodes(): Array<string> {
		return this._loadedLanguageCodes;
	}
	
	/**
	 * Returns the list of all valid language codes for this page
	 */
	public get siteLanguageCodes(): Array<string> {
		return this._siteLanguageCodes;
	}
	
	/**
	 * Returns the vue i18n instance we use for our translations
	 */
	public get translator(): VueI18n {
		return this._translator;
	}
	
	/**
	 * Can be used to update the language of the application to something else
	 * @param languageCode
	 */
	public setLanguageCode(languageCode: string): Promise<string> {
		// Ignore if this is already the same language
		if (this.languageCode === languageCode) return Promise.resolve(languageCode);
		
		// Notify everyone about the change
		this.updateAxiosLanguageHeader(languageCode);
		this._eventEmitter.emit(FrameworkEventList.EVENT_LANGUAGE_CHANGED, {lang: languageCode});
		
		// Check if we already know the language
		if (this._loadedLanguageCodes.indexOf(languageCode) !== -1) {
			this.translator.locale = languageCode;
			return Promise.resolve(languageCode);
		}
		
		// Load the messages from the api
		this._resourceApi.getResource("pageTranslation", languageCode).then((state) => {
			this._translator.setLocaleMessage(languageCode, state.get("message", {}));
			this.translator.locale = languageCode;
			return Promise.resolve(languageCode);
		});
	}
	
	/**
	 * Returns the translated string for the given key.
	 * @param key
	 * @param values
	 */
	public translate(key: string, values?: Values): string {
		return this._translator.t(key, values) + "";
	}
	
	/**
	 * This method is used only in hybrid apps to inject the translations for the content elements on the page
	 * @param translations
	 * @private
	 */
	public __setLanguageForHybridApp(translations: PlainObject) {
		if (!isString(translations.id) || !isPlainObject(translations.message)) return;
		this._translator.setLocaleMessage(translations.id, translations.message);
		this._translator.locale = translations.id;
		this._siteLanguageCodes = [translations.id];
	}
	
	/**
	 * Event handler to update the translation storage after navigations
	 * @param e
	 */
	protected afterNavigation(e: EventEmitterEvent): void {
		const state: Resource = e.args.state;
		if (state.has("translation")) {
			const translation = state.get("translation", {});
			this._translator.setLocaleMessage(translation.id, translation.message);
			if (this._loadedLanguageCodes.indexOf(translation.id) === -1)
				this._loadedLanguageCodes.push(translation.id);
		}
		
		// Check if the language changed
		const languageCode = state.get("languageCode", "en");
		if (this.languageCode === languageCode) return;
		
		this._translator.locale = languageCode;
		this.updateAxiosLanguageHeader(languageCode);
		this._siteLanguageCodes = state.get("siteLanguageCodes", ["en"]);
		this._eventEmitter.emit(FrameworkEventList.EVENT_LANGUAGE_CHANGED, {lang: languageCode});
	}
	
	/**
	 * Updates all registered axios instances with the current language code
	 * @param languageCode
	 * @protected
	 */
	protected updateAxiosLanguageHeader(languageCode: string): void {
		forEach(this._axiosInstances, (i: AxiosInstance) => {
			i.defaults.headers.common["x-t3fa-language"] = languageCode;
		});
	}
}