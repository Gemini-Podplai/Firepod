// Import the Genkit core libraries and plugins.
import {genkit, z} from "genkit";
import {googleAI} from "@genkit-ai/googleai";

// Import models from the Google AI plugin. The Google AI API provides access to
// several generative models. Here, we import Gemini 2.0 Flash.
import {gemini20Flash} from "@genkit-ai/googleai";

// Cloud Functions for Firebase supports Genkit natively. The onCallGenkit function creates a callable
// function from a Genkit action. It automatically implements streaming if your flow does.
// The https library also has other utility methods such as hasClaim, which verifies that
// a caller's token has a specific claim (optionally matching a specific value)
import { onCallGenkit } from "firebase-functions/https";

// Genkit models generally depend on an API key. APIs should be stored in Cloud Secret Manager so that
// access to these sensitive values can be controlled. defineSecret does this for you automatically.
// If you are using Google generative AI you can get an API key at https://aistudio.google.com/app/apikey
import { defineSecret } from "firebase-functions/params";
const apiKey = defineSecret("GOOGLE_GENAI_API_KEY");

const ai = genkit({
  plugins: [
    // Load the Google AI plugin. You can optionally specify your API key
    // by passing in a config object; if you don't, the Google AI plugin uses
    // the value from the GOOGLE_GENAI_API_KEY environment variable, which is
    // the recommended practice.
    googleAI(),
  ],
});

// Define a tool to get the current time
const getCurrentTimeTool = ai.defineTool(
  {
    name: "getCurrentTime",
    description: "Gets the current time",
    inputSchema: z.object({}),
    outputSchema: z.string(),
  },
  async () => {
    return new Date().toISOString();
  }
);


// Define a simple flow that prompts an LLM to generate menu suggestions.
const menuSuggestionFlow = ai.defineFlow(
  {
    name: "menuSuggestionFlow",
    description: "Suggests a menu item based on a restaurant theme.", // Added description
    inputSchema: z.string().describe("A restaurant theme").default("seafood"),
    outputSchema: z.string(),
    streamSchema: z.string(),
    tools: [getCurrentTimeTool], // Add the tool to this flow
  },
  async (subject, { sendChunk }) => {
    // Construct a request and send it to the model API.
    const prompt =
      `Suggest an item for the menu of a ${subject} themed restaurant`;
    const { response, stream } = ai.generateStream({
      model: gemini20Flash,
      prompt: prompt,
      config: {
        temperature: 1,
      },
    });

    for await (const chunk of stream) {
      sendChunk(chunk.text);
    }

    // Handle the response from the model API. In this sample, we just
    // convert it to a string, but more complicated flows might coerce the
    // response into structured output or chain the response into another
    // LLM call, etc.
    return (await response).text;
  }
);

export const menuSuggestion = onCallGenkit({
  // Uncomment to enable AppCheck. This can reduce costs by ensuring only your Verified
  // app users can use your API. Read more at https://firebase.google.com/docs/app-check/cloud-functions
  // enforceAppCheck: true,

  // authPolicy can be any callback that accepts an AuthData (a uid and tokens dictionary) and the
  // request data. The isSignedIn() and hasClaim() helpers can be used to simplify. The following
  // will require the user to have the email_verified claim, for example.
  // authPolicy: hasClaim("email_verified"), // Keep this commented out as it was in the original file if not used

  // Grant access to the API key to this function:
  secrets: [apiKey],
}, menuSuggestionFlow);

// This is a sample Genkit flow
export const sampleFlow = ai.defineFlow(
  {
    name: 'Sample Flow',
    description: 'A sample flow using Genkit that responds to a query.', // Added description
    inputSchema: z.object({ // Using z.object for input schema
      query: z.string()
    }),
    outputSchema: z.object({ // Using z.object for output schema
      response: z.string()
    }),
  },
  async (input) => { // Corrected parameter name to match inputSchema
    // You can integrate with Firebase and other services here
    return {
      response: `You asked: ${input.query}. This is a sample response from Genkit flow.`
    };
  }
);