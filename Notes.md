# Notes

> Place where I write down quick notes about what I've learned so far

## Using OpenSpec

After installing the OpenSpec tool and configuring it for GitHub Copilot (using the free version right now), I can use the skills within the chat window. I installed it on a WSL instance, so I open the project with VS Code in it.

So far, the day-to-day loop seems to be:
- In a new chat, start the conversation with `/openspec-explore` to talk about a new feature / change (think : brainstorm)
- Once all the needed details are talked over in chat, use `/openspec-propose` to save them into artifacts
  - a new `proposal.md` with what will be added/modified (*read this first*)
  - a new `specs` folder with multiple files, detailing the expected behaviors to be implemented (*read this next*)
  - a new `design.md` that contains technical decisions needed to achieve during implementation, if any specified
- Review the generated artifacts and edit them if needed (either directly or through chat)
- In a new chat, start the implementation with `/openspec-apply-change`
  - Clean context window = focused on what's written, not compacted history 
- Test / adjust things as needed.
- When the feature is done, we can save the changes to the projects "spec" (specification) by using `/openspec-sync-specs`
- Once we are done with the feature / change, we can archive the artifacts (as in, move them to a separated folder) by using `/openspec-archive-change`
  - If we haven't synced the changes to the main `spec.md` by this point, it will prompt us to do it too

Still don't know how/when to use the last skill - `/openspec-update-change`

Favorite thing so far : Having the *main* `spec.md` file separated from the specific change's `spec.md`
  - internally, named as "delta spec", since it's just the difference between what we want and the current project's state