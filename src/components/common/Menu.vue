<template>
  <ul>
    <template v-if="this.children.length > 0">
      <li class="menu"
          @click="zoom">
        <span class="hot">&nbsp;</span>
        <i :class="'icon-' + config.code"></i>
        <span style="padding-left: 8px;">{{config.name}}</span>
        <span style="position: absolute;right: 20px;font-size: 18px;"
              v-html="isOpen==true?'&#xe313;':'&#xe315;'"></span>
      </li>
      <li class="sub-menu-main"
          style="display: none;">
        <ul>
          <template v-for="subCfg in this.children">
            <router-link class="menu sub-menu"
                         :to="{name:subCfg.code, params: {id: subCfg.code }}"
                         :key="subCfg.code"
                         tag="li">
              <span class="hot">&nbsp;</span>
              <span style="margin-left:50px;margin-right:5px;font-size: 14pt;"
                    :class="'icon-' + subCfg.code"></span>
              <span style="padding-left: 8px;">{{subCfg.name}}</span>
            </router-link>
          </template>
        </ul>
      </li>
    </template>
    <router-link v-else
                 class="menu"
                 :to="{name:config.code, params: {id: config.code }}"
                 :key="config.code"
                 tag="li">
      <span class="hot">&nbsp;</span>
      <i :class="'icon-' + config.code"></i>
      <span style="padding-left: 8px;">{{config.name}}</span>
    </router-link>
  </ul>
</template>

<script>
export default {
  props: {
    config: Object
  },
  data () {
    if (typeof this.config == "undefined") {
      throw "组件的config属性未配置"
    }

    if (!this.config.isOpen) {
      this.config.isOpen = false;
    }

    if (!this.config.children) {
      this.config.children = new Array();
    }

    return {
      id: this.config.id,
      isOpen: this.config.isOpen,
      children: this.config.children
    }
  },

  methods: {
    zoom (event) {
      if (!this.isOpen) {
        $(".nav .sub-menu-main").slideUp("fast");
        this.$emit("zoom", this.$data);
      }

      $(event.currentTarget).next().slideToggle("fast");
      this.isOpen = !this.isOpen;
    },
    close () {
      this.isOpen = false;
    }
  }
}
</script>

<style scoped>
li.menu {
  line-height: 64px;
  cursor: pointer;
  white-space: nowrap;
  position: relative;
}

li.sub-menu {
  background-color: #2c3845;
}

li.menu:hover {
  color: #fff;
  background-color: #3c4a57;
  -webkit-transition: color 0.5s, background-color 1s;
  -moz-transition: color 0.5s, background-color 1s;
  -ms-transition: color 0.5s, background-color 1s;
  -o-transition: color 0.5s, background-color 1s;
  transition: color 0.5s, background-color 1s;
}

.router-link-active .hot {
  background-color: #20a0ff;
}

li.router-link-active {
  background-color: #3c4a57;
}

[class^="icon-"] {
  position: relative;
  top: 2px;
  left: 5px;
  width: 22px;
}

.icon-dataSourceManage:before {
  content: "\e912";
}
.icon-gescGroupManage:before {
  content: "\e649";
}
.icon-DataManage:before {
  content: "\e901";
}
.icon-Mydata:before {
  content: "\e902";
}
.icon-MetaDataManage:before {
  content: "\e905";
}

.icon-FileSpace:before {
  content: "\e926";
}

.icon-metadataManage:before {
  content: "\e92e";
}

.icon-gisServerManage:before {
  content: "\e907";
}

.icon-DataSourceManage:before {
  content: "\e931";
}

.icon-MyDataSource:before {
  content: "\e92e";
}

.icon-DataSourceView:before {
  content: "\e93b";
}

.icon-DataBaseView:before {
  content: "\e9bc";
}

.icon-spaceSqlView:before {
  content: "\e903";
}

.icon-NoSqlView:before {
  content: "\e9bb";
}
.icon-FileView:before {
  content: "\e652";
}
.icon-resourceOverview:before {
  content: "\e914";
}

.icon-dataSpecificationManage:before {
  content: "\e918";
}

.icon-dataDirectoryManage:before {
  content: "\e92f";
}

.icon-updateReview:before {
  content: "\e9ba";
}

.icon-resourceShareManage:before {
  content: "\e93c";
}

.icon-resourceSubmitManage:before {
  content: "\e936";
}
.icon-zyzl:before {
  content: "\e93a";
}

.icon-gxspi:before {
  content: "\e93a";
}

.icon-systemConfigManage:before {
  content: "\e643";
}
.icon-DataCopy:before {
  content: "\e916";
}
.icon-MyCopy:before {
  content: "\e928";
}
.icon-ManualCopy:before {
  content: "\e975";
}
.icon-AutoCopy:before {
  content: "\e735";
}
.icon-DataAccredit:before {
  content: "\e69e";
}
.icon-OnwershipManage:before {
  content: "\e9bc";
}
.icon-PremissionManage:before {
  content: "\ea1e";
}
.icon-onlineUpdate:before {
  content: '\e909';
}
.icon-onlineDrawing:before {
  content: '\e907';
}
</style>
