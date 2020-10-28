<template>
  <div id="project">
    <nav>
      <ul>
        <NavItem
          :to="`#${sections[0].id}`"
          :title="sections[0].title"
          :isFocus="sections[0].focused"
          :isError="false"
        />
        <NavItem
          :to="`#${sections[1].id}`"
          :title="sections[1].title"
          :isFocus="sections[1].focused"
          :isError="false"
        />
        <NavItem
          :to="`#${sections[2].id}`"
          :title="sections[2].title"
          :isFocus="sections[2].focused"
          :isError="false"
          :isReady="showStakeholders"
        />
        <NavItem
          :to="`#${sections[3].id}`"
          :title="sections[3].title"
          :isFocus="sections[3].focused"
          :isError="false"
          :isReady="showBeneficiaries"
        />
        <NavItem
          :to="`#${sections[4].id}`"
          :title="sections[4].title"
          :isFocus="sections[4].focused"
          :isError="false"
          :isReady="showAttributes"
        />
      </ul>
    </nav>
    <div id="content">
      <div :class="{hide:!scrolled}" class="shadow" style="top:0"></div>
      <!-- <div class="shadow" style="bottom:0"></div> -->
      <BaseSection
        :id="sections[0].id"
        :title="sections[0].title"
      >
        <SectionProject/>
      </BaseSection>
      <BaseSection
        :id="sections[1].id"
        :title="sections[1].title"
      >
        <SectionCriterion/>
      </BaseSection>
      <BaseSection
        :id="sections[2].id"
        :title="sections[2].title"
        :prevSection="sections[1].title"
        :isReady="showStakeholders"
      >
        <div>[ stakeholder section content ]</div>
      </BaseSection>
      <BaseSection
        :id="sections[3].id"
        :title="sections[3].title"
        :prevSection="sections[2].title"
        :isReady="showBeneficiaries"
      >
        <div>[ beneficiary section content ]</div>
      </BaseSection>
      <BaseSection
        :id="sections[4].id"
        :title="sections[4].title"
        :prevSection="sections[3].title"
        :isReady="showAttributes"
      >
        <div>[ attribute section content ]</div>
      </BaseSection>
      <BaseSection title="Developer">
        <DeveloperSection/>
      </BaseSection>
    </div>
  </div>
</template>

<script>
import NavItem from './NavItem.vue'
import DeveloperSection from './DeveloperSection.vue'
import BaseSection from './BaseSection.vue'
import SectionProject from './SectionProject.vue'
import SectionCriterion from './SectionCriterion.vue'

import Util from '../classes/Util.js'
import { project } from '../store.js'

// TODO page scroll nav state management
export default {
  name: 'TheProject',
  components: {
    NavItem,
    DeveloperSection,
    BaseSection,
    SectionProject,
    SectionCriterion,
  },
  data() {
    return {
      scrolled: false,
      sections: [
        {
          id: 'project-section',
          title: 'Project',
          focused: false,
        },
        {
          id: 'criteria-section',
          title: 'Weights',
          focused: false,
        },
        {
          id: 'stakeholder-section',
          title: 'Stakeholders',
          focused: false,
        },
        {
          id: 'beneficiary-section',
          title: 'Beneficiaries',
          focused: false,
        },
        {
          id: 'attribute-section',
          title: 'Attributes',
          focused: false,
        },
      ]
    }
  },
  computed: {
    showStakeholders() {
      return this.hasCriteria()
    },
    showBeneficiaries() {
      return this.hasCriteria() && this.hasStakeholders()
    },
    showAttributes() {
      return this.hasCriteria() && this.hasStakeholders() && this.hasBeneficiaries()
    },
  },
  created() {
    document.addEventListener('scroll', () => this.onScroll())
    this.onScroll()
  },
  methods: {
    hasCriteria() {
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
    onScroll() {
      const fromTop = window.scrollY
      this.scrolled = fromTop !== 0
      let found = false
      this.sections.forEach(section => {
        const ele = document.getElementById(section.id)
        if (!found && ele.offsetTop <= fromTop + 50 && ele.offsetTop + ele.offsetHeight > fromTop + 50) {
          found = section.focused = true
        } else {
          section.focused = false
        }
      })
    }
  },
}
</script>

<style scoped>
  #project {
    display: flex;
    flex-flow: row;
    align-items: stretch;
  }
  
  #content {
    
  }
  .shadow {
    width: 100%;
    height: 0;
    position: fixed;
    box-shadow: 0 0 5px 5px #0003;
  }
  .shadow.hide {
    box-shadow: none;
  }
  nav {
    z-index: 1;
    white-space: nowrap;
    color: var(--color-text-white);
    background-color: #212121;
  }
  nav ul {
    margin: 0;
    padding: .5rem 0;
    position: -webkit-sticky;
    position: sticky;
    top: 0;
    display: flex;
    flex-flow: column;
    list-style: none;
  }
</style>
