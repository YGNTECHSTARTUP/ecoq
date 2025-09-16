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

const EnergySavingTipInputSchema = z.object({
  realTimeData: z
    .string()
    .describe('Real-time energy usage data, including current power consumption and historical usage patterns.'),
  currentQuests: z
    .string()
    .describe('A list of the user’s current energy-saving quests and their progress.'),
  weatherConditions: z.string().describe('Current weather conditions, including temperature and humidity, from the weather API.'),
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
  prompt: `You are an AI assistant that provides personalized energy-saving tips to users.

  Based on the user's real-time energy data, current quests, weather conditions, and device status, generate a single, actionable tip that the user can implement immediately to reduce their energy consumption.

  Real-time Energy Data: {{{realTimeData}}}
Current Quests: {{{currentQuests}}}
Weather Conditions: {{{weatherConditions}}}
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
