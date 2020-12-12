<template>
  <BaseSection>
    <h2>Weights</h2>
    <p>
      Look over the criteria below. Identify the criterion most relevant for distinguishing among stakeholder groups for this decision. Give that criterion a weight of 100. Weight all other criteria relative to that most valued criterion. Weights can be values between 0 and 100.
    </p>
    <p>
      Once you enter the 9 criteria proceed to the stakeholder section.
    </p>
    <BaseNotes
      :value="criterionNote.text"
      :expanded="criterionNote.expanded"
      @change-note="setCriterionNote"
      @change-expanded="setCriterionNoteExpanded"
    />
    <div style="display: flex; margin-top: 1rem;">
      <BaseCheckbox
        style="margin-bottom: .5rem;"
        label="Show results"
        :isChecked="criterionShow.results"
        @change="onShowResultChange"
      />
    </div>
    <div style="display: flex;" class="full">
      <TableCriterion :showResults="criterionShow.results"/>
      <BaseChartPie
        style="margin-left: .5rem;"
        :width="700"
        :height="340"
        :data="pieContent.data"
        :colors="pieContent.colors"
      />
    </div>
  </BaseSection>
</template>


<script>
import BaseChartPie from './BaseChartPie.vue'
import BaseCheckbox from './BaseCheckbox.vue'
import BaseNotes from './BaseNotes.vue'
import BaseSection from './BaseSection.vue'
import TableCriterion from './TableCriterion.vue'

import Util from '../classes/Util.js'
import { project } from '../store.js'

export default {
  name: 'SectionCriterion',
  components: {
    BaseChartPie,
    BaseCheckbox,
    BaseNotes,
    BaseSection,
    TableCriterion,
  },
  computed: {
    pieContent() {
      return project.getCriterionPieContent({ short: true })
    },
    criterionNote() {
      return project.data.criterionSection.note
    },
    criterionShow() {
      return project.data.criterionSection.show
    },
  },
  methods: {
    setCriterionNote(event) {
      project.setCriterionNote({ text: event })
    },
    setCriterionNoteExpanded(event) {
      project.setCriterionNote({ expanded: event })
    },
    onShowResultChange(event) {
      project.setCriterionShow({ results: event })
    },
  },
}
</script>

<style scoped>
  
</style>