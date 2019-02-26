<template>
  <div class="SqlResultGrid" style="overflow:auto;">
    <table border="1">
      <thead>
        <tr style="height:40px;">
          <td>#</td>
          <td v-for="(fieldConfig,i) in config.columns">
            <span>{{fieldConfig.name}}</span>
          </td>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(r,index) in config.rows" style="height:30px;">
          <td style="width:30px;">{{index+1}}</td>
          <td v-for="(fieldConfig,i) in config.columns">
            <div>
              <span :title="r[fieldConfig.name]">{{r[fieldConfig.name]}}</span>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
    <!-- <pagination @paging="paging" @changePageSize="changePageSize" :currPageNum="config.currPageNum" :totalPageNum="config.totalPageNum" :pageSize="config.pageSize" /> -->
    <wait-mask :isShow="config.showMask" :maskByParent="config.maskByParent"></wait-mask>
  </div>
</template>

<script>
import WaitMask from './common/WaitMask.vue';

export default {
  props: {
    config: Object
  },
  computed: {},
  data() {
    if (typeof this.config == 'undefined') {
      throw '组件的config属性未配置';
    }

    if (typeof this.config.maskByParent == 'undefined') {
      this.config.maskByParent = true;
    }

    return {};
  },
  methods: {},
  created() {
    var fields = this.config.fields;
    for (var idx in fields) {
      if (typeof fields[idx].sortType == 'undefined') {
        this.$set(fields[idx], 'sortType', '');
      }
    }
  },
  mounted() {},
  components: {
    WaitMask: WaitMask
  },
  watch: {
    config: {
      handler(newValue, oldValue) {
        if (typeof this.config.maskByParent == 'undefined') {
          this.config.maskByParent = true;
        }
      },
      immediate: true,
      deep: true
    }
  }
};
</script>

<style lang="less" scoped>
.SqlResultGrid {
  text-align: center;
  table {
    border-collapse: collapse;
    margin: 0 auto;
    text-align: center;
    border-color: #ddd;
    border: none;
    width: 100%;
    thead {
      border-bottom: 2px solid #ddd;
    }
    tbody {
      tr:hover {
        background-color: #ffefbb;
      }
    }
    td {
      white-space: nowrap;
      border-right: none;
      border-left: none;
      padding: 0px 3px;
    }
  }
}
</style>
