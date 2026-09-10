# Extract this app into `szduda/dunsy-api`

This directory is a **complete, independent NestJS repo** (`@dunsy/api`). It lives here only because the agent token cannot create a second GitHub repository.

Do not import this folder from the Next.js app. Do not set the Redunsy Vercel project root to `dunsy-api/`.

## Create the GitHub repo and move history

From the Redunsy checkout:

```bash
git subtree split -P dunsy-api -b dunsy-api-split
mkdir -p ../dunsy-api && cd ../dunsy-api
git init -b master
git pull ../redunsy dunsy-api-split
gh repo create szduda/dunsy-api --public --source=. --remote=origin --push
```

Then delete `dunsy-api/` from Redunsy in a follow-up PR.

Import the new GitHub repo on Vercel as its own project (`framework: nestjs`, Fluid Compute). Set `DUNSY_API_INTERNAL_KEY` (and later `ADMIN_EMAILS`, `POSTGRES_URL`) on that project.
