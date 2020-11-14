<template>
  <button
    @click="isDisabled ? null : $emit('click')"
    :class="{ disabled: isDisabled }"
    :style="styleObj"
  >
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
          'neutral',
          'success',
          'danger',
        ].includes(val)
      },
    },
    isDisabled: Boolean,
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
    transition: all .3s;
  }
  button:hover,
  button:focus {
    background-color: var(--color-button-hover);
  }
  button:active {
    background-color: var(--color-button-active);
  }
  button.disabled,
  button.disabled:hover,
  button.disabled:focus,
  button.disabled:active {
    cursor: initial;
    color: var(--color-text-disabled);
    background-color: var(--color-input-back-disabled);
  }
</style>