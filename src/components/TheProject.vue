<template>
  <div id="project">
    <nav>
      <ul :class="{bumped:!isElectron}">
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
      <div
        class="shadow"
        style="top:0"
        :class="{hide:!scrolled}"
      ></div>
      <SectionProject
        :id="sections[0].id"
      />
      <SectionCriterion
        :id="sections[1].id"
      />
      <SectionStakeholder
        :id="sections[2].id"
        :isReady="sections[2].ready"
      />
      <SectionBeneficiary
        :id="sections[3].id"
        :isReady="sections[3].ready"
      />
      <SectionAttribute
        :id="sections[4].id"
        :isReady="sections[4].ready"
      />
      <SectionDeveloper
        v-if="isDev"
        :id="sections[5].id"
      />
    </div>
  </div>
</template>

<script>
import NavItem from './NavItem.vue'
import SectionProject from './SectionProject.vue'
import SectionCriterion from './SectionCriterion.vue'
import SectionStakeholder from './SectionStakeholder.vue'
import SectionBeneficiary from './SectionBeneficiary.vue'
import SectionAttribute from './SectionAttribute.vue'
import SectionDeveloper from './SectionDeveloper.vue'

import Util from '../classes/Util.js'
import { project } from '../store.js'

export default {
  name: 'TheProject',
  components: {
    NavItem,
    SectionProject,
    SectionCriterion,
    SectionStakeholder,
    SectionBeneficiary,
    SectionAttribute,
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
        ...(Util.isDev() ? [{
          id: 'developer-section',
          title: 'Developer',
          focused: false,
          ready: true,
        }] : []),
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
    isDev() {
      return Util.isDev()
    },
    isElectron() {
      return Util.isElectron()
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
      return !Object.values(project.data.criterionSection.criteria).every(criterion => !criterion.result)
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
    max-width: 2000px;
    min-height: 100vh;
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
    z-index: 100;
    box-shadow: 0 0 6px 6px #0001;
  }
  .shadow.hide {
    box-shadow: none;
  }
  nav {
    z-index: 1;
    white-space: nowrap;
    color: var(--color-text-white);
    background-color: var(--color-nav);
  }
  nav ul {
    margin: 0;
    padding: .5rem 0;
    position: sticky;
    display: flex;
    flex-flow: column;
    list-style: none;
  }
  nav ul.bumped {
    top: calc(var(--length-actionbar-height) + 1rem);
  }
</style>
