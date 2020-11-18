<template>
  <th
    :style="{ backgroundColor: colorBack }"
    :class="{
      bord: !noBorder,
      last: isLastOfGroup,
      vert: !isHorz,
      horz: isHorz,
    }"
    :rowspan="rowspan"
    :colspan="colspan"
    :aria-hidden="true"
    
  >
    <slot></slot>
  </th>
</template>

<script>

export default {
  name: 'BaseTableCellEmphasis',
  props: {
    colorBack: String,
    rowspan: {
      type: Number,
      default: 1,
    },
    colspan: {
      type: Number,
      default: 1,
    },
    isHorz: Boolean, // horizontal bar rather than vertical
    isLastOfGroup: Boolean,
    noBorder: Boolean,
  },
}
</script>

<style scoped>
  th {
    margin: 1px;
    padding: 0;
    position: relative;
    text-align: left;
    font-weight: bold;
    background-blend-mode: multiply;
    background-color: var(--color-table-head1-back);
    border: none;
  }
  th.bord {
    border-bottom: 1px solid var(--color-table-border);
  }
  thead th.bord.last,
  tbody tr:not(:last-child) th.bord.last {
    border-bottom: 2px solid var(--color-table-border);
  }
  th.vert {
    padding: 0 0 0 var(--length-primary);
  }
  th.horz {
    padding: 0 0 var(--length-primary) 0;
  }  
</style>