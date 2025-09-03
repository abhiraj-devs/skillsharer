'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  AIProfileGeneratorInput,
  generateAIProfile,
} from '@/ai/flows/ai-profile-generator';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Loader2, Sparkles } from 'lucide-react';
import { userProfile } from '@/lib/data';

const formSchema = z.object({
  skills: z.string().min(10, 'Please list at least a few skills.'),
  completedTasks: z.string().min(10, 'Please list at least one task.'),
  reviews: z.string().min(10, 'Please provide at least one review.'),
});

export default function AIProfileGenerator() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');

  const defaultValues = {
    skills: userProfile.skills.join(', '),
    completedTasks: userProfile.completedTasks
      .map((task) => task.title)
      .join(', '),
    reviews: userProfile.reviews.map((r) => r.comment).join('; '),
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    setResult('');
    try {
      const output = await generateAIProfile(values);
      setResult(output.portfolio);
    } catch (error) {
      console.error('AI Profile Generation failed:', error);
      setResult('Failed to generate AI portfolio. Please try again later.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2">
          <Sparkles className="text-accent" />
          AI Portfolio Generator
        </CardTitle>
        <CardDescription>
          Generate a professional summary of your skills and experience using
          AI.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="skills"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Skills</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., React, Next.js, Figma, Logo Design"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="completedTasks"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Completed Tasks</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., Designed a resume, Debugged a Python script"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="reviews"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Reviews</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., Great communication and fast delivery."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {result && (
              <div className="space-y-2">
                <Label>Generated Portfolio Summary</Label>
                <Textarea readOnly value={result} rows={6} className="bg-muted"/>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                'Generate Summary'
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
