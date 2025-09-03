'use server';

/**
 * @fileOverview Generates a professional portfolio for students using AI.
 *
 * - generateAIProfile - A function that generates a professional portfolio from skills, completed tasks, and reviews.
 * - AIProfileGeneratorInput - The input type for the generateAIProfile function.
 * - AIProfileGeneratorOutput - The return type for the generateAIProfile function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AIProfileGeneratorInputSchema = z.object({
  skills: z
    .string()
    .describe('A list of skills the student possesses, separated by commas.'),
  completedTasks: z
    .string()
    .describe('A list of completed tasks or projects, separated by commas.'),
  reviews: z
    .string()
    .describe('A list of reviews or testimonials, separated by commas.'),
});
export type AIProfileGeneratorInput = z.infer<typeof AIProfileGeneratorInputSchema>;

const AIProfileGeneratorOutputSchema = z.object({
  portfolio: z
    .string()
    .describe('A professional portfolio generated from the provided information.'),
});
export type AIProfileGeneratorOutput = z.infer<typeof AIProfileGeneratorOutputSchema>;

export async function generateAIProfile(input: AIProfileGeneratorInput): Promise<AIProfileGeneratorOutput> {
  return aiProfileGeneratorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiProfileGeneratorPrompt',
  input: {schema: AIProfileGeneratorInputSchema},
  output: {schema: AIProfileGeneratorOutputSchema},
  prompt: `You are a professional portfolio generator. You will receive the student's skills, completed tasks, and reviews and generate a professional portfolio for them.

Skills: {{{skills}}}
Completed Tasks: {{{completedTasks}}}
Reviews: {{{reviews}}}

Portfolio:`, // Removed the extra newline here
});

const aiProfileGeneratorFlow = ai.defineFlow(
  {
    name: 'aiProfileGeneratorFlow',
    inputSchema: AIProfileGeneratorInputSchema,
    outputSchema: AIProfileGeneratorOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
