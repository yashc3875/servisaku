// Entry point — boots one of the two apps depending on the build target.
// VITE_APP is a compile-time literal (set per build mode), so the unused
// branch is dead-code-eliminated and never shipped in the other bundle.
if (import.meta.env.VITE_APP === 'partner') {
  import('@/apps/partner/index.jsx');
} else {
  import('@/apps/consumer/index.jsx');
}
