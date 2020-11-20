<template>
  <div>
    <div style="display: flex;">
      <BaseCheckbox
        style="margin-bottom: .5rem;"
        label="Show definitions"
        @click="onClick"
      />
    </div>
    <div class="full">
      <TableBeneficiary :showDefinitions="showDefinitions"/>
    </div>
    <div class="full">
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
import BaseChartPie from './BaseChartPie.vue'
import BaseCheckbox from './BaseCheckbox.vue'
import TableBeneficiary from './TableBeneficiary.vue'

import Util from '../classes/Util.js'
import { project } from '../store.js'

// TODO add iswrapped flag to checkbox, same thing as field

export default {
  name: 'SectionBeneficiary',
  components: {
    BaseChartPie,
    BaseCheckbox,
    TableBeneficiary,
  },
  computed: {
    showDefinitions() {
      return project.data.beneficiarySection.showDefs
    },
    pieContent() {
      return project.getBeneficiaryPieContent()
    },
  },
  methods: {
    onClick(event) {
      project.setBeneficiaryShowDefs(event)
    },
  },
}
</script>

<style scoped>

</style>