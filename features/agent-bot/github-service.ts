import { Octokit } from '@octokit/rest'

const OWNER = process.env.GITHUB_REPO_OWNER ?? 'szduda'
const REPO = process.env.GITHUB_REPO_NAME ?? 'redunsy'
const BASE_BRANCH = process.env.GITHUB_BASE_BRANCH ?? 'master'

const getOctokit = () => new Octokit({ auth: process.env.GITHUB_TOKEN })

export const createBranch = async (branchName: string): Promise<void> => {
  const octokit = getOctokit()

  const { data: branch } = await octokit.repos.getBranch({
    owner: OWNER,
    repo: REPO,
    branch: BASE_BRANCH,
  })

  try {
    await octokit.git.createRef({
      owner: OWNER,
      repo: REPO,
      ref: `refs/heads/${branchName}`,
      sha: branch.commit.sha,
    })
  } catch (err: unknown) {
    // 422 means the branch already exists — treat as success
    if (
      typeof err === 'object' &&
      err !== null &&
      'status' in err &&
      (err as { status: number }).status === 422
    )
      return
    throw err
  }
}
