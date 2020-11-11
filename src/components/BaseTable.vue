<template>
  <table>
    <thead>
      <slot name="head"></slot>
    </thead>
    <tbody>
      <slot name="body"></slot>
    </tbody>
    <tfoot>
      <slot name="foot"></slot>
    </tfoot>
  </table>
</template>

<script>
import Util from '../classes/Util.js'

// NOTES
// the table element is important for assisted users
// freezing the headers is important for sighted users
// position sticky sucks because it only works for cells, not the whole thead
// there are a few options, increasing in quality and implementation difficulty:
//  1. static table with no frozen headers, user must scroll a lot   <-- do it this way for now
//  2. css only but hard code row offsets, scrunches weird when it reaches bottom 
//  3. dynamically change css with js scroll detection, complex and might be laggy

export default {
  name: 'BaseTable',
  props: {

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
  table {
    border-spacing: 0;
    background-color: var(--color-table-back);
  }
</style>