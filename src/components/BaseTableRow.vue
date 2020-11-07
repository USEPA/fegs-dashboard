<template>
  <tr :class="{ darken: darken }">
    <th
      class="emphasis"
      :style="colorEmphasis ? { backgroundColor: `${colorEmphasis}` } : {}"
      :aria-hidden="true"
    ></th>
    <slot></slot>
  </tr>
</template>

<script>
import Util from '../classes/Util.js'

export default {
  name: 'BaseTableRow',
  props: {
    colorEmphasis: String,
    darken: Boolean,
  },
  data() {
    return {

    }
  },
  computed: {

  },
  methods: {

  }
}
</script>

<style scoped>
  tr th {
    background-color: var(--color-table-head-back);
  }
  tr.darken th {
    background-color: var(--color-table-head-back-darken);
  }
  tr td {
    background-color: var(--color-table-body-back);
  }
  tr.darken td {
    background-color: var(--color-table-body-back-darken);
  }
  th.emphasis {
    padding: 0 0 0 var(--length-primary);
    border: none;
  }
  thead th.emphasis {
    background-color: var(--color-table-head-emphasis);
  }
  th,
  td {
    margin: 1px;
    padding: .5rem;
    border-bottom: 1px solid var(--color-table-border);
    border-right: 1px solid var(--color-table-border);
  }
  thead tr:first-child th,
  thead tr:first-child td {
    border-top: 1px solid var(--color-table-border);
  }
</style>