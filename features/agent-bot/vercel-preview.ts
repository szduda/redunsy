/**
 * Derives the Vercel preview URL from a git branch name.
 * Pattern: https://{project}-git-{branch-slug}-{scope}.vercel.app
 *
 * Set VERCEL_PROJECT_SLUG and VERCEL_SCOPE_SLUG in your environment to
 * override the defaults (project name and Vercel team/username slug).
 */
const slugifyBranch = (branch: string) =>
  branch
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 63)

export const branchToPreviewUrl = (branchName: string): string => {
  const slug = slugifyBranch(branchName)
  const project = process.env.VERCEL_PROJECT_SLUG ?? 'redunsy'
  const scope = process.env.VERCEL_SCOPE_SLUG ?? 'szduda'
  return `https://${project}-git-${slug}-${scope}.vercel.app`
}

export const promptToBranchName = (prompt: string): string => {
  const slug = prompt
    .toLowerCase()
    // Chat SDK normalises <@USERID> → @userid; also strip raw <tag> forms
    .replace(/@\S+/g, '')
    .replace(/<[^>]+>/g, '')
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 44)
    .replace(/-$/, '')
  // Short timestamp suffix keeps branch names unique across sessions
  const suffix = Date.now().toString(36).slice(-4)
  return `agent/${slug}-${suffix}`
}
