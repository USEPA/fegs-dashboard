<template>
  <tr :class="{ darken: darken, last: isLastOfGroup }">
    <BaseTableCellEmphasis
      v-if="doEmphasis"
      :colorBack="colorEmphasis"
      :doBorder="doEmphasisBorder"
    />
    <slot></slot>
  </tr>
</template>

<script>
import BaseTableCellEmphasis from './BaseTableCellEmphasis.vue'

import Util from '../classes/Util.js'

// TODO option to have thicker border after cell... but not by adding a prop to every single cell component

export default {
  name: 'BaseTableRow',
  components: {
    BaseTableCellEmphasis,
  },
  props: {
    doEmphasis: {
      type: Boolean,
      default: true,
    },
    doEmphasisBorder: Boolean, // whether to draw cell border on emphasis bar
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
  td {
    margin: 1px;
    padding: .5rem;
  }
  tr td {
    background-color: var(--color-table-body-back);
    border-bottom: var(--border-width) solid var(--color-table-border);
  }
  tr.darken td {
    background-color: var(--color-table-body-back-darken);
    border-bottom: var(--border-width) solid var(--color-table-border-darken);
  }
  td:last-child {
    border-right: 1px solid var(--color-table-border);
  }
</style>