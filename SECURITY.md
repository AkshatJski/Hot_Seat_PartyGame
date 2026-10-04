# Security Policy

## Scope

**Truth or Swipe is a static, client-only page with no backend.** There is no
server, no database, no accounts, no authentication, and no network calls. The
data flow is:

```
you type player names → React state → localStorage on your own device
```

Nothing is transmitted anywhere. There is no endpoint to attack, because there is
no endpoint.

## Supported versions

Only the latest released version is supported.

| Version | Supported |
| --- | --- |
| `v1.x` (current) | ✅ |
| anything older | ❌ |

## What a "vulnerability" means here

Given the above, realistic reports are narrow. In scope:

- **Cross-site scripting.** Any way to inject attacker-controlled content into
  the page. Notably: if a player name, question, dare, or anything read back from
  `localStorage` is rendered as unescaped HTML. Player names are the highest-risk
  input, since they're the only free-text field.
- **Content injection via stored state.** Tampering with `localStorage` to make
  the app render arbitrary HTML or markup that escapes its container.
- **Dependency compromise** that executes at build time or ships malicious code
  in the bundle.
- **Privacy.** Any accidental transmission of player names, scores, or content
  to a third party. There should be zero network requests after the page loads.

## Explicitly not vulnerabilities

- **Editing your own scores in `localStorage`.** Scores are client-side by design.
  The worst anyone can do is lie on their own phone.
- **Editing questions/dares in `localStorage`.** Same.
- **The 18+ blur marker being bypassable.** It is a courtesy to players sharing a
  device, not access control. It is not DRM and does not claim to be.
- **The app having no authentication.** By design — it's a party game for people
  standing in the same room.
- **Content you find offensive.** That's a content discussion, not a security
  report: open an issue and say which card and why.

## Reporting

**Do not open a public issue.** Use GitHub's private vulnerability reporting
("Security" → "Report a vulnerability") on this repository.

Include:

- What you did, step by step
- What you expected, and what happened
- The vector: a specific card id, a `localStorage` payload, a dependency and version
- Whether this is theoretical or you actually demonstrated it

Expected response: acknowledgement within a few days, and a fix or an explanation
of why it isn't a bug. I'm one person maintaining this, so "a few days" is
honest rather than a promise.

## Hardening notes for anyone self-hosting

If you fork this, these are the things worth knowing:

- The app renders all player-provided text as React children, so it is escaped by
  default. Keep it that way — don't reach for `dangerouslySetInnerHTML`.
- Serve over **HTTPS**. `navigator.vibrate` (haptics) is blocked on plain HTTP
  on Android, and installing a PWA requires a secure context outside `localhost`.
- `localStorage` is not encrypted. Don't put anything in it you wouldn't want
  someone who picks up your unlocked phone to read. Player names qualify.