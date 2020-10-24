<template>
  <div id="project">
    <nav>
      <ul>
        <NavItemFlow to="#project-section" title="Project"/>
        <NavItemFlow to="#weight-section" title="Weights"/>
        <NavItemFlow to="#stakeholder-section" title="Stakeholders"/>
        <NavItemFlow to="#beneficiary-section" title="Beneficiaries"/>
        <NavItemFlow to="#attribute-section" title="Attributes" :showArrow="false"/>
      </ul>
    </nav>
    <div id="content">
      <BaseSection id="project-section" title="Project">
        <div>[ project section content ]</div>
      </BaseSection>
      <BaseSection id="weight-section" title="Weights">
        <div>[ weight section content ]</div>
      </BaseSection>
      <BaseSection id="stakeholder-section" title="Stakeholders" prevSection="weights" :isShown="showStakeholders">
        <div>[ stakeholder section content ]</div>
      </BaseSection>
      <BaseSection id="beneficiary-section" title="Beneficiaries" prevSection="stakeholders" :isShown="showBeneficiaries">
        <div>[ beneficiary section content ]</div>
      </BaseSection>
      <BaseSection id="attribute-section" title="Attributes" prevSection="beneficiaries" :isShown="showAttributes">
        <div>[ attribute section content ]</div>
      </BaseSection>
      <BaseSection title="Developer">
        <DeveloperSection/>
      </BaseSection>
    </div>
  </div>
</template>

<script>
import NavItemFlow from './NavItemFlow.vue'
import DeveloperSection from './DeveloperSection.vue'
import BaseSection from './BaseSection.vue'

import Util from '../classes/Util.js'
import { project } from '../store.js'

// TODO page scroll nav state management
export default {
  name: 'TheProject',
  components: {
    NavItemFlow,
    DeveloperSection,
    BaseSection,
  },
  // data() {
  //   return {

  //   }
  // },
  computed: {
    showStakeholders() {
      return this.hasWeights()
    },
    showBeneficiaries() {
      return this.hasWeights() && this.hasStakeholders()
    },
    showAttributes() {
      return this.hasWeights() && this.hasStakeholders() && this.hasBeneficiaries()
    },
  },
  methods: {
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
}
</script>

<style>
  #project {
    display: flex;
    flex-flow: row;
    align-items: stretch;
  }
  #content {
    padding: 8px;
  }
  nav {
    white-space: nowrap;
    color: var(--color-text-white);
    background-color: #212121;
  }
  nav ul {
    margin: 0;
    padding: .8rem;
    position: -webkit-sticky;
    position: sticky;
    top: 0;
    list-style: none;
  }
  nav ul li {
    margin-bottom: .5rem;
  }
</style>
