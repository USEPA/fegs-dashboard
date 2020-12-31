<template>
  <section :class="{disabled:!isReady}">
    <slot v-if="isReady"></slot>
    <div v-else>
      <h2>{{ title }}</h2>
      <p class="msg">Enter data in the {{ prevSection.toLowerCase() }} section first.</p>
    </div>
  </section>
</template>

<script>
import Util from '../classes/Util.js'

export default {
  name: 'BaseSection',
  props: {
    title: String, // shown when isReady=false
    prevSection: {
      type: String,
      default: 'previous',
    },
    isReady: {
      type: Boolean,
      default: true,
    },
  },
}
</script>

<style scoped>
  section {
    padding: 1rem var(--length-primary) 2rem var(--length-primary);
    background-color: var(--color-section);
  }
  section:not(:last-child) {
    border-bottom: 1px solid var(--color-section-border);
  }
  section.disabled h2 {
    color: var(--color-text-disabled-big);
  }
  section.disabled p {
    color: var(--color-text-disabled);
  }
  .msg {
    font-style: italic;
  }
</style>

<style>
  section h2 {
    margin: 0 0 .5em 0;
  }
  div.full {
    margin: 0 calc(-1 * var(--length-primary));
    display: block;
    overflow-x: auto;
    overflow-y: hidden; /* necessary for some reason */
  }
</style>
