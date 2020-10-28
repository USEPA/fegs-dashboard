<template>
  <div style="display: flex; align-items: center;">
    <BaseField placeholder="Criterion" v-on:change="onCriterion"/>
    <BaseField type="number" placeholder="Weight" v-on:change="onWeight"/>
    <BaseButtonIcon v-if="isValidCriterion" color="success" icon="check" v-on:click="onApply"/>
  </div>
</template>


<script>
import BaseField from './BaseField.vue'
import BaseButtonIcon from './BaseButtonIcon.vue'

import Util from '../classes/Util.js'
import { project, valid } from '../store.js'

export default {
  name: 'SectionCriterion',
  components: {
    BaseField,
    BaseButtonIcon,
  },
  data() {
    return {
      criterion: null,
      weight: null,
    }
  },
  computed: {
    isValidCriterion() {
      return this.criterion in project.data.criterionSection.criteria && valid.percent(this.weight)
    }
  },
  methods: {
    onCriterion(event) {
      this.criterion = event
    },
    onWeight(event) {
      this.weight = event
    },
    onApply(event) {
      project.setCriterionResult(this.criterion, this.weight/100)
    }
  },
}
</script>

<style scoped>

</style>