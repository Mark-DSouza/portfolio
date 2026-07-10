---
title: 'LifeOS — The Life Ledger'
description: 'A personal life-tracking dashboard covering fitness, meals, sleep, and goals — prototyped with Lovable, then engineered into a typed, auth-guarded TanStack Start app on Cloudflare Workers.'
date: 2026-05-14
tags: ['tanstack-start', 'react', 'typescript', 'supabase', 'cloudflare']
status: 'in-progress'
featured: true
priority: 0
repoUrl: 'https://github.com/Mark-DSouza/the-life-ledger'
---

LifeOS is a personal dashboard for tracking a week of life in one place: fitness, meals, sleep, mental health, and goal boards for personal, career, and work areas — eight sections in total, modeled around a Monday-to-Sunday week.

## Origin: prototype first, engineer second

The project started as a [Lovable](https://lovable.dev) prototype — the fastest way to get a working UI shell in front of real daily use. From there it became a hands-on engineering project: a real authentication flow, a typed persistence layer, and a relational data model, deployed on Cloudflare Workers.

## Architecture

**Stack:** TanStack Start (SSR) with TanStack Router's file-based routing, React 19, Tailwind CSS v4, Supabase for auth and Postgres, deployed to Cloudflare Workers with Bun as the toolchain.

**Auth is enforced at both edges.** On the client, an `AuthProvider` context guards protected routes and redirects to login. On the server, every RPC call passes through a Supabase middleware that validates the bearer token before any handler runs — the browser-side session token is attached to all server-function calls automatically, so no endpoint can be called unauthenticated by accident.

**One persistence hook serves every feature.** Each section page uses a single `useUserData<T>(key, seed)` hook: it loads the user's data through a server function on mount, falls back to seed data until the load resolves, and debounces writes back to Supabase 400 ms after any change. Every write is validated against a per-section Zod schema before it touches the database.

**The data model is weekly and relational.** Each section has a parent "days" table (one row per user × weekday) with position-ordered child tables — lifts and cardio under fitness days, entries under meal days, interruptions under sleep days. Goal boards share a single `life_goals`/`life_tasks` pair filtered by area.

## Status

In progress. Planned next: a test suite (the repo currently has none) and migrating the persistence layer to a dedicated Java/Spring Boot backend.
