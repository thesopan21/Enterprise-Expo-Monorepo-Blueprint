---
name: commit-message-for-staged
description: Draft a commit message for the currently staged (git add'ed) changes, matching this repo's existing commit style
argument-hint: "[optional context, e.g. a ticket ref or reason for the change]"
allowed-tools: [Bash(git status:*), Bash(git diff:*), Bash(git log:*)]
---

# Commit Message for Staged Changes

Draft a commit message for whatever is currently staged (`git diff --staged`). This only drafts the message — it does not create the commit unless the user explicitly asks for that afterwards.

## Steps

1. Run in parallel:
   - `git status --porcelain=v1`
   - `git diff --staged`
   - `git log --oneline -10`
2. If `git diff --staged` is empty, tell the user nothing is staged and stop. Suggest `git add <files>`, or point them at `/commit-message-for-untracked` if the change they mean is still untracked.
3. Scan the staged diff for anything that looks like a secret (API key, token, password, connection string, private key block, `.env` value). If found:
   - Do not repeat the secret value back in any output.
   - Warn the user to rotate the credential and remove/redact it before committing, per org data-protection policy.
4. Use the last ~10 subjects from `git log --oneline` to match the repo's existing style — short imperative subject line, sentence case, no conventional-commit prefixes (`feat:`, `fix:`, etc.) unless the log already uses them.
5. Draft the message:
   - **Subject**: imperative mood ("Add", "Fix", "Update", not "Added"/"Fixes"), ≤ 70 chars, no trailing period, states *what* changed.
   - **Body** (only if the change isn't self-evident from the subject): 1-3 bullets/sentences on *why*, not a restatement of the diff line-by-line.
   - If `$ARGUMENTS` is non-empty, treat it as extra context (ticket reference, reason) and fold it in naturally.
6. Present the draft in a fenced code block, plus a one-line note on which files it covers.
7. Ask whether the user wants it committed. Only run `git commit` if they explicitly confirm — never commit automatically. When you do commit, end the message with:
   ```
   Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
   ```

## Notes

- Never invent changes that aren't actually in the diff.
- If the staged diff mixes clearly unrelated concerns (e.g. a dependency bump alongside a feature), say so and suggest splitting into separate commits before drafting a single message.
