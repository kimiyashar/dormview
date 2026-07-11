# DEPLOYMENT.md - deploy status and how to finish it

## DEPLOYED (2026-07-11)

Live at https://dormview.vercel.app (project `dormview`, Vercel team `26kimiys-projects`,
production). Deployed with the local Vercel CLI on Kimi's Mac, which is logged in as
`26kimiy` (binary at `~/.npm-global/bin/vercel`). The Cowork Vercel connector still cannot
reach that team; use the CLI.

To redeploy after editing the HTML:

```
mkdir -p /tmp/dormview
cp cmu-etower-double-3d.html /tmp/dormview/index.html
printf '{"cleanUrls":true}' > /tmp/dormview/vercel.json
cd /tmp/dormview && vercel deploy --prod --yes --scope 26kimiys-projects
```

The sections below are the original handoff notes, kept for context.

The app is a single static file. Hosting it is trivial once account access is sorted; it
just needs to be served as `index.html`.

## Current blockers (as of handoff)

- **Vercel**: the Vercel connector authorized in the Cowork session is signed in as
  "Will's projects" (team id `team_wopP58offSfpdRebC0lvxkoe`). Two problems:
  1. It cannot create a NEW project on that team. Attempting to deploy a new project named
     `dormview` / `etower-double-planner` returns HTTP 403:
     `"You don't have permission to create a project."` The token is a restricted/member
     scope.
  2. It cannot reach Kimi's team `26kimiys-projects` at all. Listing that team's projects
     returns `"Failed to list projects."`, i.e. this account is not a member of it.
- **GitHub**: the GitHub connector was never authorized in the session, so no repo push was
  possible.

Net: no deploy was completed. Nothing about the app itself blocks it; it is purely account
access.

## How to finish the deploy

Pick one:

### Option A - deploy to Kimi's Vercel team (what Will asked for)
1. In the Vercel connector settings, authorize the account that owns
   `https://vercel.com/26kimiys-projects` (the Kimi account), OR add "Will's projects"
   account to that team with a role that can create projects and deploy.
2. Then deploy the file as `index.html` to a new project (for example `dormview`).

### Option B - deploy to Will's team now
1. Deploy into one of the existing "Will's projects" projects (this overwrites whatever is
   currently at that project), or grant the connected account project-creation rights and
   make a fresh project.
2. Fastest way to a shareable link for the floor today.

### Option C - deploy without any connector (manual, no auth needed)
Any static host works. For example:
- Vercel CLI on a normal machine: put the file in a folder as `index.html`, run
  `vercel --prod`.
- Netlify drop: drag the folder onto app.netlify.com/drop.
- GitHub Pages: push `index.html` to a repo, enable Pages.

## If deploying via the Cowork Vercel tool

The tool is `deploy_to_vercel(files, name, target, teamId)`. Provide the file as
`{ file:'index.html', data:<full HTML> }` and optionally `{ file:'vercel.json',
data:'{"cleanUrls":true}' }`. The HTML is ~110KB; when driving this from Claude, hand the
file read + tool call to a subagent so the large payload stays out of the main context (the
main agent cannot easily re-emit 110KB inline). Use `target:'production'` for a stable URL.

## Rename note

If the project should be branded "DormView", rename the deliverable to `index.html` at
deploy time (the source file is `cmu-etower-double-3d.html`). The in-app product name on the
landing page is already "DormView".
