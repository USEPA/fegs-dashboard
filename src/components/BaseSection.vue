<template>
  <section :class="{disabled:!isReady}">
    <h2>{{ title }}</h2>
    <slot v-if="isReady"></slot>
    <div v-else>
      <div class="msg">Enter data in the {{ prevSection.toLowerCase() }} section first.</div>
    </div>
  </section>
</template>

<script>
import Util from '../classes/Util.js'

export default {
  name: 'BaseSection',
  props: {
    title: {
      type: String,
      required: true,
    },
    prevSection: {
      type: String,
      default: 'previous',
    },
    isReady: {
      type: Boolean,
      default: true,
    }
  },
}
</script>

<style scoped>
  section {
    padding: var(--length-primary);
    padding-bottom: 2rem;
    background-color: #FFF;
  }
  section:not(:last-child) {
    margin-bottom: 1px;
  }
  h2 {
    margin: 0 0 .5em 0;
  }
  section.disabled h2,
  section.disabled div {
    color: #888;
  }
  .msg {
    font-style: italic;
  }
</style>

<style>
  div.full {
    margin: 0 calc(-1 * var(--length-primary));
    overflow: auto;
  }
</style>
