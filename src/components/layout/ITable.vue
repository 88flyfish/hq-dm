<template>
  <div class=''>
    <table class="table">
      <thead>
        <tr>
          <th scope="col" style="width: 33%;" v-for="item in title">{{item}}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for>
          <td style="width: 150px"></td>
          <td style="width: 150px"></td>
          <td style="width: 160px"></td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
<script>
  export default {
    props: {
        title:{
            type : Array
        },
        content:{
            type : Object
        }
    },
    data() {
      return {

      }
    },
    methods: {

    },
    mounted() {

    },
    computed: {

    }
  }

</script>
<style scoped>
  .table {
    font-size: 12px;
    text-align: left;
    border-collapse: collapse;
    border: 1px solid #e8edff;
  }

  th {
    font-size: 14px;
    font-weight: normal;
    padding: 8px;
    text-align: center;
    color: #fff;
    background-color: #44aaf5;
  }

  td {
    font-size: 13px;
    padding: 8px;
    color: #555;
    border: 1px solid #fff;
  }

  tbody tr:nth-child(2n) {
    background: #e5e5e5;
  }

  tbody tr:nth-child(2n+1) {
    background: #eeeeee;
  }

  tr:hover td {
    font-size: 13px;
    background: #ddd;
  }

</style>
