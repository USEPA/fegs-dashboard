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
  data() {
    return {
      criterion: Object.keys(project.data.criterionSection.criteria)[0],
      weight: Object.values(project.data.criterionSection.criteria)[0].result,
      triggerOverwrite: 0,
    }
  },
  computed: {
    criteriaNames() {
      return Object.keys(project.data.criterionSection.criteria)
    },
  },
  methods: {
    onCriterion(event) {
      this.criterion = event
      this.weight = project.data.criterionSection.criteria[event].result
      this.triggerOverwrite++
    },
    onWeight(event) {
      this.weight = event
      project.setCriterionResult(this.criterion, this.weight)
    },
  },
}
</script>

<style scoped>
  
</style>