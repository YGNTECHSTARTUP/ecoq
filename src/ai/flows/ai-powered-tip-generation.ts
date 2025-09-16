'use server';

/**
 * @fileOverview An AI-powered energy-saving tip generator.
 *
 * - generateEnergySavingTip - A function that generates personalized energy-saving tips.
 * - EnergySavingTipInput - The input type for the generateEnergySavingTip function.
 * - EnergySavingTipOutput - The return type for the generateEnergySavingTip function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Tool to get weather data
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
    // In a real app, you would fetch this from a weather API
    // For this demo, we'll return simulated data for the requested city.
    const temp = (Math.random() * 10 + 25).toFixed(1); // 25-35 C
    const humidity = (Math.random() * 30 + 60).toFixed(0); // 60-90%
    return `Simulated weather for ${city}: Temperature: ${temp}°C, Humidity: ${humidity}%, Partly Cloudy.`;
  }
);


const EnergySavingTipInputSchema = z.object({
  realTimeData: z
    .string()
    .describe('Real-time energy usage data, including current power consumption and historical usage patterns.'),
  currentQuests: z
    .string()
    .describe('A list of the user’s current energy-saving quests and their progress.'),
  deviceStatus: z
    .string()
    .describe('The status of connected smart home devices, such as AC temperature settings and lighting status.'),
});
export type EnergySavingTipInput = z.infer<typeof EnergySavingTipInputSchema>;

const EnergySavingTipOutputSchema = z.object({
  tip: z.string().describe('A personalized energy-saving tip based on the provided data.'),
});
export type EnergySavingTipOutput = z.infer<typeof EnergySavingTipOutputSchema>;

export async function generateEnergySavingTip(input: EnergySavingTipInput): Promise<EnergySavingTipOutput> {
  return generateEnergySavingTipFlow(input);
}

const prompt = ai.definePrompt({
  name: 'energySavingTipPrompt',
  input: {schema: EnergySavingTipInputSchema},
  output: {schema: EnergySavingTipOutputSchema},
  tools: [getWeatherDataTool],
  prompt: `You are an AI assistant that provides personalized energy-saving tips to users.

  Your primary goal is to help the user save energy. You should use the available tools to get real-time information, like weather, to provide the most relevant tips. The user is located in Visakhapatnam, India.

  Based on the user's real-time energy data, current quests, and device status, generate a single, actionable tip that the user can implement immediately to reduce their energy consumption.

  Real-time Energy Data: {{{realTimeData}}}
Current Quests: {{{currentQuests}}}
Device Status: {{{deviceStatus}}}

  Provide a tip that is clear, concise, and easy to understand. The tip should be tailored to the user's specific situation and encourage them to take immediate action.
`,
});

const generateEnergySavingTipFlow = ai.defineFlow(
  {
    name: 'generateEnergySavingTipFlow',
    inputSchema: EnergySavingTipInputSchema,
    outputSchema: EnergySavingTipOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
