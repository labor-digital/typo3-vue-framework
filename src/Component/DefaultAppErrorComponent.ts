/*
 * Copyright 2020 LABOR.digital
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
 * Last modified: 2020.04.20 at 00:45
 */

import {isString, ucFirst} from "@labor-digital/helferlein";
// @ts-ignore
import {ComponentOptions, CreateElement, VNode} from "vue";
import {Vue} from "vue/types/vue";
import {AppContext} from "../Core/Context/AppContext";
import {AppError} from "../Core/ErrorHandling/AppError";

const css = "*{-webkit-box-sizing:border-box;box-sizing:border-box}body{padding:0;margin:0}#vFwErr{position:relative;height:100vh;width:100vw}#vFwErr .vFwErr{position:absolute;left:50%;top:50%;-webkit-transform:translate(-50%,-50%);-ms-transform:translate(-50%,-50%);transform:translate(-50%,-50%)}.vFwErr{max-width:520px;width:100%;line-height:1.4;text-align:center}.vFwErr .vFwErr-error{position:relative;height:80vh;margin:0 auto 20px;z-index:-1}.vFwErr .vFwErr-error h1{font-family:Montserrat,sans-serif;font-size:236px;font-weight:200;margin:0;color:#211b19;text-transform:uppercase;position:absolute;left:50%;-webkit-transform:translateX(-50%);-ms-transform:translateX(-50%);transform:translateX(-50%)}.vFwErr .vFwErr-error h2{font-family:Montserrat,sans-serif;font-size:20px;font-weight:400;color:#211b19;background:#fff;padding:10px 5px;margin:auto;display:inline-block;position:absolute;bottom:0;left:0;right:0}@media only screen and (max-width:767px){.vFwErr .vFwErr-error h1{font-size:148px}}@media only screen and (max-width:480px){.vFwErr .vFwErr-error{height:350px;margin:0 auto 10px}.vFwErr .vFwErr-error h1{font-size:86px}.vFwErr .vFwErr-error h2{font-size:16px}.vFwErr a{padding:7px 15px;font-size:14px}}";

export default <ComponentOptions<Vue>>{
	props: {
		context: null as AppContext | any,
		error: null as AppError | any
	},
	render(createElement: CreateElement): VNode {
		return createElement("div", {class: "appError"}, [
			createElement("div", {domProps: {id: "vFwErr"}}, [
				createElement("link", {
					domProps: {
						href: "https://fonts.googleapis.com/css?family=Montserrat:200,400",
						rel: "stylesheet"
					}
				}),
				createElement("style", {domProps: {type: "text/css"}}, [css]),
				createElement("div", {class: "vFwErr"}, [
					createElement("div", {class: "vFwErr-error"}, [
						createElement("h1", ["Oops!"]),
						createElement("h2", {
							domProps: {
								innerHTML: this.error.code + " - " +
									(isString(this.error.type) ? ucFirst(this.error.type) + "-Error<br>" : "") +
									this.error.message.replace(/(http?s:.*?$|\/.*?\/.*?$)/g, "").trim()
							}
						})
					])
				])
			])
		]);
	}
};