/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./src/app.worker.js":
/*!***************************!*\
  !*** ./src/app.worker.js ***!
  \***************************/
/***/ (() => {

eval("self.addEventListener(\"message\", async (event) => {\r\n    const {text, apiKey } = event.data;\r\n\r\n    const apiUrl = \"https://api.openai.com/v1/audio/speech\";\r\n\r\n    const headers = {\r\n        \"Content-Type\": \"application/json\",\r\n        \"Authorization\": `Bearer ${apiKey}`,\r\n    };\r\n\r\n    const requestBody = {\r\n        model: \"tts-1\",\r\n        input: text,\r\n        voice: \"shimmer\",\r\n    };\r\n\r\n    try {\r\n        const response = await fetch(apiUrl, {\r\n            method: \"POST\",\r\n            headers: headers,\r\n            body: JSON.stringify(requestBody),\r\n        });\r\n\r\n        if (!response.ok) {\r\n            throw new Error(`Request failed with status: ${response.status}`);\r\n        }\r\n\r\n        const audioBlob = await response.blob();\r\n        const audioUrl = URL.createObjectURL(audioBlob);\r\n\r\n        self.postMessage({ success: true, audioUrl })\r\n    } catch (error) {\r\n        self.postMessage({ success: false, error: error.message });\r\n    }\r\n});\n\n//# sourceURL=webpack://webpack-bedtime-stories/./src/app.worker.js?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = {};
/******/ 	__webpack_modules__["./src/app.worker.js"]();
/******/ 	
/******/ })()
;