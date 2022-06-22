<script lang="ts">
  const prefix = 'mdc-typography'

  interface ClassMapping {
    p: string
    h1: string
    h2: string
    h3: string
    h4: string
    h5: string
  }

  const classMapping: ClassMapping = {
    p: `${prefix}--body1`,
    h1: `${prefix}--headline1`,
    h2: `${prefix}--headline2`,
    h3: `${prefix}--headline3`,
    h4: `${prefix}--headline4`,
    h5: `${prefix}--headline5`,
  }

  export let variant: keyof ClassMapping = 'p'
</script>

<svelte:element class={classMapping[variant]} this={variant}>
  <slot></slot>
</svelte:element>
