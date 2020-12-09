<template>
  <div>
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
        :isChecked="showDefinitions"
        @change="onShowDefinitionChange"
      />
      <BaseCheckbox
        style="margin-left: 1rem;"
        label="Show results"
        :isChecked="showResults"
        @change="onShowResultChange"
      />
    </div>
    <div class="full">
      <TableBeneficiary
        :showDefinitions="showDefinitions"
        :showResults="showResults"  
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
  </div>
</template>


<script>
import BaseChartBar from './BaseChartBar.vue'
import BaseChartPie from './BaseChartPie.vue'
import BaseCheckbox from './BaseCheckbox.vue'
import BaseNotes from './BaseNotes.vue'
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
    TableBeneficiary,
  },
  computed: {
    showDefinitions() {
      return project.data.beneficiarySection.showDefs
    },
    showResults() {
      return project.data.beneficiarySection.showResults
    },
    pieContent() {
      return project.getBeneficiaryPieContent()
    },
    barContent() {
      return project.getBeneficiaryBarContent()
    },
    beneficiaryNote() {
      return project.data.beneficiarySection.note
    },
  },
  methods: {
    onShowDefinitionChange(event) {
      project.setBeneficiaryShowDefs(event)
    },
    onShowResultChange(event) {
      project.setBeneficiaryShowResults(event)
    },
    setBeneficiaryNote(event) {
      project.setBeneficiaryNote({ text: event })
    },
    setBeneficiaryNoteExpanded(event) {
      project.setBeneficiaryNote({ expanded: event })
    },
  },
}
</script>

<style scoped>

</style>