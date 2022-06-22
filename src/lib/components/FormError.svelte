<script lang="ts">
  export let errorMsg = ''
</script>

{#if errorMsg}
  <p class="error">{errorMsg}</p>
{/if}

<style>
  .error {
    color: var(--error-red);
  }
</style>