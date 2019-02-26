<template>
  <div style="clear: both;">
    <div class="add-btn">
      <iframe @load="loaded('fileUploaderFrame')" scrolling="no" name="fileUploaderFrame"
              style="border:none;width:105px;height:35px;overflow:hidden;"
              :src="'./fileUploader.html'"></iframe>
    </div>
    <div v-for="file in files">
      <ul style="width:500px;color:#666666;"
          @mouseover="mouseenter(file)" @mouseout="mouseleave(file)">
        <li style="width:100%;">
          <ul class="file-item">
            <li class="file-icon"></li>
            <li class="file-info" :title="file.name">{{file.name}}</li>
            <li v-show="!file.hover && !file.uploaded && file.percent != 100 && file.percent != 0" class="file-percent">{{file.percent}}%</li>
            <li v-show="!file.hover && !file.uploaded && file.percent == 100" style="float:right;font-size:9pt;">合并中...</li>
            <li v-show="!file.hover && !file.uploaded && file.percent == 0" style="float:right;font-size:9pt;">校验中...</li>
            <li class="close-btn" v-show="file.hover" @click="remove(file)"></li>
            <li class="finished-icon" v-show="!file.hover && file.uploaded"></li>
          </ul>
        </li>
        <li v-if="!file.uploaded" style="margin-top:0px;display: block;background-color: #cccccc;height:2px;width:100%;">
          <span style="display: block;background-color: #00a0e9;height:100%;"
                :style="{width:file.percent + '%'}"></span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
  export default {
    beforeDestroy(){
      this.$emit('input', [])
    },
    props: {
      value: {
        type: Array,
        default: new Array()
      },
      multiple: {
        type: Boolean,
        default: true
      },
      attachParams: {
        type: Object,
        default: function(){
          return new Object();
        }
      }
    },
    data() {
      return {
        files: this.value
      }
    },
    methods: {
      errorMessage(message){
        this.$emit('error',message);
      },
      loaded(frameName) {
        window.frames[frameName].initFromParent(this);
      },
      addFile(file) {
        //当只支持上传一个文件时
        if (!this.multiple) {
          //清空文件列表
          this.files = new Array();
        }

        this.files.push(file);
      },
      fileUploaded(file) {
        this.$emit('input', this.files)
      },
      mouseenter(file) {
        file.hover = true;
      },
      mouseleave(file) {
        file.hover = false;
      },
      remove(file) {
        var fileArray = new Array();
        for (var i in this.files) {
          if (file.id != this.files[i].id) {
            fileArray.push(this.files[i]);
          }
        }

        this.files = fileArray;
      }
    },
    mounted() {

    },
    watch: {
      files: function (newValue) {
        this.$emit('input', newValue)
      }
    },
    components: {}
  }
</script>

<style scoped>
  ul, li, ol {
    list-style: none;
  }

  li {
    display: inline-block;
  }

  .file-item {
    margin-top: 3px;
    cursor: pointer;
    height: 30px;
    line-height: 30px;
    width: 100%;
  }

  .file-item:hover {
    background-color: #f5f7fa;
    border-radius: 4px;
    -webkit-transition: background-color .5s;
    -moz-transition: background-color .5s;
    -ms-transition: background-color .5s;
    -o-transition: background-color .5s;
    transition: background-color .5s;
  }

  .file-icon {
    float: left;
    margin-left: 5px;
    margin-right: 5px;
  }

  .file-info {
    width: 80%;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
  }

  .file-item:hover .file-info {
    color: #409eff;
  }

  .file-icon:before {
    font-family: iconfont;
    content: "\e925";
  }

  .file-percent {
    float: right;
    font-size: 9pt;
    margin-right: 5px;
  }

  .close-btn {
    float: right;
    margin-right: 5px;
    color: #aaaaaa;
  }

  .close-btn:hover {
    color: red;
    -webkit-transition: color .5s;
    -moz-transition: color .5s;
    -ms-transition: color .5s;
    -o-transition: color .5s;
    transition: color .5s;
  }

  .close-btn:before {
    font-family: iconfont;
    content: "\e621";
  }

  .finished-icon {
    float: right;
    margin-right: 5px;
    color: #00b83f;
  }

  .finished-icon:before {
    font-family: iconfont;
    content: "\e63b";
  }
</style>
