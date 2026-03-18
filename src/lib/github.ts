export interface RepoData {
  repoUrl: string
  owner: string
  name: string
  description: string
  stars: number
  license: string | null
  primaryLanguage: string | null
  languages: Record<string, number>
  techStack: string[]
  hasReadme: boolean
  topics: string[]
  defaultBranch: string
}

function parseRepoUrl(url: string): { owner: string; repo: string } | null {
  const patterns = [
    /^https:\/\/github\.com\/([^\/]+)\/([^\/]+)\/?$/,
    /^https:\/\/github\.com\/([^\/]+)\/([^\/]+)\.git$/,
    /^github\.com\/([^\/]+)\/([^\/]+)\/?$/,
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) {
      return { owner: match[1], repo: match[2].replace(/\.git$/, '') }
    }
  }
  return null
}

async function fetchGitHub<T>(url: string, pat?: string): Promise<T> {
  const headers: HeadersInit = {
    'Accept': 'application/vnd.github.v3+json',
  }

  if (pat) {
    headers['Authorization'] = `Bearer ${pat}`
  }

  const response = await fetch(url, { headers })

  if (response.status === 404) {
    throw new Error('Repository not found. Please check the URL.')
  }

  if (response.status === 403) {
    const rateLimitRemaining = response.headers.get('X-RateLimit-Remaining')
    if (rateLimitRemaining === '0') {
      throw new Error(
        'GitHub API rate limit exceeded. Add your GitHub PAT (Personal Access Token) for higher rate limits.'
      )
    }
    throw new Error('Access forbidden. The repository may be private.')
  }

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.statusText}`)
  }

  return response.json()
}

function parsePackageJson(content: string): string[] {
  try {
    const pkg = JSON.parse(content)
    const deps = [
      ...Object.keys(pkg.dependencies || {}),
      ...Object.keys(pkg.devDependencies || {}),
    ]
    return deps
  } catch {
    return []
  }
}

function parseRequirementsTxt(content: string): string[] {
  const deps: string[] = []
  const lines = content.split('\n')
  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed && !trimmed.startsWith('#') && !trimmed.startsWith('-')) {
      const match = trimmed.match(/^([a-zA-Z0-9_-]+)/)
      if (match) {
        deps.push(match[1])
      }
    }
  }
  return deps
}

function parseCargoToml(content: string): string[] {
  const deps: string[] = []
  const lines = content.split('\n')
  let inDependencies = false

  for (const line of lines) {
    if (line.trim() === '[dependencies]') {
      inDependencies = true
      continue
    }
    if (line.trim().startsWith('[')) {
      inDependencies = false
      continue
    }
    if (inDependencies) {
      const match = line.trim().match(/^([a-zA-Z0-9_-]+)/)
      if (match && !line.includes('=')) {
        deps.push(match[1])
      }
    }
  }
  return deps
}

function extractTechStack(
  files: Record<string, { type: string; download_url?: string }>,
  fileContents: Map<string, string>
): string[] {
  const techStack: Set<string> = new Set()

  for (const [path, fileInfo] of Object.entries(files)) {
    if (fileInfo.type !== 'file') continue

    const fileName = path.toLowerCase()
    const content = fileContents.get(path)

    if (fileName === 'package.json' && content) {
      const deps = parsePackageJson(content)
      deps.forEach(d => techStack.add(d))
    }

    if (fileName === 'requirements.txt' && content) {
      const deps = parseRequirementsTxt(content)
      deps.forEach(d => techStack.add(d))
    }

    if (fileName === 'cargo.toml' && content) {
      const deps = parseCargoToml(content)
      deps.forEach(d => techStack.add(d))
    }

    if (fileName === 'go.mod' && content) {
      const match = content.match(/module ([^\s]+)/)
      if (match) techStack.add('Go')
    }

    if (fileName === 'pom.xml' && content) {
      techStack.add('Maven')
    }

    if (fileName === 'build.gradle' && content) {
      techStack.add('Gradle')
    }
  }

  return Array.from(techStack)
}

export async function fetchRepoData(
  repoUrl: string,
  pat?: string
): Promise<RepoData> {
  const parsed = parseRepoUrl(repoUrl)
  if (!parsed) {
    throw new Error(
      'Invalid GitHub URL. Please use format: https://github.com/owner/repo'
    )
  }

  const { owner, repo } = parsed
  const baseUrl = 'https://api.github.com'

  const [repoData, languages, contents] = await Promise.all([
    fetchGitHub<{
      name: string
      description: string | null
      stargazers_count: number
      license: { spdx_id: string | null } | null
      language: string | null
      topics: string[]
      default_branch: string
    }>(`${baseUrl}/repos/${owner}/${repo}`, pat),

    fetchGitHub<Record<string, number>>(
      `${baseUrl}/repos/${owner}/${repo}/languages`,
      pat
    ),

    fetchGitHub<
      { name: string; type: string; path: string; download_url?: string }[]
    >(`${baseUrl}/repos/${owner}/${repo}/contents`, pat),
  ])

  const rootFiles: Record<string, { type: string; download_url?: string }> = {}
  for (const item of contents) {
    rootFiles[item.name.toLowerCase()] = {
      type: item.type,
      download_url: item.download_url || undefined,
    }
  }

  const hasReadme = 'readme.md' in rootFiles || 'readme' in rootFiles

  const fileContents = new Map<string, string>()
  const filesToFetch = ['package.json', 'requirements.txt', 'cargo.toml']

  await Promise.all(
    filesToFetch
      .filter(fileName => fileName in rootFiles)
      .map(async fileName => {
        const fileInfo = rootFiles[fileName]
        if (fileInfo?.download_url) {
          try {
            const content = await fetch(fileInfo.download_url).then(r =>
              r.text()
            )
            fileContents.set(fileName, content)
          } catch {
            // Skip if fetch fails
          }
        }
      })
  )

  const techStack = extractTechStack(rootFiles, fileContents)

  return {
    repoUrl,
    owner,
    name: repo,
    description: repoData.description || '',
    stars: repoData.stargazers_count,
    license: repoData.license?.spdx_id || null,
    primaryLanguage: repoData.language || null,
    languages,
    techStack,
    hasReadme,
    topics: repoData.topics || [],
    defaultBranch: repoData.default_branch,
  }
}
