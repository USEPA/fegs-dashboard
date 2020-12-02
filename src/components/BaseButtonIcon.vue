<template>
  <button
    ref="btn"
    :style="styleObj"
    :title="hint"
    @click="onClick"
  >
    <FontAwesomeIcon
      :style="{
        position: 'relative',
        top: shiftY,
        left: shiftX,
      }"
      :icon="icon"
    />
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
          'neutral',
          'success',
          'danger',
        ].includes(val)
      },
    },
    hint: String,
    doBlurOnClick: {
      type: Boolean,
      default: false,
    },
    shiftX: {
      type: String,
      default: '0',
    },
    shiftY: {
      type: String,
      default: '0',
    },
  },
  computed: {
    styleObj() {
      return {
        '--color-button': `var(--color-${this.color})`,
        '--color-button-hover': `var(--color-${this.color}-hover)`,
        '--color-button-active': `var(--color-${this.color}-active)`,
        '--color-button-light': `var(--color-${this.color}-light)`,
      }
    }
  },
  methods: {
    onClick(event) {
      if (this.doBlurOnClick) this.$refs.btn.blur()
      this.$emit('click')
    }
  },
}
</script>

<style scoped>
  button {
    all: unset;
    width: 1.2em;
    height: 1.2em;
    padding: .2em;
    text-align: center;
    /* display: flex;
    align-items: center;
    justify-content: center; */
    cursor: pointer;
    color: var(--color-button);
    border-radius: 1em;
    transition: all .3s;
  }
  button * {
    cursor: pointer;
  }
  button:hover,
  button:focus {
    color: var(--color-button-hover);
    background-color: var(--color-button-light);
  }
  button:active {
    color: var(--color-button-active);
    background-color: var(--color-button-light);
  }
</style>