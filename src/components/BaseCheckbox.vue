<template>
  <div
    class="container"
    :class="{ checked: switchChecked}"
    :disabled="isDisabled"
    @click.prevent="onClick"
  >
    <input
      ref="input"
      type="checkbox"
      :id="id"
      :disabled="isDisabled"
    >
    <div class="checkbox">
      <FontAwesomeIcon icon="check"/>
    </div>
    <label
      v-if="label"
      :for="id"
    >
      {{ label }}
    </label>
  </div>
</template>

<script>
import Util from '../classes/Util.js'
import { uid } from '../store.js'

export default {
  name: 'BaseCheckbox',
  props: {
    isChecked: {
      type: Boolean,
      default: false,
    },
    isDisabled: {
      type: Boolean,
      default: false,
    },
    label: String,
    isWrapped: { // whether this component's value is managed externally
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      localChecked: this.isChecked,
      id: uid.next(),
    }
  },
  computed: {
    switchChecked() {
      return (this.isWrapped) ? this.isChecked : this.localChecked
    },
  },
  methods: {
    onClick(event) {
      if (!this.isDisabled) {
        if (!this.isWrapped) this.localChecked = !this.localChecked
        this.$emit('click', !this.switchChecked)
        this.$refs.input.focus() // keyboard uses underlying element
      }
    },
  },
}
</script>

<style scoped>
/* Container */
.container {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: 1em;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}
.container[disabled] {
  cursor: default;
}

/* Hide default checkbox */
input {
  width: 0;
  height: 0;
  position: absolute;
  opacity: 0;
  cursor: inherit;
}

/* Label */
label {
  cursor: inherit;
}
.container[disabled] label {
  color: var(--color-text-disabled);
}

/* Unchecked checkbox */
.checkbox {
  width: 18px;
  height: 18px;
  margin: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  font-size: 14px;
  cursor: inherit;
  color: var(--color-text-white);
  border: 1px solid var(--color-input);
  border-radius: 4px;
  transition: all .2s;
}
.container:hover .checkbox,
.container input:focus ~ .checkbox {
  border-color: var(--color-input-hover);
}
.container:active .checkbox {
  border-color: var(--color-input-active);
}
.container[disabled] .checkbox,
.container[disabled]:hover .checkbox,
.container[disabled] input:focus ~ .checkbox,
.container[disabled]:active .checkbox {
  background-color:var(--color-input-back-disabled);
  border-color: var(--color-input-disabled);
}

/* Checked checkbox */
.container.checked .checkbox {
  background-color: var(--color-primary);
  border-color: var(--color-primary);
}
.container.checked:hover .checkbox,
.container.checked input:focus ~ .checkbox {
  background-color: var(--color-primary-hover);
  border-color: var(--color-primary-hover);
}
.container.checked:active .checkbox {
  background-color: var(--color-primary-active);
  border-color: var(--color-primary-active);
}
.container.checked[disabled] .checkbox,
.container.checked[disabled]:hover .checkbox,
.container.checked[disabled] input:focus ~ .checkbox,
.container.checked[disabled]:active .checkbox {
  background-color:var(--color-input-disabled);
  border-color:var(--color-input-disabled);
}

/* Show/hide check mark */
.container .checkbox * {
  display: none;
  cursor: inherit;
}
.container.checked .checkbox * {
  display: block;
}
</style>