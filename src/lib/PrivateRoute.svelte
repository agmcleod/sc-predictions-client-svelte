<script lang="ts">
  import { Route } from 'svelte-navigator'
  import PrivateRouteGuard from './PrivateRouteGuard.svelte'

  export let path
  export let component
</script>

<Route {path} let:params let:location let:navigate>
  <PrivateRouteGuard>
    {#if component}
      <svelte:component this={component} {params} {location} {navigate} />
    {/if}
    <slot {params} {location} {navigate} />
  </PrivateRouteGuard>
</Route>
