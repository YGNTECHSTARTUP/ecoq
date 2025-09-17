'use server';
/**
 * @fileOverview An AI-powered energy-saving quest generator.
 *
 * - generateNewQuest - A function that generates personalized energy-saving quests.
 * - QuestGenerationInput - The input type for the generateNewQuest function.
 * - QuestGenerationOutput - The return type for the generateNewQuest function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { QuestGenerationInputSchema, QuestGenerationOutputSchema, type QuestGenerationInput, type QuestGenerationOutput } from '@/lib/types';


const getWeatherDataTool = ai.defineTool(
  {
    name: 'getWeatherData',
    description: 'Get current weather data for a location.',
    inputSchema: z.object({
      city: z.string().describe('The city to get weather data for, e.g. "Visakhapatnam"'),
    }),
    outputSchema: z.string().describe("A string describing the weather conditions. E.g. 'Temperature: 32°C, Humidity: 75%, Sunny.'"),
  },
  async ({city}) => {
    const temp = (Math.random() * 10 + 25).toFixed(1); // 25-35 C
    const humidity = (Math.random() * 30 + 60).toFixed(0); // 60-90%
    return `Simulated weather for ${city}: Temperature: ${temp}°C, Humidity: ${humidity}%, Partly Cloudy.`;
  }
);

const getAirQualityDataTool = ai.defineTool(
    {
      name: 'getAirQualityData',
      description: 'Get current air quality data for a location.',
      inputSchema: z.object({
        city: z.string().describe('The city to get air quality data for, e.g. "Visakhapatnam"'),
      }),
      outputSchema: z.string().describe("A string describing the air quality. E.g. 'AQI: 112, Unhealthy for Sensitive Groups.'"),
    },
    async ({city}) => {
      const aqi = (Math.random() * 100 + 50).toFixed(0); // 50-150 AQI
      let category = 'Moderate';
      if (Number(aqi) > 100) category = 'Unhealthy for Sensitive Groups';
      return `Simulated air quality for ${city}: AQI: ${aqi}, ${category}.`;
    }
  );

export async function generateNewQuest(input: QuestGenerationInput): Promise<QuestGenerationOutput> {
  return generateNewQuestFlow(input);
}

const prompt = ai.definePrompt({
  name: 'questGenerationPrompt',
  input: {schema: QuestGenerationInputSchema},
  output: {schema: QuestGenerationOutputSchema},
  tools: [getWeatherDataTool, getAirQualityDataTool],
  prompt: `You are an AI Quest Master for EcoQuest, an app that gamifies energy saving.

  Your goal is to create a new, creative, and actionable energy-saving quest for the user. The user is located in Visakhapatnam, India.

  Use the available tools to get real-time weather and air quality data to make the quest relevant.

  RULES:
  - The quest MUST be different from the user's existing quests.
  - The quest should be achievable within a day.
  - The quest should be specific and measurable.
  - Set the quest 'type' to 'event'.
  - Set the initial 'progress' to 0.

  Existing Quests: {{{existingQuests}}}
  Device Status: {{{deviceStatus}}}

  Generate one new quest based on all the available data. Be creative! For example, if it's hot, create a quest about AC efficiency. If air quality is poor, suggest an indoor-focused quest.
`,
});

const generateNewQuestFlow = ai.defineFlow(
  {
    name: 'generateNewQuestFlow',
    inputSchema: QuestGenerationInputSchema,
    outputSchema: QuestGenerationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
