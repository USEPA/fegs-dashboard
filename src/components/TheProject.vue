<template>
  <div id="project">
    <BaseSection title="Project">
      <div>[ project section content ]</div>
    </BaseSection>
    <BaseSection title="Weights">
      <div>[ weight section content ]</div>
    </BaseSection>
    <BaseSection title="Stakeholders" prevSection="weights" :isShown="hasWeights">
      <div>[ stakeholder section content ]</div>
    </BaseSection>
    <BaseSection title="Beneficiaries" prevSection="stakeholders" :isShown="hasStakeholders">
      <div>[ beneficiary section content ]</div>
    </BaseSection>
    <BaseSection title="Attributes" prevSection="beneficiaries" :isShown="hasBeneficiaries">
      <div>[ attribute section content ]</div>
    </BaseSection>
    <BaseSection title="Developer">
      <DeveloperSection/>
    </BaseSection>
    
  </div>
</template>

<script>
import DeveloperSection from './DeveloperSection.vue'
import BaseSection from './BaseSection.vue'

import Util from '../classes/Util.js'
import { project } from '../store.js'

export default {
  name: 'TheProject',
  components: {
    DeveloperSection,
    BaseSection,
  },
  // data() {
  //   return {

  //   }
  // },
  computed: {
    hasWeights() {
      return !Object.values(project.data.criterionSection.criteria).every(criterion => {
        return (criterion.result === null)
      })
    },
    hasStakeholders() {
      return (Object.keys(project.data.stakeholderSection.stakeholders).length > 0)
    },
    hasBeneficiaries() {
      return !Object.values(project.data.beneficiarySection.beneficiaries).every(beneficiary => {
        return Object.values(beneficiary.scores).every(score => score === null)
      })
    },
  },
  // methods: {

  // },
}
</script>

<style>

</style>
