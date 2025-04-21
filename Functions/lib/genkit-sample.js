"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatCompletion = exports.generateText = exports.analyzeImage = exports.processQuery = exports.sampleFlow = exports.menuSuggestion = void 0;
// Import the Genkit core libraries and plugins.
const genkit_1 = require("genkit");
const googleai_1 = require("@genkit-ai/googleai");
// Import models from the Google AI plugin. The Google AI API provides access to
// several generative models. Here, we import Gemini 1.5 Flash.
const googleai_2 = require("@genkit-ai/googleai");
// Cloud Functions for Firebase supports Genkit natively. The onCallGenkit function creates a callable
// function from a Genkit action. It automatically implements streaming if your flow does.
// The https library also has other utility methods such as hasClaim, which verifies that
// a caller's token has a specific claim (optionally matching a specific value)
const https_1 = require("firebase-functions/https");
// Genkit models generally depend on an API key. APIs should be stored in Cloud Secret Manager so that
// access to these sensitive values can be controlled. defineSecret does this for you automatically.
// If you are using Google generative AI you can get an API key at https://aistudio.google.com/app/apikey
const params_1 = require("firebase-functions/params");
const apiKey = (0, params_1.defineSecret)("GOOGLE_GENAI_API_KEY");
const ai = (0, genkit_1.genkit)({
    plugins: [
        // Load the Google AI plugin. You can optionally specify your API key
        // by passing in a config object; if you don't, the Google AI plugin uses
        // the value from the GOOGLE_GENAI_API_KEY environment variable, which is
        // the recommended practice.
        (0, googleai_1.googleAI)(),
    ],
});
// Define a simple flow that prompts an LLM to generate menu suggestions.
const menuSuggestionFlow = ai.defineFlow({
    name: "menuSuggestionFlow",
    inputSchema: genkit_1.z.string().describe("A restaurant theme").default("seafood"),
    outputSchema: genkit_1.z.string(),
    streamSchema: genkit_1.z.string(),
}, async (subject, { sendChunk }) => {
    var _a, e_1, _b, _c;
    // Construct a request and send it to the model API.
    const prompt = `Suggest an item for the menu of a ${subject} themed restaurant`;
    const { response, stream } = ai.generateStream({
        model: googleai_2.gemini15Flash,
        prompt: prompt,
        config: {
            temperature: 1,
        },
    });
    try {
        for (var _d = true, stream_1 = __asyncValues(stream), stream_1_1; stream_1_1 = await stream_1.next(), _a = stream_1_1.done, !_a; _d = true) {
            _c = stream_1_1.value;
            _d = false;
            const chunk = _c;
            sendChunk(chunk.text);
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (!_d && !_a && (_b = stream_1.return)) await _b.call(stream_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    // Handle the response from the model API. In this sample, we just
    // convert it to a string, but more complicated flows might coerce the
    // response into structured output or chain the response into another
    // LLM call, etc.
    return (await response).text;
});
exports.menuSuggestion = (0, https_1.onCallGenkit)({
    // Uncomment to enable AppCheck. This can reduce costs by ensuring only your Verified
    // app users can use your API. Read more at https://firebase.google.com/docs/app-check/cloud-functions
    // enforceAppCheck: true,
    // authPolicy can be any callback that accepts an AuthData (a uid and tokens dictionary) and the
    // request data. The isSignedIn() and hasClaim() helpers can be used to simplify. The following
    // will require the user to have the email_verified claim, for example.
    // authPolicy: hasClaim("email_verified"),
    // Grant access to the API key to this function:
    secrets: [apiKey],
}, menuSuggestionFlow);
const ai_1 = require("@genkit-ai/ai");
// This is a sample Genkit flow
exports.sampleFlow = (0, ai_1.flow)({
    name: 'Sample Flow',
    description: 'A sample flow using Genkit',
    input: {
        type: 'object',
        properties: {
            query: { type: 'string' }
        },
        required: ['query']
    },
    output: {
        type: 'object',
        properties: {
            response: { type: 'string' }
        }
    },
    run: async ({ query }) => {
        // You can integrate with Firebase and other services here
        return {
            response: `You asked: ${query}. This is a sample response from Genkit flow.`
        };
    }
});
const functions = __importStar(require("firebase-functions"));
exports.processQuery = functions.https.onCall(async (data, context) => {
    try {
        const { query } = data;
        if (!query || typeof query !== 'string') {
            throw new functions.https.HttpsError("invalid-argument", "The function must be called with a 'query' argument.");
        }
        // Process query logic here
        return {
            result: `Processed query: ${query}`
        };
    }
    catch (error) {
        console.error("Error processing query:", error);
        throw new functions.https.HttpsError("internal", "Error processing query");
    }
});
/**
 * Example of a function that processes images
 */
exports.analyzeImage = functions.https.onCall(async (data, context) => {
    return {
        message: "Image analysis functionality would be implemented here"
    };
});
const https_2 = require("firebase-functions/v2/https");
// Define API key secret
const apiKey2 = (0, params_1.defineSecret)("GOOGLE_API_KEY"); //Using a different name to avoid conflict.  Adjust as needed.
// Initialize Gemini -  This section needs adjustment based on the actual Google Generative AI library usage.
// The original code doesn't show how to instantiate or use this library, so I'm making assumptions.
//  You might need to install the necessary package: npm install @google/generative-ai
// Initialize Gemini
//const genAI = new GoogleGenerativeAI(apiKey2.value());
// Chat function with Gemini
exports.generateText = (0, https_2.onCall)({ secrets: [apiKey2] }, async (request) => {
    try {
        const { prompt } = request.data;
        if (!prompt) {
            throw new Error("No prompt provided");
        }
        // Get Gemini model - This section is highly dependent on the actual Google Generative AI library.  Replace with correct code.
        //const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
        // Generate content -  This is a placeholder and needs to be replaced with actual code using the Google Generative AI library.
        //const result = await model.generateContent(prompt);
        //const response = await result.response;
        return {
            text: "Placeholder response from generateText", //Replace with actual response.
            status: "success"
        };
    }
    catch (error) {
        console.error("Error generating text:", error);
        throw new Error("Failed to generate text");
    }
});
// Chat completion with memory
exports.chatCompletion = (0, https_2.onCall)({ secrets: [apiKey2] }, async (request) => {
    try {
        const { messages } = request.data;
        if (!messages || !Array.isArray(messages)) {
            throw new Error("Invalid messages format");
        }
        // Get Gemini model - This section is highly dependent on the actual Google Generative AI library. Replace with correct code.
        //const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
        //const chat = model.startChat();
        // Send all messages to maintain context - This is a placeholder and needs to be replaced with actual code using the Google Generative AI library.
        //const result = await chat.sendMessage(messages[messages.length - 1].content);
        //const response = await result.response;
        return {
            text: "Placeholder response from chatCompletion", //Replace with actual response.
            status: "success"
        };
    }
    catch (error) {
        console.error("Error in chat completion:", error);
        throw new Error("Failed to complete chat");
    }
});
//# sourceMappingURL=genkit-sample.js.map