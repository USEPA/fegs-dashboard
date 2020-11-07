<template>
  <div id="project">
    <nav>
      <ul>
        <NavItem 
          v-for="section in sections" 
          :key="section.id"
          :to="`#${section.id}`"
          :title="section.title"
          :isFocus="section.focused"
          :isReady="section.ready"
          :isError="false"
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
        :isReady="sections[2].ready"
      >
        <SectionStakeholder/>
      </BaseSection>
      <BaseSection
        :id="sections[3].id"
        :title="sections[3].title"
        :prevSection="sections[2].title"
        :isReady="sections[3].ready"
      >
        <SectionBeneficiary/>
      </BaseSection>
      <BaseSection
        :id="sections[4].id"
        :title="sections[4].title"
        :prevSection="sections[3].title"
        :isReady="sections[4].ready"
      >
        <div>[ attribute section content ]</div>
      </BaseSection>
      <BaseSection
        :id="sections[5].id"
        :title="sections[5].title"
        :isReady="sections[5].ready"
      >
        <SectionDeveloper/>
      </BaseSection>
    </div>
  </div>
</template>

<script>
import NavItem from './NavItem.vue'
import BaseSection from './BaseSection.vue'
import SectionProject from './SectionProject.vue'
import SectionCriterion from './SectionCriterion.vue'
import SectionStakeholder from './SectionStakeholder.vue'
import SectionBeneficiary from './SectionBeneficiary.vue'
import SectionDeveloper from './SectionDeveloper.vue'

import Util from '../classes/Util.js'
import { project } from '../store.js'

// TODO page scroll nav state management
export default {
  name: 'TheProject',
  components: {
    NavItem,
    BaseSection,
    SectionProject,
    SectionCriterion,
    SectionStakeholder,
    SectionBeneficiary,
    SectionDeveloper,
  },
  data() {
    return {
      scrolled: false,
      sections: [
        {
          id: 'project-section',
          title: 'Project',
          focused: false,
          ready: true,
        },
        {
          id: 'criteria-section',
          title: 'Weights',
          focused: false,
          ready: true,
        },
        {
          id: 'stakeholder-section',
          title: 'Stakeholders',
          focused: false,
          ready: false,
        },
        {
          id: 'beneficiary-section',
          title: 'Beneficiaries',
          focused: false,
          ready: false,
        },
        {
          id: 'attribute-section',
          title: 'Attributes',
          focused: false,
          ready: false,
        },
        {
          id: 'developer-section',
          title: 'Developer',
          focused: false,
          ready: true,
        },
      ]
    }
  },
  computed: {
    sectionsReady() {
      return {
        stakeholder: this.hasCriteria(),
        beneficiary: this.hasCriteria() && this.hasStakeholders(),
        attribute: this.hasCriteria() && this.hasStakeholders() && this.hasBeneficiaries(),
      }
    },
  },
  watch: {
    sectionsReady(isReady) {
      this.sections[2].ready = isReady.stakeholder
      this.sections[3].ready = isReady.beneficiary
      this.sections[4].ready = isReady.attribute
    }
  },
  created() {
    document.addEventListener('scroll', () => this.onScroll())
  },
  mounted() {
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
      this.scrolled = (fromTop !== 0)
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
    width: 100%;
    display: flex;
    flex-flow: row;
    align-items: stretch;
  }
  
  #content {
    overflow: hidden;
    flex-grow: 1;
  }
  .shadow {
    width: 100%;
    height: 0;
    position: fixed;
    box-shadow: 0 0 3px 3px #0003;
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
    position: sticky;
    top: 0;
    display: flex;
    flex-flow: column;
    list-style: none;
  }
</style>
