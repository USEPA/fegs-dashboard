<template>
  <div>
    <h3>Checkboxes</h3>
    <div style="margin-bottom: .5rem; display: flex;">
      <!-- <input id="id-01" type="checkbox"/> -->
      <BaseCheckbox :startChecked="check1" v-on:click="check(1, $event)"/>
      <BaseCheckbox :startChecked="check2" :isDisabled="disable2" label="Sample label" v-on:click="check(2, $event)"/>
    </div>
    <BaseCodeBlock :content="checkMsg"/>
    <h3>Buttons</h3>
    <BaseButton color="primary">
      Sample Button
    </BaseButton>
    <BaseButton color="success" v-on:click="add">
      Add Stakeholder
    </BaseButton>
    <BaseButton color="danger" v-on:click="del">
      Delete Stakeholder
    </BaseButton>
    <BaseButton color="primary" :isDisabled="true">
      Disabled
    </BaseButton>
    <h3>Icon Buttons</h3>
    <div style="margin-bottom: .5rem; display: flex; font-size: 1.5rem;">
      <BaseButtonIcon color="primary" icon="edit"/>
      <BaseButtonIcon color="primary" icon="download" :doBlurOnClick="true"/>
      <BaseButtonIcon color="success" icon="check"/>
      <BaseButtonIcon color="danger" icon="trash"/>
    </div>
    <h3>Fields</h3>
    <BaseField style="margin: 0 .5rem .5rem 0;" type="text" v-on:input="onFieldInput" content="Sample text" placeholder="Anything"/>
    <BaseField style="margin: 0 .5rem .5rem 0;" type="text" :isDisabled="true" content="Sample text" placeholder="Disabled"/>
    <BaseCodeBlock :content="textMsg"/>
    <h3>Select</h3>
    <BaseSelect :options="['a', 'bb', 'ccc', 'dddd']" defaultOption="b"/>
    <h3>Modal</h3>
    <BaseButton @click="showModal = true">
      Show Modal
    </BaseButton>
    <BaseModal v-if="showModal" title="Delete Stakeholder?" @close="showModal = false">
      <div style="width: 20rem;">Delete stakeholder "stakeholderName" and all associated beneficiary scores?</div>
      <div style="margin-top: 1.5rem; display: flex; justify-content: flex-end;">
        <BaseButton style="margin-right: .5rem;" @click="showModal = false">Cancel</BaseButton>
        <BaseButton color="danger" @click="showModal = false">Delete</BaseButton>
      </div>
    </BaseModal>
    <h3>Miscellaneous Data</h3>
    <BaseCodeBlock :content="misc"/>
    <h3>Project Data</h3>
    <BaseCodeBlock :content="project"/>
  </div>
</template>

<script>
import BaseButton from './BaseButton.vue'
import BaseButtonIcon from './BaseButtonIcon.vue'
import BaseCheckbox from './BaseCheckbox.vue'
import BaseCodeBlock from './BaseCodeBlock.vue'
import BaseField from './BaseField.vue'
import BaseModal from './BaseModal.vue'
import BaseSelect from './BaseSelect.vue'
import BaseTable from './BaseTable.vue'
import BaseTableRow from './BaseTableRow.vue'
import BaseTableCellHead from './BaseTableCellHead.vue'
import BaseTableCellData from './BaseTableCellData.vue'

import Util from '../classes/Util.js'
import { project, misc } from '../store.js'

export default {
  name: 'SectionDeveloper',
  components: {
    BaseButton,
    BaseButtonIcon,
    BaseCheckbox,
    BaseCodeBlock,
    BaseField,
    BaseModal,
    BaseSelect,
    BaseTable,
    BaseTableRow,
    BaseTableCellHead,
    BaseTableCellData,
  },
  data() {
    return {
      check1: false,
      check2: true,
      disable2: false,
      text: '',
      showModal: false,
    }
  },
  computed: {
    checkMsg() {
      return Util.strObj({
        check1: this.check1,
        check2: this.check2,
        disable2: this.disable2,
      })
    },
    textMsg() {
      return Util.strObj({
        content: this.text,
      })
    },
    misc() {
      return Util.strObj(misc)
    },
    project() {
      return Util.strObj(project.data)
    },
  },
  methods: {
    add() {
      project.addStakeholder('TEST', '#4cb159')
    },
    del() {
      project.delStakeholder('TEST')
    },
    check(n, event) {
      if (n === 1) this.disable2 = !this.disable2
      this[`check${n}`] = event
    },
    onFieldInput(event) {
      this.text = event
    },
  },
}
</script>

<style>

</style>
