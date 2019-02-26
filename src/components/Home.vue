<template>
  <div class="organization" style="padding:50px;background-color:white;border: 1px solid red;">
    <input id="testhello" type="input" v-model="message"/>
    <button class="normal-button" @click="mapview">地图预览</button>
    <button class="normal-button" @click="test">测试</button>

    <my-window v-if="windowConfig.show" :config="windowConfig">
      <iframe @load="load('iframe1')" name="iframe1" style="border: 1px solid #999999;width:100%;height:100%;"
              src="./map.html"></iframe>
    </my-window>
    >
    <div style="width:800px;height:500px;padding-top:50px;">
      <iframe @load="load('iframe2')" name="iframe2" style="border: 1px solid #999999;width:100%;height:100%;"
              src="./map.html"></iframe>
    </div>

    <div style="border:0px solid red;">
      <file-uploader v-model="files" :multiple="true"></file-uploader>
    </div>

    <button @click="getFiles">获取上传的文件URL</button>
  </div>
</template>

<script>
  import Tree from "./common/Tree.vue"
  import TreeSelect from "./common/TreeSelect.vue"
  import MyWindow from "./common/Window.vue"
  import FileUploader from "./common/FileUploader.vue"

  export default {
    data() {
      var files = new Array();
      files.push({
        url: "https://static001.geekbang.org/resource/image/d6/01/d613476a62b04ac77223f2dbff7f8901.jpg"
      },{
        url: "https://static001.geekbang.org/resource/image/89/96/89be56d6b8ce062eaf00c9dde69faf96.jpg"
      })

      return {
        files: [],
        message: "test message",
        windowConfig: {
          show: false,
          parent: this,
          title: "地图预览",
          height: "550px",
          width: "800px",
          hasMaxBtn: true,
          method: {
            close() {
              this.windowConfig.show = false;
            }
          }
        }
      }
    },
    methods: {
      getFiles(){
        console.log(this.files);
      },
      load(name) {
        window.frames[name].initFromParent(this);
      },
      testForFrame() {
        alert("该方法是vm中的方法");
        alert(this.message);
      },
      mapview() {
        this.windowConfig.show = true;
      },
      test() {
        window.frames["iframe2"].test();
      },
      show() {
        console.log(JSON.stringify(this.$refs.tree.rows))
      },
      showValue: function () {
        alert(this.selectValue + "---" + this.$refs.test.$data.title);
      },
      selected: function (id) {
        //alert(id);
      },
      getValue() {
        alert(this.checked);
      },
      handle() {

      },
    },
    mounted() {

    },
    watch: {
      message(newVal, oldVal) {
        $(window.frames["iframe2"].document).find("#test").val(newVal);
      },
      files(newVal, oldVal) {
        console.log("files change:");
        console.log(newVal);
      }
    },
    components: {
      Tree: Tree,
      TreeSelect: TreeSelect,
      MyWindow: MyWindow,
      FileUploader
    }
  }
</script>

<style scoped>

</style>
