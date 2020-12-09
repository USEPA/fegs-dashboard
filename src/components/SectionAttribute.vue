<template>
  <div>
    <p>
      Identify how much each beneficiary group cares about the listed environmental attributes by percentage.
    </p>
    <p>
      Select a beneficiary category from the drop down, expand the relevant attribute categories, and enter the percentages in the input boxes.
    </p>
    <BaseNotes
      :value="attributeNote.text"
      :expanded="attributeNote.expanded"
      @change-note="setAttributeNote"
      @change-expanded="setAttributeNoteExpanded"
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
      <TableAttribute
        :showDefinitions="showDefinitions"
        :showResults="showResults"
      />
    </div>
    <div class="full">
      <BaseChartBar
        title="Environmental Attribute Prioritization"
        :width="1080"
        :height="500"
        :data="barContent.data"
        :colors="barContent.colors"
      />
      <BaseChartPie
        title="Environmental Attributes Relative Priority"
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
import TableAttribute from './TableAttribute.vue'

import Util from '../classes/Util.js'
import { project } from '../store.js'

export default {
  name: 'SectionAttribute',
  components: {
    BaseChartBar,
    BaseChartPie,
    BaseCheckbox,
    BaseNotes,
    TableAttribute,
  },
  computed: {
    showDefinitions() {
      return project.data.attributeSection.showDefs
    },
    showResults() {
      return project.data.attributeSection.showResults
    },
    pieContent() {
      return project.getAttributePieContent()
    },
    barContent() {
      return project.getAttributeBarContent()
    },
    attributeNote() {
      return project.data.attributeSection.note
    },
  },
  methods: {
    onShowDefinitionChange(event) {
      project.setAttributeShowDefs(event)
    },
    onShowResultChange(event) {
      project.setAttributeShowResults(event)
    },
    setAttributeNote(event) {
      project.setAttributeNote({ text: event })
    },
    setAttributeNoteExpanded(event) {
      project.setAttributeNote({ expanded: event })
    },
  },
}
</script>

<style scoped>

</style>