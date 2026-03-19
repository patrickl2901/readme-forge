import { google } from '@ai-sdk/google'
import { streamText } from 'ai'
import { NextResponse } from 'next/server'
import { rateLimit, getClientIP, rateLimitResponse } from '@/lib/rate-limit'

const TEMPLATE_PROMPTS = {
  minimal: `Create a minimalist README with only the essential sections: Title, Description, Installation, and Usage. No badges, no fluff. Keep it under 300 words.`,
  
  modern: `Create a modern, professional README with:
- Title with emoji
- Badges for top 3 languages
- Description
- Features (bullet points)
- Installation
- Usage with code example
- Contributing
- License
Use a clean, organized structure with proper markdown formatting.`,
  
  notion: `Create a clean, documentation-focused README inspired by Notion:
- Clean title without emoji
- Brief description in a callout block style
- Table of contents
- Sections: Overview, Getting Started, API Reference, Examples
- Use ### for subsections
- Minimal visual elements, focus on readability`,
  
  showcase: `Create a visually impressive README for a project showcase:
- Hero section with title and description
- Badges for all languages
- Demo/Live links section
- Screenshots/Media section
- Feature highlights with icons
- Tech stack with logos
- Installation, Usage, Contributing
- GitHub stats (stars, forks placeholders)
- Footer with links`,
  
  library: `Create a README optimized for a library/package:
- Title with package manager badges (npm, pip, etc.)
- One-liner description
- Badges for version, license, downloads
- Installation for multiple package managers
- API/Export documentation structure
- Usage examples with code blocks
- TypeScript types info if applicable
- Contributing guidelines
- Changelog placeholder
- License`,
}

export async function POST(request: Request) {
  const ip = getClientIP(request)
  const { success, reset } = rateLimit(ip, 10, 60000)

  if (!success) {
    return rateLimitResponse(reset)
  }

  try {
    const body = await request.json()
    const { repoData, template = 'modern' } = body

    if (!repoData) {
      return NextResponse.json(
        { error: 'Missing repoData' },
        { status: 400 }
      )
    }

    const templatePrompt = TEMPLATE_PROMPTS[template as keyof typeof TEMPLATE_PROMPTS] || TEMPLATE_PROMPTS.modern

    const topLanguages = Object.entries(repoData.languages as Record<string, number>)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, 3)
      .map(([lang]) => lang)

    const prompt = `You are an expert README writer. Create a professional, complete README.md for the following GitHub repository.

# Repository Information
${JSON.stringify({
  name: repoData.name,
  owner: repoData.owner,
  description: repoData.description,
  stars: repoData.stars,
  license: repoData.license,
  primaryLanguage: repoData.primaryLanguage,
  languages: repoData.languages,
  topics: repoData.topics,
  hasReadme: repoData.hasReadme,
}, null, 2)}

# Tech Stack (dependencies detected)
${repoData.techStack.slice(0, 20).join(', ')}${repoData.techStack.length > 20 ? '...' : ''}

# Top Languages
${topLanguages.join(', ')}

# Template Style
${templatePrompt}

# Requirements
1. Start with the repository title (use the actual name: ${repoData.name})
2. Include relevant badges (use shields.io format)
3. Add a description based on the repo's actual description
4. Include installation steps
5. Add usage example (create a realistic example based on the tech stack)
6. Add Contributing section
7. End with License section (use actual: ${repoData.license || 'MIT'})
8. Do NOT include placeholder text like [your-package-name] - use the actual repo name
9. Output ONLY the markdown, no explanations, no code blocks around it

Generate the complete README now:`

    const result = await streamText({
      model: google('models/gemini-2.5-flash'),
      prompt,
    })

    return result.toTextStreamResponse()
  } catch (error) {
    console.error('Error generating README:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Generation failed' },
      { status: 500 }
    )
  }
}
