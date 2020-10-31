<template>
  <div style="display: flex; align-items: center;">
    <BaseSelect style="margin-right: .5rem;" :options="criteriaNames" v-on:commit="onCriterion"/>
    <FieldNumber placeholder="Weight" :value="weight" :triggerOverwrite="triggerOverwrite" v-on:commit="onWeight"/>
  </div>
</template>


<script>
import BaseField from './BaseField.vue'
import BaseSelect from './BaseSelect.vue'
import BaseButtonIcon from './BaseButtonIcon.vue'
import FieldNumber from './FieldNumber.vue'

import Util from '../classes/Util.js'
import { project } from '../store.js'

export default {
  name: 'SectionCriterion',
  components: {
    BaseField,
    BaseSelect,
    BaseButtonIcon,
    FieldNumber,
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