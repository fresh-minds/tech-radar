# Monthly technology research

The **Monthly Tech Radar Scan** workflow runs on GitHub-hosted runners on the
first day of every month at **09:00 Europe/Amsterdam**, including daylight saving
changes. It runs with the computer off and the Codex app closed. Each run covers
the previous completed calendar month across Software Engineering, AI, Cloud,
Data, Security, and Global.

The workflow uses the OpenAI Responses API with live web search. A second,
structured response turns the research into proposals. Ordinary JavaScript
validates those proposals before editing radar data. The model receives neither
GitHub credentials nor shell tools.

## Activation

1. Merge the setup PR into the repository's default branch after owner review.
2. Add an Actions repository secret named `OPENAI_API_KEY` with access to the
   Responses API, web search, and the selected model. OpenAI API usage is billed
   to that key's project; a desktop Codex subscription does not supply this key.
3. In **Settings → Actions → General → Workflow permissions**, enable **Allow
   GitHub Actions to create and approve pull requests**. This permits PR creation;
   the workflow does not approve or merge PRs. Organization policy may also need
   to allow this setting.
4. Open **Actions → Monthly Tech Radar Scan → Run workflow** and run on the
   default branch to verify credentials. An optional `month` input accepts a
   completed month in `YYYY-MM` format, allowing backfills. Empty means the
   previous completed month.
5. Confirm the former Codex automation named **Monthly FreshMinds tech radar scan**
   is disabled so there is only one scheduler. Its status is managed in Codex,
   separately from the repository.

The default model is `gpt-6.1-sol`. Set the optional repository variable
`RADAR_SCAN_MODEL` to another Responses model supporting web search, structured
outputs, and medium reasoning if needed. No personal GitHub token is required:
publishing uses a short-lived `GITHUB_TOKEN` scoped to the publishing job.

## Proposals and review

Research focuses on official releases, support/deprecation notices, security
advisories, and relevant emerging technologies. Each change needs a dated primary
source from the research window that was actually returned by web search, and a
clear explanation of its relevance to FreshMinds. The complete research and
proposal artifacts remain available from the Actions run for 90 days.

Supported edits are additions in **Assess**, updates that retain an entry's ring,
and evidence-backed moves to **Hold**. Trial/Adopt promotions and removals remain
owner questions, because public research cannot establish FreshMinds production
experience. The automation preserves the edition dates, unchanged movement
flags, and any draft/scaffold status. Global is considered separately from the
unit radars. Monthly research does not change the semi-annual publication policy.

With material supported changes, the publishing job checks that the default
branch has not changed during research, validates all radar files again, and
creates a PR from `codex/tech-radar-scan-YYYY-MM`. The PR includes a dated report
in `docs/research/`, source links, reasoning, and owner questions. It never merges
or publishes automatically. If the default branch moved, rerun against the latest
data. A repeat run for a month with an existing open, closed, or merged PR skips
research and preserves that PR's review history and any reviewer edits.

When nothing material is warranted, the run retains its research artifacts and
creates no empty, date-only, or report-only PR. API, evidence, schema, or data
validation failures fail the run without opening a proposal. The research job has
read-only GitHub access; only the separate deterministic publisher can write.

GitHub may require a write collaborator to select **Approve workflows to run**
before CI starts on a PR created with `GITHUB_TOKEN`. The scan has already run
data validation; reviewers should also let the normal PR checks complete.

## Local checks and troubleshooting

```sh
npm test
npm run validate
```

The scanner's `--proposal` and `--research` fixture options allow offline checks
against saved proposal JSON and raw Responses research JSON. Use `--dry-run` to
validate a proposal without editing radar files. Fixture and dry-run artifacts
cannot be published by the workflow.

Check the Actions run logs and artifacts when research or publishing fails. A
missing key, model access restriction, exhausted API budget, or disabled Actions
PR permission requires a repository administrator to resolve it and rerun.
If a branch was pushed but PR creation failed, fix permissions and open the PR
from that branch; the workflow will not force-push over an existing branch.

GitHub schedules can be delayed. For public repositories, GitHub disables
scheduled workflows after 60 days without repository activity; re-enable the
workflow in Actions if this occurs. Review the run history periodically.

References: [GitHub schedules](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#schedule),
[GitHub token workflow behavior](https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/trigger-a-workflow#triggering-a-workflow-from-a-workflow),
[OpenAI web search](https://developers.openai.com/api/docs/guides/tools-web-search).
