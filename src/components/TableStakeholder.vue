<template>
  <table>
    <thead>
      <tr>
        <th class="emphasis" :aria-hidden="true"></th>
        <th></th>
        <th>Stakeholder</th>
        <template v-for="criterionName in criterionNames">
          <th style="max-width: 10%;" :key="criterionName">{{ criterionName }}</th>
        </template>
      </tr>
    </thead>
    <tbody ref="rows">
      <tr
        v-for="(item, index) in stakeholderArray"
        :key="item.name"
        :class="{ darken: !!(index%2) }"
      >
        <th
          class="emphasis"
          :style="{ backgroundColor: `${item.color.primary}` }"
          :aria-hidden="true"
        >
        </th>
        <th>
          <BaseButtonIcon
            icon="trash"
            color="danger"
            @click="onDelete(item.name)"
          />
        </th>
        <th>
          <FieldText
            placeholder="Name"
            @commit="onRename(item.name, $event)"
            :value="item.name"
            :triggerOverwrite="triggerOverwrite"
            :validator="val => (val === item.name) ? '' : stakeholderNameValidator(val)"
          />
        </th>
        <template v-for="criterionName in criterionNames">
          <td :key="criterionName">
            <FieldNumber
              @commit="onScore(item.name, criterionName, $event)"
              @keyEnter="onKeyEnter(index)"
              :value="item.scores[criterionName]"
            />
          </td>
        </template>
      </tr>
    </tbody>
  </table>
</template>

<script>
import BaseSelect from './BaseSelect.vue'
import BaseButtonIcon from './BaseButtonIcon.vue'
import FieldNumber from './FieldNumber.vue'
import FieldText from './FieldText.vue'

import Util from '../classes/Util.js'
import { project } from '../store.js'

export default {
  name: 'TableStakeholder',
  components: {
    BaseSelect,
    BaseButtonIcon,
    FieldNumber,
    FieldText,
  },
  props: {
    stakeholderNameValidator: Function,
  },
  data() {
    return {
      triggerOverwrite: 0,
    }
  },
  computed: {
    criterionNames() {
      return Object.keys(project.data.criterionSection.criteria)
    },
    stakeholderArray() {
      this.triggerOverwrite++
      return project.getStakeholderArray()
    },
  },
  methods: {
    log(val) {
      console.log(val)
    },
    onRename(originalName, event) {
      if (originalName !== event) {
        project.setStakeholderName(originalName, event)
        this.triggerOverwrite++
      }
    },
    onDelete(stakeholderName) {
      // TODO confirmation modal
      project.delStakeholder(stakeholderName)
    },
    onScore(stakeholderName, criterionName, event) {
      project.setStakeholderScore(stakeholderName, criterionName, event)
    },
    onKeyEnter(index) {
      if (index < this.stakeholderArray.length - 1) {
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
    box-sizing: border-box;
    border-top: 1px solid var(--color-table-border);
    border-right: 1px solid var(--color-table-border);
  }
  tr.darken th,
  tr.darken td {
    background-color: var(--color-table-body-back-darken);
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
  tr th:first-child {
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