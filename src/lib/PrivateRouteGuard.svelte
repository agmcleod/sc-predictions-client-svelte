<script lang="ts">
  import { useNavigate, useLocation } from 'svelte-navigator'
  import { auth, tokenData } from './stores/auth'

  const navigate = useNavigate()

  $: if (!$auth || !$tokenData || $tokenData.exp < Date.now() / 1000) {
    auth.set('')
    navigate('/', {
      replace: true,
    })
  }
</script>

{#if $auth}
  <slot />
{/if}
