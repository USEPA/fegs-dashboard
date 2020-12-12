<template>
  <BaseSection
    title="Attributes"
    prevSection="Beneficiaries"
    :isReady="isReady"
  >
    <h2>Attributes</h2>
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
        :isChecked="attributeShow.defs"
        @change="onShowDefinitionsChange"
      />
      <BaseCheckbox
        style="margin-left: 1rem;"
        label="Show results"
        :isChecked="attributeShow.results"
        @change="onShowResultsChange"
      />
      <BaseCheckbox
        style="margin-left: 1rem;"
        label="Show all beneficiaries"
        :isChecked="attributeShow.allColumns"
        @change="onShowAllColumnsChange"
      />
    </div>
    <div class="full">
      <TableAttribute
        :showDefinitions="attributeShow.defs"
        :showResults="attributeShow.results"
        :showAllColumns="attributeShow.allColumns"
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
  </BaseSection>
</template>


<script>
import BaseChartBar from './BaseChartBar.vue'
import BaseChartPie from './BaseChartPie.vue'
import BaseCheckbox from './BaseCheckbox.vue'
import BaseNotes from './BaseNotes.vue'
import BaseSection from './BaseSection.vue'
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
    BaseSection,
    TableAttribute,
  },
  props: {
    isReady: {
      type: Boolean,
      default: true,
    },
  },
  computed: {
    pieContent() {
      return project.getAttributePieContent()
    },
    barContent() {
      return project.getAttributeBarContent()
    },
    attributeNote() {
      return project.data.attributeSection.note
    },
    attributeShow() {
      return project.data.attributeSection.show
    }
  },
  methods: {
    setAttributeNote(event) {
      project.setAttributeNote({ text: event })
    },
    setAttributeNoteExpanded(event) {
      project.setAttributeNote({ expanded: event })
    },
    onShowDefinitionsChange(event) {
      project.setAttributeShow({ defs: event })
    },
    onShowResultsChange(event) {
      project.setAttributeShow({ results: event })
    },
    onShowAllColumnsChange(event) {
      project.setAttributeShow({ allColumns: event })
    },
  },
}
</script>

<style scoped>

</style>