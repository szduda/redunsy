import { Octokit } from '@octokit/rest'

const OWNER = process.env.GITHUB_REPO_OWNER ?? 'szduda'
const REPO = process.env.GITHUB_REPO_NAME ?? 'redunsy'
const BASE_BRANCH = process.env.GITHUB_BASE_BRANCH ?? 'main'

const getOctokit = () => new Octokit({ auth: process.env.GITHUB_TOKEN })

export const createBranch = async (branchName: string): Promise<void> => {
  const octokit = getOctokit()

  const { data: ref } = await octokit.git.getRef({
    owner: OWNER,
    repo: REPO,
    ref: `heads/${BASE_BRANCH}`,
  })

  await octokit.git.createRef({
    owner: OWNER,
    repo: REPO,
    ref: `refs/heads/${branchName}`,
    sha: ref.object.sha,
  })
}
