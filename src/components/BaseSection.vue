<template>
  <section>
    <h2>{{ title }}</h2>
    <slot v-if="isShown"></slot>
    <div v-else>
      <div class="msg">Enter some data in the {{ prevSection }} section to continue.</div>
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
    isShown: {
      type: Boolean,
      default: true,
    }
  },
}
</script>

<style scoped>
  section {
    border-top: 1px solid var(--color-text-black);
    padding-bottom: 2rem;
  }
  h2 {
    margin: 1rem 0;
  }
  .msg {
    font-style: italic;
  }
</style>
