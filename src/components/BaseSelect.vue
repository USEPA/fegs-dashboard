<template>
  <select v-on:change="$emit('commit', $event.target.value)">
    <option 
      v-for="option in options"
      :key="option"
      :value="option"
      :selected="option === localDefaultOption"
    >
      {{ option }}
    </option>
  </select>
</template>

<script>
export default {
  name: 'BaseSelect',
  props: {
    defaultOption: '',
    options: Array,
  },
  data() {
    return {
      localDefaultOption: this.defaultOption || this.options[0],
    }
  },
  computed: {

  }
}
</script>

<style scoped>
  select {
    min-width: 8rem;
    height: 1.5rem;
    font-size: .9rem; /* appears to be 1rem... no idea */
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