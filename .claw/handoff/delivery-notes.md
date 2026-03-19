# Delivery Notes

This folder tracks delivery artifacts for the Fomos News project.

## Current status
Project setup and documentation governance initialized. No application code has been changed yet.

## Resume protocol
1. Read `.claw/plans/implementation-plan.md`
2. Read `.claw/worklog/progress.md`
3. Read `.claw/tasks/task-board.md`
4. Inspect latest git commits and working tree
5. Continue only the current phase's unfinished tasks

## Confirmed integration ownership
- Another OpenClaw instance is responsible for composing and writing daily briefing payloads.
- This project backend should store and serve briefing data, not generate briefing content automatically in v1.
- Integration docs and future implementation must preserve this separation.
