<template>
  <li>
    <a :href="to" :class="{disabled:!isReady, error:isError, focused:isFocus}">
      {{ title }}
      <FontAwesomeLayers class="icon-group">
        <FontAwesomeIcon v-if="showIconBack" class="icon-back" icon="circle"/>
        <FontAwesomeIcon class="icon" :icon="icon"/>
      </FontAwesomeLayers>
    </a>
  </li>
</template>

<script>

import Util from '../classes/Util.js'
import { project } from '../store.js'

// TODO various states?
export default {
  name: 'NavItem',
  components: {

  },
  props: {
    to: String,
    title: String,
    isFocus: {
      type: Boolean,
      default: false,
    },
    isError: {
      type: Boolean,
      default: false,
    },
    isReady: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {

    }
  },
  computed: {
    icon() {
      if (this.isError) return 'exclamation-circle'
      return ['far', 'circle']
    },
    showIconBack() {
      return this.isError
    }
  },
  methods: {

  },
}
</script>

<style scoped>
  li {
    margin: 0;
    padding: 0;
  }
  a {
    padding: .8rem 1rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-weight: bold;
    text-decoration: none;
    color: var(--color-text-white);
    transition: all .5s;
  }
  a:hover,
  a:focus {
    background-color: #FFF2;
    outline: none;
  }
  a.focused {
    background-color: #FFF3;
  }
  a.disabled {
    color: var(--color-text-disabled2);
  }
  a.error .icon {
    color: var(--color-invalid-icon);
  }
  .icon-group {
    margin-left: .5rem;
    visibility: hidden;
    font-size: 1.2em;
    color: inherit;
  }
  a.error .icon-group {
    visibility: visible;
  }
  .icon-back {
    transform: scale(.9);
  }
</style>
