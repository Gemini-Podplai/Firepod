export interface Model {
  id: string;
  name: string;
  description?: string;
  detailedInfo?: string;
  provider?: string;
  defaultParams?: ModelParameters;
}

export interface ModelParameters {
  temperature: number;
  topP: number;
  topK: number;
  maxTokens: number;
}

export const DEFAULT_PARAMETERS: ModelParameters = {
  temperature: 0.7,
  topP: 0.95,
  topK: 40,
  maxTokens: 1000,
};

export const PARAMETER_DESCRIPTIONS = {
  temperature: {
    title: 'Temperature',
    description: 'Controls randomness. Lower values are more focused and deterministic, higher values are more creative and varied.',
    min: 0,
    max: 1,
    step: 0.01,
  },
  topP: {
    title: 'Top P',
    description: 'Nucleus sampling - limits token selection to a cumulative probability. Lower values make output more focused.',
    min: 0,
    max: 1,
    step: 0.01,
  },
  topK: {
    title: 'Top K',
    description: 'Limits token selection to K most likely tokens. Lower values make output more predictable.',
    min: 1,
    max: 100,
    step: 1,
  },
  maxTokens: {
    title: 'Max Tokens',
    description: 'Maximum number of tokens to generate in the response.',
    min: 1,
    max: 32000,
    step: 1,
  },
};

export const AVAILABLE_MODELS: Model[] = [
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    description: 'Advanced reasoning with broad capabilities',
    detailedInfo: 'OpenAI\'s most advanced model, with improved instruction following, accuracy, and efficiency. Supports 128K context window.',
    provider: 'OpenAI'
  },
  {
    id: 'gpt-4-turbo',
    name: 'GPT-4 Turbo',
    description: 'Powerful and cost-effective for most tasks',
    detailedInfo: 'Optimized for performance and cost, with strong reasoning abilities and knowledge cutoff of April 2023.',
    provider: 'OpenAI'
  },
  {
    id: 'gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo',
    description: 'Fast and efficient for simpler tasks',
    detailedInfo: 'Fast, reliable model for straightforward tasks with good cost efficiency. Best for applications where speed is critical.',
    provider: 'OpenAI'
  },
  {
    id: 'claude-3-opus',
    name: 'Claude 3 Opus',
    description: 'Anthropic\'s most powerful model',
    detailedInfo: 'State-of-the-art reasoning with exceptional performance on complex tasks. Excellent for nuanced content generation and analysis.',
    provider: 'Anthropic'
  },
  {
    id: 'claude-3-sonnet',
    name: 'Claude 3 Sonnet',
    description: 'Balance of intelligence and speed',
    detailedInfo: 'Strong all-around performer with a good balance between quality and speed. Suitable for most enterprise applications.',
    provider: 'Anthropic'
  },
  {
    id: 'gemini-1.5-pro',
    name: 'Gemini 1.5 Pro',
    description: 'Google\'s most capable multimodal model',
    detailedInfo: 'Excellent at handling text, code, images, and audio with a massive 1M token context window. Strong reasoning abilities.',
    provider: 'Google'
  },
  {
    id: 'gemini-1.5-flash',
    name: 'Gemini 1.5 Flash',
    description: 'Faster, more cost-effective Gemini variant',
    detailedInfo: 'Optimized for speed and efficiency while maintaining good quality. Ideal for applications requiring quick responses.',
    provider: 'Google'
  }
];

export const getModelById = (id: string): Model | undefined => {
  return AVAILABLE_MODELS.find(model => model.id === id);
};

export const DEFAULT_MODEL_ID = 'gpt-4o';