<script lang="ts">
  import type { linkKinds } from '@/content/model'

  let { kind }: { kind: (typeof linkKinds)[number] } = $props()

  // Full class names so UnoCSS finds them when it scans this file.
  const icons = {
    email: 'i-ph-envelope-simple',
    github: 'i-ph-github-logo',
    linkedin: 'i-ph-linkedin-logo',
    facebook: 'i-ph-facebook-logo',
    instagram: 'i-ph-instagram-logo',
    youtube: 'i-ph-youtube-logo',
    website: 'i-ph-globe-simple',
  } satisfies Record<(typeof linkKinds)[number], string>
</script>

<span class="{icons[kind]} shrink-0" aria-hidden="true"></span>
