<template>
  <table>
    <thead>
      <tr>
        <th colspan="4">th</th>
      </tr>
      <tr>
        <th colspan="2">th</th>
        <th colspan="2">th</th>
      </tr>
      <tr>
        <th>th</th>
        <th>th</th>
        <th>th</th>
        <th>th</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <th rowspan="2">th</th>
        <th>th</th>
        <td>td</td>
        <td>td</td>
      </tr>
      <tr>
        <th>th</th>
        <td>td</td>
        <td>td</td>
      </tr>
      <tr>
        <th rowspan="2">th</th>
        <th>th</th>
        <td>td</td>
        <td>td</td>
      </tr>
      <tr>
        <th>th</th>
        <td>td</td>
        <td>td</td>
      </tr>
      <tr>
        <th rowspan="2">th</th>
        <th>th</th>
        <td>td</td>
        <td>td</td>
      </tr>
      <tr>
        <th>th</th>
        <td>td</td>
        <td>td</td>
      </tr>
      <tr>
        <th rowspan="2">th</th>
        <th>th</th>
        <td>td</td>
        <td>td</td>
      </tr>
      <tr>
        <th>th</th>
        <td>td</td>
        <td>td</td>
      </tr>
      <tr>
        <th rowspan="2">th</th>
        <th>th</th>
        <td>td</td>
        <td>td</td>
      </tr>
      <tr>
        <th>th</th>
        <td>td</td>
        <td>td</td>
      </tr>
      <tr>
        <th rowspan="2">th</th>
        <th>th</th>
        <td>td</td>
        <td>td</td>
      </tr>
      <tr>
        <th>th</th>
        <td>td</td>
        <td>td</td>
      </tr>
      <tr>
        <th rowspan="2">th</th>
        <th>th</th>
        <td>td</td>
        <td>td</td>
      </tr>
      <tr>
        <th>th</th>
        <td>td</td>
        <td>td</td>
      </tr>
    </tbody>
    <tfoot>
      <tr>
        <th colspan="2">th</th>
        <td>td</td>
        <td>td</td>
      </tr>
    </tfoot>
  </table>
</template>

<script>
import Util from '../classes/Util.js'

// NOTES
// the table element is important for assisted users
// freezing the headers is important for sighted users
// position sticky sucks because it only works for cells, not the whole thead
// there are a few options, increasing in quality and implementation difficulty:
//  1. static table with no frozen headers, user must scroll a lot   <-- do it this way for now
//  2. css only but hard code row offsets, scrunches weird when it reaches bottom 
//  3. dynamically change css with js scroll detection, complex and might be laggy

export default {
  name: 'BaseTable',
  props: {

  },
  data() {
    return {

    }
  },
  computed: {

  },
  methods: {

  }
}
</script>

<style scoped>
  table,
  th,
  td {
    border: 1px solid black;
  }
  table {
    /* width: 100%; */
    /* height: 200px; */
    /* margin: 0 auto; */
    margin-bottom: 100vh;
    /* display: block; */
    overflow-x: auto;
    border-spacing: 0;
  }
  th,
  td {
    padding: 40px;
  }
  thead th {
    background-color: #C99;
  }
  thead tr:last-child th {
    padding: 20px;
  }
  tbody th {
    background-color: #9C9;
  }
  tbody th:first-child {
    padding: 20px;
  }
  tbody td {
    background-color: #AFA;
  }
  tfoot th {
    background-color: #99C;
  }
  tfoot td {
    background-color: #AAF;
  }
  
</style>