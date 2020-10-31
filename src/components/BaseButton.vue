<template>
  <button :style="styleObj" v-on:click="$emit('click')">
    <slot></slot>
  </button>
</template>

<script>
export default {
  name: 'BaseButton',
  props: {
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
  button {
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
  button:hover,
  button:focus {
    background-color: var(--color-button-hover);
  }
  button:active {
    background-color: var(--color-button-active);
  }
</style>