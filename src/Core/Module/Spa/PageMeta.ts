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
 * Last modified: 2019.10.23 at 09:59
 */

import {forEach} from "@labor-digital/helferlein/lib/Lists/forEach";
import {merge} from "@labor-digital/helferlein/lib/Lists/merge";
import Vue from "vue";
import {MetaInfo, VueMetaPlugin} from "vue-meta";

export class PageMeta {
	/**
	 * The instance of the vue meta plugin
	 */
	protected _vueMetaPlugin: VueMetaPlugin;
	
	/**
	 * Internal representation of the meta info
	 */
	protected _metaInfo: MetaInfo;
	
	/**
	 * Holds the static meta definition
	 */
	protected _staticMeta: MetaInfo;
	
	public constructor(staticMeta: MetaInfo) {
		this._metaInfo = Vue.observable({title: ""});
		this._staticMeta = staticMeta;
	}
	
	/**
	 * Returns the raw vue meta plugin instance
	 */
	public get vueMeta(): VueMetaPlugin {
		return this._vueMetaPlugin;
	}
	
	/**
	 * Returns the meta info object we hold internally
	 */
	public get metaInfo(): MetaInfo {
		return this._metaInfo;
	}
	
	/**
	 * Can be used to set the title of the app
	 * @param title
	 */
	public setTitle(title: string): PageMeta {
		this.setRaw({title: title});
		return this;
	}
	
	/**
	 * Can be used to update the canonical url
	 * @param link
	 */
	public setCanonical(link: string): PageMeta {
		this.setRaw({
			link: [{
				rel: "canonical", href: link
			}]
		});
		return this;
	}
	
	/**
	 * Is used to set the meta info object as a raw object
	 * @param metaInfo
	 */
	public setRaw(metaInfo: MetaInfo): PageMeta {
		metaInfo = merge({},
			JSON.parse(JSON.stringify(this._staticMeta)),
			JSON.parse(JSON.stringify(metaInfo))) as any;
		forEach(metaInfo, (v, k) => {
			Vue.set(this._metaInfo, k, v);
		});
		return this;
	}
	
	/**
	 * Internal helper to inject the vue meta plugin after it was created
	 * @param plugin
	 * @private
	 */
	public __setMetaPlugin(plugin: VueMetaPlugin): void {
		this._vueMetaPlugin = plugin;
	}
}