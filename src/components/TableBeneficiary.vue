<template>
  <table>
    <thead>
      <tr>
        <th>Category</th>
        <th>Subcategory</th>
        <th>Definition</th>
        <th>
          <BasePicker>
      </tr>
    </thead>
  </table>
</template>

<script>
import BasePicker from './BasePicker.vue'

export default {
  name: 'TableBeneficiary',
  components: {
    BasePicker,
  },
  props: {

  },
  data() {
    return {
      selectedStakeholder: '',
    }
  },
  computed: {

  },
  methods: {

  }
}
</script>

<style scoped>

</style>