<template>
  <input type="button" :style="styleObj" v-on:click="$emit('click')" :value="content">
</template>

<script>
import Util from '../classes/Util.js'

export default {
  name: 'BaseButton',
  props: {
    content: String,
    color: {
      type: String,
      default: 'primary',
      validator(val) {
        return [
          'primary',
          'success',
          'danger',
        ].includes(val)
      },
    },
  },
  computed: {
    styleObj() {
      return {
        '--color-button': `var(--color-${this.color})`,
        '--color-button-hover': `var(--color-${this.color}-hover)`,
        '--color-button-active': `var(--color-${this.color}-active)`,
      }
    }
  }
}
</script>

<style scoped>
  input {
    all: unset;
    padding: .3em 1em;
    cursor: pointer;
    font-weight: bold;
    font-size: 1rem;
    color: var(--color-text-white);
    background-color: var(--color-button);
    border-radius: 4px;
    transition: all .2s;
  }
  input:hover,
  input:focus {
    background-color: var(--color-button-hover);
  }
  input:active {
    background-color: var(--color-button-active);
  }
</style>