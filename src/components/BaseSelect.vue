<template>
  <div class="wrap">
    <label
      v-if="label"
      :for="id"
    >
      {{ label }}
    </label>
    <select
      @change="onChange"
      :id="id"
    >
      <option 
        v-for="option in options"
        :key="option"
        :value="option"
        :selected="option === switchValue"
      >
        {{ option }}
      </option>
    </select>
  </div>
</template>

<script>
import { uid } from '../store.js'

export default {
  name: 'BaseSelect',
  props: {
    value: String, // only needed if wrapped
    options: Array,
    label: {
      type: String,
      default: '',
    },
    isWrapped: { // whether this component's value is managed externally
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      localValue: this.value || this.options[0],
      id: uid.next(),
    }
  },
  computed: {
    switchValue() {
      return (this.isWrapped) ? this.value : this.localValue
    },
  },
  methods: {
    onChange(event) {
      if (!this.isWrapped) this.localValue = event.target.value
      this.$emit('change', event.target.value)
    },
  },
}
</script>

<style scoped>
  .wrap {
    display: flex;
    flex-flow: column;
  }
  label {
    margin-bottom: .5rem;
  }
  select {
    min-width: 8rem;
    padding: .2em .3em;
    border: 1px solid var(--color-input);
    border-radius: 4px;
    outline: none;
  }
  select:hover {
    border-color: var(--color-input-hover);
  }
  select:active,
  select:focus {
    border-width: var(--length-input-active);
    border-color: var(--color-input-active);
  }
  option {
    outline: none;
  }
</style>