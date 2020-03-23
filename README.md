# TYPO3 - Vue.js Framework
This package contains a wrapper around the vue.js framework that is designed to provide a complete frontend for your TYPO3 website. 
It is designed to work with the [frontend-api](https://github.com/labor-digital/typo3-frontend-api) extension out of the box. 
The bundle allows you to utilize the power of the vue.js framework with or without server side rendering. Webpack is used as building 
service that allows code splitting and lazy loading for content elements for top notch performance.

## Installation
Install this package using npm:

```
npm install @labor-digital/typo3-vue-framework
```

## Basic Usage
For the moment the simplest way to set up the framework is by creating a new package json using the labor [asset builder webpack](https://github.com/labor-digital/asset-building) bundle.

Install the dependencies for building the script:
```
npm install @labor-digital/asset-building @labor-digital/asset-building-dev-server @labor-digital/asset-building-env-vuejs nodemon
``` 

Update your package json:
```
{
    "name": "@your-vendor/your-project",
    ...
    "scripts": {
    	"start": "node index.js",
    	"start:development": "nodemon -L index.js",
    	"build": "labor-asset-building build"
    },
    "labor": {
        "apps": [
            {
                "entry": "./src/App.ts",
                "output": "./dist/bundle.js",
                "useSsr": true,
                "htmlTemplate": true,
                "extensions": [
                    "@labor/asset-building-env-vuejs"
                ]
            }
        ],
        "extensions": [
        	"@labor/asset-building-dev-server"
        ]
    }
}
```

Create the following folder structure at the folder where your package.json lives:
```
package.json
src
src\ContentElement
src\ContentElement\TypoExtensionVendor
src\ContentElement\TypoExtensionVendor\ContentElementKey
```

These directories should store your content elements will reside. This is the recommended way
but you can adjust this in the following step. Now we create the your main application file a
at ```src\App.ts```

```typescript
import {ucFirst} from "@labor-digital/helferlein/lib/Strings/ucFirst";
import {SpaApp} from "@labor-digital/typo3-vue-framework/lib/Variants/SpaApp";
import "./App.sass";
export default SpaApp.init({
	api: {
        // Define the api endpoint root that is used to resolve the resources
		baseUrl: "https://www.example.org",
	},
	vue: {
        // This part is important: This tells webpack how it should include your components.
        // If you create the folder structure as described above you can simply copy and paste this,
        // it will take care that all content elements will be linked to your correct .vue files
		dynamicComponentResolver: function (type: string) {
			const parts = type.split("/");
			const isPlugin = parts.length === 4;
			if (isPlugin) return import("./ContentElement/" + ucFirst(parts[0]) + "/" + ucFirst(parts[1]) + "/" + ucFirst(parts[2]) + "/" + ucFirst(parts[3]) + ".vue");
			else return import("./ContentElement/" + ucFirst(parts[0]) + "/" + ucFirst(parts[1]) + "/" + ucFirst(parts[1]) + ".vue");
		}
	}
});
```

This is enough if you don't want server side rendering. For the use of a server-side-renderer you need to create an node server.
I tried to keep the creation as simple as possible: Create a new index.js file:

```javascript
const expressAssetBuildingPlugin = require("@labor-digital/asset-building/dist/Express/expressAssetBuildingPlugin.js");
const expressDevServerPlugin = require("@labor-digital/asset-building-dev-server/dist/expressDevServerPlugin.js");
const expressSsrPlugin = require("@labor-digital/asset-building-env-vuejs/dist/expressSsrPlugin.js");
const express = require("express");
const app = express();
const port = 8000;

// Create the express asset builder context
expressAssetBuildingPlugin(app)

// Register your custom routes, those will not reach the expressSsrPlugin!
	.then(context => {
		// Add static resources to express handling
		context.registerPublicAssets("public");

		// Return the context
		return context;
	})

	// Register the asset-builder dev-server plugin
	.then(expressDevServerPlugin)

	// Register the ssr plugin which acts as a wildcard for everything that is not defined above
	.then(expressSsrPlugin)

	// Create the app
	.then(context => {
		context.expressApp.listen(port, () => console.log(`\r\nThe frontend is listening on port ${port}!`));
	});
``` 

With this the main setup should be done, now you can create your first content element. First create the content element following
the frontend-api documentation and set up your site for using SPA rendering.

Now let's create the frontend component; let's say we have a content element that is called typoExtensionVendor/contentElementKey
you will have to create a ContentElementKey.vue single file component in the ```src\ContentElement\TypoExtensionVendor\ContentElementKey``` directory. 

```vue
<template>
    <div class="contentElement">
        {{text}}
    </div>
</template>

<script lang="ts">
    import {ContentElementContext} from "@labor-digital/typo3-vue-framework/lib/Core/Context/ContentElementContext";

    export default {
        name: "ContentElementKey",
        props: {
            // You can request the context in every content element component as a prop.
            // The content provides you with all information about the current app.
            context: null as ContentElementContext
        },
        computed: {
            text() {
                // We retrieve the initial data from the data attribute of the context
                return this.context.data.get("text");
            }
        }
    };
</script>

<style scoped lang="sass"></style>
```

Now lets run your frontend using: ```npm run start:development```

## Documentation
I know the documentation under "basic usage" is really sparse and can be seen as a temporary placeholder. I'm working 
on a nice documentation, until it is in place you can find the api [here](https://typo3-vue-framework.labor.tools).

## Postcardware
You're free to use this package, but if it makes it to your production environment we highly appreciate you sending us a postcard from your hometown, mentioning which of our package(s) you are using.

Our address is: LABOR.digital - Fischtorplatz 21 - 55116 Mainz, Germany

We publish all received postcards on our [company website](https://labor.digital).
