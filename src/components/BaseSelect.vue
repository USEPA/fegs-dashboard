<template>
  <div class="wrap">
    <label
      v-if="label"
      :for="id"
    >
      {{ label }}
    </label>
    <select
      @change="$emit('commit', $event.target.value)"
      :id="id"
    >
      <option 
        v-for="option in options"
        :key="option"
        :value="option"
        :selected="option === localDefaultOption"
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
    label: {
      type: String,
      default: '',
    },
    options: Array,
    defaultOption: '',
  },
  data() {
    return {
      localDefaultOption: this.defaultOption || this.options[0],
      id: uid.next(),
    }
  },
  computed: {

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
    height: 1.75rem;
    font-size: .9rem; /* appears to be 1rem... no idea why */
    border: 1px solid var(--color-input);
    border-radius: 4px;
    outline: none;
  }
  select:hover {
    border-color: var(--color-input-hover);
  }
  select:active,
  select:focus {
    border-color: var(--color-input-active);
  }
  option {
    outline: none;
  }
</style>