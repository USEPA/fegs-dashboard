<template>
  <div>
    <div class="full">
      <TableCriterion/>
    </div>
  </div>
</template>


<script>
import TableCriterion from './TableCriterion.vue'

import Util from '../classes/Util.js'
import { project } from '../store.js'

export default {
  name: 'SectionCriterion',
  components: {
    TableCriterion,
  },
  // data() {
  //   return {

  //   }
  // },
  // computed: {

  // },
  // methods: {

  // },
}
</script>

<style scoped>
  
</style>