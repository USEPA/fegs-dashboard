<template>
  <tr :class="{ darken: darken }">
    <BaseTableCellHead
      :barVert="true"
      :isEmphasis="doEmphasis"
      :isSpace="!doEmphasis"
      :colorBack="colorEmphasis"
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
  tr th {
    background-color: var(--color-table-head-back);
  }
  tr.darken th {
    background-color: var(--color-table-head-back-darken);
  }
  tr th.lvl2 {
    background-color: var(--color-table-head2-back);
  }
  tr.darken th.lvl2 {
    background-color: var(--color-table-head2-back-darken);
  }
  tr td {
    background-color: var(--color-table-body-back);
  }
  tr.darken td {
    background-color: var(--color-table-body-back-darken);
  }
  td {
    margin: 1px;
    padding: .5rem;
    border-bottom: 1px solid var(--color-table-border);
  }
  td:last-child {
    border-right: 1px solid var(--color-table-border);
  }
</style>