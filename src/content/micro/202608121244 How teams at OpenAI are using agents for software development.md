---
title: "How Teams at OpenAI Are Using Agents for Software Development"
slug: "how-teams-at-openai-are-using-agents-for-software-development"
created: 2026-08-12T12:44:00+03:00
updated: 2026-08-12T12:48:26+02:00
category: micro
tags: ["openai", "ai", "work"]
---
[Inside OpenAI’s Race to Reinvent Software Development for the Agent Era by Laura Entis](https://every.to/p/openai-infrastructure)

A few interesting things in this article including the art and visualisation.

> The first line of defense is continuous integration (CI), the automated checkpoint that tests new code before it merges into a shared codebase. Farther along is continuous deployment (CD), which ships approved code into production. Built in a pre-agentic world, both were designed for code written at a human pace. But as the cost of generating code falls toward zero and volume explodes, the number of changes waiting to be tested and merged will overwhelm the system. Problems CI fails to catch pass through CD into production, where failures become incidents.
> 
> The solution, in Venkataramani’s view, isn’t simply to expand the existing system’s capacity. “If you just scale the CI infra and the CD infra, you’re just going to have 100x more code going in every day,” he says. “And then what?” Scaling CI and CD moves more code through the system without making that code safer.
> 
> His solution resembles modern stormwater management. Instead of relying on a single downstream checkpoint, it filters for different problems at multiple points. “You add 10 such filters,” he says, “you’re going to eventually have clean water.”

About adding multiple filters or agents with skills that check for specific things.

And further on, about how the industry may look like in the future.

> As the models improve, Venkataramani expects code review to give way to prompt review, and then plan review. Engineers will no longer review lines of code and instead evaluate the intentions behind them, starting with specifications, and then architecture documents, and eventually the business problem itself. New coding environments might return only a high-level explanation of what the code does, he says. A complex project that today requires millions of lines of code could be expressed as a short set of instructions laying out what the system should do, with the model filling in the rest.
> 
> This, unsurprisingly, changes the job requirement. Instead of solid executors, you need people who can answer messy, ambiguous questions that don’t have clear-cut answers, like how to determine whether to fund a project or the best way to measure whether an initiative is paying off. OpenAI has long hired people who are “very entrepreneurial, very self-directed, who have their own opinion and really strong ownership,” Tang says, but these qualities have calcified into non-negotiables as the models absorb more of the operational work. “We only hire those people now.”

None of this was entirely new. But I always find it interesting when names and pictures are assigned to engineers and these were all infra people interviewed for this piece. So I could relate more.