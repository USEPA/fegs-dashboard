<template>
  <th
    :style="colorBack ? {
      backgroundColor: `${colorBack}`,
    } : {}"
    :class="{
      space: isSpace,
      emphasis: isEmphasis,
      vert: barVert,
      horz: barHorz,
      mydark: darken,
      nodark: darken === false, // explicit false, not null
    }"
    :rowspan="rowspan"
    :colspan="colspan"
    :aria-hidden="isEmphasis || isSpace"
    
  >
    <slot></slot>
  </th>
</template>

<script>

export default {
  name: 'BaseTableCellHead',
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
    barVert: Boolean, // skinny vertical cell
    barHorz: Boolean, // skinny horizontal cell
    isSpace: Boolean, // invisible spacing cell
    isEmphasis: Boolean, // no content color cell
    darken: {
      type: Boolean, // override row setting
      default: null,
    }
  },
}
</script>

<style scoped>
  thead tr:first-child th:not(.space):not(.emphasis) {
    border-top: 1px solid var(--color-table-border)
  }
  thead th {
    vertical-align: bottom;
  }
  tbody th {
    font-weight: normal;
  }
  th {
    margin: 1px;
    padding: .5rem;
    position: relative;
    text-align: left;
    font-weight: bold;
    background-blend-mode: multiply;
    background-color: var(--color-table-head-back);
  }
  thead th {
    border-bottom: 1px solid var(--color-table-border);
  }
  th:last-child:not(.emphasis) {
    border-right: 1px solid var(--color-table-border);
  }
  tr.darken th:not(.nodark),
  tr th.mydark {
    background-image: linear-gradient(90deg, var(--color-table-body-back-darken), var(--color-table-body-back-darken))
  }
  th.space {
    background: none;
    border-top: none;
    border-right: none;
  }
  th.emphasis {
    padding: 0;
    border: none;
  }
  th.vert {
    padding: 0 0 0 var(--length-primary);
  }
  th.horz {
    padding: 0 0 var(--length-primary) 0;
  }
</style>