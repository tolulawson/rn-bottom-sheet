# ADR-0002: Support Arbitrary RN Children in Sheet Content

- Status: Accepted
- Date: 2026-02-12

## Context

A primary requirement is rendering arbitrary React Native views inside the native sheet.

## Decision

Implement native-presented sheet container that hosts RN children through the Nitro host boundary.

## Consequences

1. High flexibility for consumer content and composition.
2. Additional lifecycle complexity for attach/detach/recycle handling.
3. Requires robust cleanup to avoid stale view reuse artifacts.
