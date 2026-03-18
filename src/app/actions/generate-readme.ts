'use server'

import { z } from 'zod'
import { fetchRepoData, type RepoData } from '@/lib/github'
import { createServerClient } from '@/lib/supabase'

const generateReadmeSchema = z.object({
  repoUrl: z.string().url(),
  pat: z.string().optional(),
  template: z.enum(['minimal', 'modern', 'notion', 'showcase', 'library']).default('modern'),
})

export interface GenerateReadmeResult {
  success: boolean
  data?: {
    repoData: RepoData
    generatedMarkdown: string
  }
  error?: string
}

export async function generateReadmeAction(
  formData: FormData
): Promise<GenerateReadmeResult> {
  const rawData = {
    repoUrl: formData.get('repoUrl') as string,
    pat: formData.get('pat') as string | undefined,
    template: formData.get('template') as string | undefined,
  }

  const validated = generateReadmeSchema.safeParse(rawData)

  if (!validated.success) {
    const errorMessages = validated.error.issues.map((e: { message: string }) => e.message)
    return {
      success: false,
      error: errorMessages.join(', '),
    }
  }

  const { repoUrl, pat } = validated.data

  try {
    const repoData = await fetchRepoData(repoUrl, pat || undefined)

    return {
      success: true,
      data: {
        repoData,
        generatedMarkdown: '',
      },
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
    }
  }
}

export async function saveReadmeToDatabase(
  userId: string,
  repoUrl: string,
  repoName: string,
  generatedMarkdown: string,
  template: string,
  metadata: object
) {
  const supabase = await createServerClient()

  const { error } = await supabase.from('readmes').insert({
    user_id: userId,
    repo_url: repoUrl,
    repo_name: repoName,
    generated_markdown: generatedMarkdown,
    template,
    metadata,
  })

  if (error) {
    throw new Error(`Failed to save README: ${error.message}`)
  }
}
