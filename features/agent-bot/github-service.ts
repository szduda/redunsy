import { Octokit } from '@octokit/rest'

const OWNER = process.env.GITHUB_REPO_OWNER ?? 'szduda'
const REPO = process.env.GITHUB_REPO_NAME ?? 'redunsy'
const BASE_BRANCH = process.env.GITHUB_BASE_BRANCH ?? 'master'

const getOctokit = () => new Octokit({ auth: process.env.GITHUB_TOKEN })

export const createBranch = async (branchName: string): Promise<void> => {
  const octokit = getOctokit()

  // Use repos.getBranch instead of git.getRef: the ref path parameter in
  // getRef gets URL-encoded (heads/main → heads%2Fmain) by Octokit, causing
  // a 404. getBranch uses a clean branch-name path parameter without slashes.
  const { data: branch } = await octokit.repos.getBranch({
    owner: OWNER,
    repo: REPO,
    branch: BASE_BRANCH,
  })

  await octokit.git.createRef({
    owner: OWNER,
    repo: REPO,
    ref: `refs/heads/${branchName}`,
    sha: branch.commit.sha,
  })
}
