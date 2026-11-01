<template>
  <div class="px-4 py-2 bg-muted/35 border-t border-default flex flex-wrap items-center justify-between gap-2">
    <div class="flex items-center gap-2 flex-wrap min-w-0">
      <slot name="left" />
      <slot />
    </div>

    <div class="flex items-center gap-2 flex-wrap shrink-0">
      <slot name="right" />
    </div>
  </div>
</template>
