<template>
  <button :style="styleObj" v-on:click="$emit('click')" >
    <FontAwesomeIcon :icon="icon"/>
  </button>
</template>

<script>
export default {
  name: 'BaseButtonIcon',
  props: {
    icon: {
      type: String,
      required: true,
    },
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
    width: 1.2em;
    height: 1.2em;
    padding: .2em;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: var(--color-button);
    transition: all .2s;
  }
  button:hover,
  button:focus {
    color: var(--color-button-hover);
  }
  button:active {
    color: var(--color-button-active);
  }
</style>