<template>
  <div style="clear: both;">
    <div v-if="multiple" v-for="file in files" class="img-container"
         :style="{ width: btnWidth + 'px', height: btnHeight + 'px'}">
      <img :src="file.url" class="img" @mouseenter="showImgBtn(file)"/>

      <template v-if="file.showImgBtn">
        <div class="img-btn-layer"></div>
        <div class="img-btn-layer-bar" @mouseleave="hideImgBtn(file)"
             :style="{fontSize: actionBtnFontSize,lineHeight:btnHeight + 'px'}">
          <span class="icon-search" @click="showImg(file)"
                :style="{marginRight:actionBtnMargin,padding:actionBtnPadding}"></span><span
          class="icon-remove" :style="{padding:actionBtnPadding}" @click="removeFile(file)"></span>
        </div>
      </template>
    </div>
    <div class="add-btn" :class="{'single-btn':!multiple}">
      <iframe @load="loaded($event)"
              :style="{ width: btnWidth + 'px', height: btnHeight + 'px' }"
              style="border: 0px;"
              :src="'./imgUploader.html?multiple=' + multiple + '&width=' + btnWidth + '&height=' + btnHeight"></iframe>
    </div>

    <img-viewer v-model="viewer.show" :url="viewer.url"/>
  </div>
</template>

<script>
  import ImgViewer from "./ImgViewer"

  export default {
    props: {
      value: {
        type: Array,
        default: new Array()
      },
      multiple: {
        type: Boolean,
        default: false
      },
      width: {
        type: Number,
        default: 100
      },
      height: {
        type: Number,
        default: 100
      }
    },
    data() {
      var width = this.width;
      var height = this.height;
      var actionBtnFontSize = "18pt";
      var actionBtnPadding = "5px";
      var actionBtnMargin = "10px";
      var files = new Array();

      if (this.value.length > 0) {
        this.value.forEach(file => {
          files.push({
            name: file.name == undefined ? '' : file.name,
            fileSize: file.fileSize == undefined ? '' : file.fileSize,
            url: file.url == undefined ? '' : file.url,
            showImgBtn: false
          })
        });
      }

      if (width <= 50) {
        actionBtnFontSize = "10pt";
        actionBtnPadding = "2px";
        actionBtnMargin = "2px";
      } else if (width > 50 && width <= 120) {
        actionBtnFontSize = "18pt";
        actionBtnPadding = "5px";
        actionBtnMargin = "5px";
      } else if (width > 120 && width <= 200) {
        actionBtnFontSize = "20pt";
        actionBtnPadding = "8px";
        actionBtnMargin = "8px";
      } else if (width > 200 && width <= 300) {
        actionBtnFontSize = "30pt";
        actionBtnPadding = "10px";
        actionBtnMargin = "15px";
      } else if (width > 300 && width <= 500) {
        actionBtnFontSize = "40pt";
        actionBtnPadding = "20px";
        actionBtnMargin = "30px";
      }

      return {
        btnWidth: width,
        btnHeight: height,
        files: files,
        actionBtnFontSize: actionBtnFontSize,
        actionBtnPadding: actionBtnPadding,
        actionBtnMargin: actionBtnMargin,
        viewer: {
          show: false,
          url: ''
        }
      }
    },
    methods: {
      loaded(event) {
        var frame = event.target;
        frame.contentWindow.initFromParent(this);
      },
      removeAll() {
        this.files = new Array();
      },
      removeFile(file) {
        var newFiles = new Array();
        this.files.forEach(f => {
          if (f !== file) {
            newFiles.push(f);
          }
        });

        this.files = newFiles;
      },
      showImgBtn(file) {
        file.showImgBtn = true;
      },
      hideImgBtn(file) {
        file.showImgBtn = false;
      },
      showImg(file) {
        this.viewer.show = true;
        this.viewer.url = file.url;
        this.$emit('showImg', file.url)
      }
    },
    mounted() {
    },
    watch: {
      files: function (newValue) {
        this.$emit('input', newValue)
      }
    },
    components: {
      ImgViewer
    }
  }
</script>

<style scoped>
  .add-btn {
    display: inline-block;
    margin-top: 10px;
    margin-left: 10px;
  }

  .single-btn {
    margin-top: 0px;
    margin-left: 0px;
  }

  .img-container {
    float: left;
    border-radius: 6px;
    border: 1px dashed #c0ccda;
    margin-left: 10px;
    margin-top: 10px;
  }

  .img {
    border-radius: 6px;
    width: 100%;
    height: 100%
  }

  .img-btn-layer {
    position: relative;
    width: 100%;
    height: 100%;
    top: -100%;
    background-color: #333333;
    opacity: 0.5;
  }

  .img-btn-layer-bar {
    font-family: 'iconfont';
    color: #ffffff;
    position: relative;
    width: 100%;
    height: 100%;
    top: -200%;
    text-align: center;
  }

  .icon-search, .icon-remove {
    border: 1px solid rgba(0, 0, 0, 0);
  }

  .icon-search:before {
    content: "\e627";
  }

  .icon-remove:before {
    content: "\e738";
  }

  .icon-search:hover, .icon-remove:hover {
    background-color: #333333;
    opacity: 0.8;
    cursor: pointer;
    color: #00a0e9;
    border: 1px solid #cccccc;
  }
</style>
