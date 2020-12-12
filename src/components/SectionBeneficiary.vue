<template>
  <BaseSection
    title="Beneficiaries"
    prevSection="Stakeholders"
    :isReady="isReady"
  >
    <h2>Beneficiaries</h2>
    <p>
      Identify the types of beneficiaries making up each stakeholder group by percentage.
    </p>
    <p>
      Select a stakeholder from the drop down, expand the relevant beneficiary categories, and enter the percentages in the input boxes.
    </p>
    <p>
      Once you have entered your beneficiary data proceed to the attribute section.
    </p>
    <BaseNotes
      :value="beneficiaryNote.text"
      :expanded="beneficiaryNote.expanded"
      @change-note="setBeneficiaryNote"
      @change-expanded="setBeneficiaryNoteExpanded"
    />
    <div style="display: flex; margin-top: 1rem;">
      <BaseCheckbox
        label="Show definitions"
        :isChecked="beneficiaryShow.defs"
        @change="onShowDefinitionsChange"
      />
      <BaseCheckbox
        style="margin-left: 1rem;"
        label="Show results"
        :isChecked="beneficiaryShow.results"
        @change="onShowResultsChange"
      />
      <BaseCheckbox
        style="margin-left: 1rem;"
        label="Show all stakeholders"
        :isChecked="beneficiaryShow.allColumns"
        @change="onShowAllColumnsChange"
      />
    </div>
    <div class="full">
      <TableBeneficiary
        :showDefinitions="beneficiaryShow.defs"
        :showResults="beneficiaryShow.results"
        :showAllColumns="beneficiaryShow.allColumns"
      />
    </div>
    <div class="full">
      <BaseChartBar
        title="Beneficiary Prioritization"
        :width="1080"
        :height="500"
        :data="barContent.data"
        :colors="barContent.colors"
      />
      <BaseChartPie
        title="Beneficiary Profile"
        :width="1080"
        :height="300"
        :data="pieContent.data"
        :colors="pieContent.colors"
      />
    </div>
  </BaseSection>
</template>


<script>
import BaseChartBar from './BaseChartBar.vue'
import BaseChartPie from './BaseChartPie.vue'
import BaseCheckbox from './BaseCheckbox.vue'
import BaseNotes from './BaseNotes.vue'
import BaseSection from './BaseSection.vue'
import TableBeneficiary from './TableBeneficiary.vue'

import Util from '../classes/Util.js'
import { project } from '../store.js'

export default {
  name: 'SectionBeneficiary',
  components: {
    BaseChartBar,
    BaseChartPie,
    BaseCheckbox,
    BaseNotes,
    BaseSection,
    TableBeneficiary,
  },
  props: {
    isReady: {
      type: Boolean,
      default: true,
    },
  },
  computed: {
    pieContent() {
      return project.getBeneficiaryPieContent()
    },
    barContent() {
      return project.getBeneficiaryBarContent()
    },
    beneficiaryNote() {
      return project.data.beneficiarySection.note
    },
    beneficiaryShow() {
      return project.data.beneficiarySection.show
    },
  },
  methods: {
    setBeneficiaryNote(event) {
      project.setBeneficiaryNote({ text: event })
    },
    setBeneficiaryNoteExpanded(event) {
      project.setBeneficiaryNote({ expanded: event })
    },
    onShowDefinitionsChange(event) {
      project.setBeneficiaryShow({ defs: event })
    },
    onShowResultsChange(event) {
      project.setBeneficiaryShow({ results: event })
    },
    onShowAllColumnsChange(event) {
      project.setBeneficiaryShow({ allColumns: event })
    },
  },
}
</script>

<style scoped>

</style>