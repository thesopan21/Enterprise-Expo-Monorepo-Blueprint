---
name: commit-message-for-untracked
description: Draft a commit message for untracked (new, never-staged) files, without staging or committing them automatically
argument-hint: "[optional context, e.g. a ticket ref or reason for the change]"
allowed-tools: [Bash(git status:*), Bash(git diff:*), Bash(git log:*), Read]
---

# Commit Message for Untracked Files

Draft a commit message describing brand-new files git doesn't track yet (the `??` entries in `git status --porcelain`). Use this when the relevant work hasn't been `git add`ed at all — for already-staged changes use `/commit-message-for-staged` instead.

## Steps

1. Run `git status --porcelain=v1` and extract every line starting with `??` — these are the untracked paths.
2. If there are none, tell the user there are no untracked files and stop. Point them at `/commit-message-for-staged` if they meant changes that are already staged.
3. For each untracked path (or a representative sample if there are many):
   - For text files, run `git diff --no-index -- /dev/null <path>` to view it as a "new file" diff without touching the index.
   - For binaries or very large files, just note the path and file type instead of dumping contents.
4. Scan the content for secrets (API keys, tokens, passwords, private keys, `.env` values, connection strings). If found:
   - Do not repeat the secret value back in any output.
   - Warn the user to keep the file out of git (add it to `.gitignore`) and rotate any real credential.
5. Check `git log --oneline -10` to match the repo's existing commit style — short imperative subject, sentence case, no conventional-commit prefixes unless the log already uses them.
6. Draft the message:
   - **Subject**: imperative mood, ≤ 70 chars, describing what the new file(s) add.
   - **Body** (if there are several unrelated new files/features): bullet list grouping them logically.
   - If `$ARGUMENTS` is non-empty, fold it in as extra context (ticket reference, reason).
7. Present the draft in a fenced code block along with the list of untracked paths it covers.
8. Ask whether the user wants these staged and committed. Never run `git add` or `git commit` without explicit confirmation, and never use a blanket `git add -A`/`git add .` — stage exactly the files discussed. When you do commit, end the message with:
   ```
   Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
   ```

## Notes

- If an untracked file looks like it belongs in `.gitignore` (build output, `node_modules`, `.env`, local config), flag that instead of drafting a message for it.
- Keep the message scoped to the untracked files only — don't fold in unrelated modified/staged changes; suggest `/commit-message-for-staged` for those.
