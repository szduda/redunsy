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
    .replace(/<[^>]+>/g, '') // strip Slack mention markup
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 48)
    .replace(/-$/, '')
  return `agent/${slug}`
}
