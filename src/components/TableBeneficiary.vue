<template>
  <table>
    <thead>
      <tr>
        <th class="emphasis" :aria-hidden="true"></th>
        <th>Category</th>
        <th>Subcategory</th>
        <th v-if="showDefinitions">Definition</th>
        <th>
          <BaseSelect
            label="Stakeholder"
            @change="onStakeholder"
            :options="stakeholderNames"
          />
        </th>
      </tr>
    </thead>
    <tbody ref="rows">
      <tr
        v-for="(item, index) in beneficiaryArray"
        :key="item.name"
        :class="{ first: item.computed.firstOfCategory }"
      >
        <th
          class="emphasis"
          :style="{ backgroundColor: `${item.category.color.primary}` }"
          :aria-hidden="true"
        >
        </th>
        <th
          v-if="item.computed.firstOfCategory"
          :style="{ backgroundColor: item.category.color.lighter }"
          :rowspan="item.category.computed.members"
        >
          {{ item.categoryName }}
        </th>
        <th v-else style="display: none"></th>
        <th
          :style="{
            backgroundColor: item.category.color.lighter,  
          }"
        >
          {{ item.name }}
        </th>
        <th
          v-if="showDefinitions"
          :style="{
            backgroundColor: item.category.color.lightest,  
          }"
        >
          {{ item.def }}
        </th>
        <td>
          <FieldNumber
            @commit="onScore(item.name, $event)"
            @keyEnter="onKeyEnter(index)"
            :value="item.scores[selectedStakeholder]"
            :triggerOverwrite="triggerOverwrite"
          />
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script>
import BaseSelect from './BaseSelect.vue'
import FieldNumber from './FieldNumber.vue'

import Util from '../classes/Util.js'
import { project } from '../store.js'

export default {
  name: 'TableBeneficiary',
  components: {
    BaseSelect,
    FieldNumber,
  },
  props: {
    showDefinitions: Boolean,
  },
  data() {
    return {
      selectedStakeholder: Object.keys(project.data.stakeholderSection.stakeholders)[0],
      triggerOverwrite: 0,
    }
  },
  computed: {
    stakeholderNames() {
      return Object.keys(project.data.stakeholderSection.stakeholders)
    },
    beneficiaryArray() {
      return project.getBeneficiaryArray()
    },
  },
  methods: {
    onStakeholder(event) {
      this.selectedStakeholder = event
      this.triggerOverwrite++
    },
    onScore(beneficiaryName, event) {
      project.setBeneficiaryScore(beneficiaryName, this.selectedStakeholder, event)
    },
    onKeyEnter(index) {
      if (index < this.beneficiaryArray.length - 1) {
        // focus the next cell in the column
        const cells = this.$refs.rows.children[index+1].children
        cells[3].children[0].focus()
      }
    },
  }
}
</script>

<style scoped>
  table {
    /* position: relative;
    left: -8px; */
    overflow-x: auto;
    border-spacing: 0;
  }
  th {
    text-align: left;
  }
  td {
    text-align: center;
  }
  th,
  td {
    margin: 1px;
    padding: .5rem;
    border-top: 1px solid var(--color-table-border);
    border-right: 1px solid var(--color-table-border);
  }
  th.emphasis {
    padding: 0 0 0 var(--length-primary);
    border: none;
  }
  thead th.emphasis {
    background-color: var(--color-table-head-emphasis);
  }
  thead th {
    background-color: var(--color-table-head-back);
  }
  tr.first th,
  tr.first td {
    margin-top: 3px;
  }
  tr th:nth-child(2) {
    max-width: 6rem;
  }
  tbody tr:last-child th,
  tbody tr:last-child td {
    border-bottom: 1px solid var(--color-table-border);
  }
  thead th {
    font-weight: bold;
  }
  /deep/ label {
    font-weight: bold;
  }
  tbody th {
    font-weight: normal;
  }


</style>