<template>
  <tr :class="{ darken: darken }">
    <BaseTableCellHead
      :barVert="true"
      :isEmphasis="doEmphasis"
      :isSpace="!doEmphasis"
      :colorBack="colorEmphasis"
      :noDarken="true"
    />
    <slot></slot>
  </tr>
</template>

<script>
import BaseTableCellHead from './BaseTableCellHead.vue'

import Util from '../classes/Util.js'

export default {
  name: 'BaseTableRow',
  components: {
    BaseTableCellHead,
  },
  props: {
    doEmphasis: {
      type: Boolean,
      default: true,
    },
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
  tr td {
    background-color: var(--color-table-body-back);
  }
  tr.darken td {
    background-color: var(--color-table-body-back-darken);
  }
  td {
    margin: 1px;
    padding: .5rem;
  }
  td:last-child {
    border-right: 1px solid var(--color-table-border);
  }
</style>