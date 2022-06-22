import { render } from '@testing-library/svelte'
import type { SvelteComponent } from 'svelte'
import WrapRouter from './WrapRouter.svelte'

export const renderWithRouter = (
  component: typeof SvelteComponent,
  componentProps?: any,
  routerOptions?: any,
  options?: any
) =>
  render(WrapRouter, { component, componentProps, ...routerOptions }, options)
