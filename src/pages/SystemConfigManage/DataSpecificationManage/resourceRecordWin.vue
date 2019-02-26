<template>
    <div>
        <i-window :visible.sync="isShow"
                :title="title"
                width="600px"
                height="450px">
        <div >
            <grid :config="gridConfigs" ref="grid" ></grid>
        </div>
        <div slot="footer"
            style="float:right;margin-right:20px;">
            <i-button type="primary"
                    @click="isShow = false">
                关闭
            </i-button>
            <i-button type="primary"
                    @click="submit">
                确定
            </i-button>
        </div>
        </i-window>

        <!--　用于显示信息的提示工具　-->
        <tooltip :show.sync="tooltipConfig.tooltipShow"
                 :showType="tooltipConfig.tooltipType"
                 :message="tooltipConfig.tooltipMessage"
                 @tooltipClosed="tooltipConfig.tooltipShow = false;">
        </tooltip>
    </div>
</template>

<script>
import IWindow from "../../../components/common/IWindow";
import IButton from "../../../components/common/IButton";
import grid from '../../../components/common/grid.vue';
import Tooltip from '../../../components/common/OperationStatusTooltip';

export default {
    name: "resource-item-win",
    props: {
        visible: {
            type: Boolean,
            default: false
        },
        title: {
            type: String,
            default: ""
        },
        entityId: {
            type: String,
            default: ""
        },
        deptId: {
            type: String,
            default: ''
        },
        type: {
            type: String,
            default: ""
        }
    },
    data () {
        var that = this;
        return {
            isShow: this.visible,
            readonly: false,
            fileId:'',

            // 信息提示
            tooltipConfig: {
                tooltipShow: false,
                tooltipType: "",
                tooltipMessage: ""
            },
            uploadConfig: {
                files: []
            },
            chooseFileItem:null,
            // 数据列表
            gridConfigs: {
              hasCheckbox:false,
              selectedId: '',
              //grid 列是否可以点击
              rowChecked:false,
              operationColumnWidth:'60px',
              getSelectedIds: [],
              searchFields:{
                dfId:that.entityId,
              },
              getSelectedNames: [],
              operations: [{
                    title: "选择",
                    icon: "&#xe9ba",
                    func: this.chooseRecord
                }],
              fields: [
                {
                  title: "文件名",
                  field: "fileName",
                  isSortField: true,
                  style: {
                    width: "30%",
                    float: "left",
                    textAlign: "center"
                  }
                },
                {
                  title: "版本号",
                  field: "verNum",
                  isSortField: true,
                  style: {
                    width: "25%",
                    float: "left",
                    textAlign: "center"
                  }
                },

                {
                  title: "上传时间",
                  field: "createDate",
                  sortType: 'desc',
                  isSortField: true,
                  style: {
                    width: "25%",
                    float: "left",
                    textAlign: "center"
                  }
                },

              ],
              currPageNum: 1,
              totalPageNum: 1,
              pageSize: 10,
              api: `./api/dataDirectoryUpdateFileInfo/getFileList`
            },
        }
    },
    methods: {
        // 信息提示
        showTooltip (type, message) {
            this.tooltipConfig = {
                tooltipType: type,
                tooltipMessage: message,
                tooltipShow: true
            };
        },
        chooseRecord(item){
            this.$refs.grid.rows = this.$refs.grid.rows.map(item => {
                item.isChecked = false;
                return item;
            })
            item.isChecked = true;
            this.chooseFileItem = item;
        },
        submit(){
            if(this.chooseFileItem ==  null){
                this.showTooltip('failed', '请先选择资源文件版本');
                return;
            }
            // this.$emit('changeRecord',this.chooseRecordItem);
            let type,chooseId;
            type = this.chooseFileItem.fileName.slice(this.chooseFileItem.fileName.lastIndexOf('.')+1);
            chooseId = this.chooseFileItem.fileInfoId;

            this.isShow = false;
            if (type === 'xls' || type === 'xlsx') {
                this.$emit('emitCoordinate',{chooseId,chooseFileItem:this.chooseFileItem});
            } else {
                this.$emit('emitShpField',{chooseId,chooseFileItem:this.chooseFileItem});
            }
        }
    },
    mounted(){
      this.fileId = this.entityId;
    },
    watch: {
        visible (val) {
            this.isShow = val;
        },
        isShow (val) {
            //为true表示显示当前Window
            if (val) {

            } else {
                //通过向父组件传递事件的方式修改visible属性所对应的变量的值
                this.$emit("update:visible", val);
            }
        },

    },
    components: {
        grid,
        IWindow,
        IButton,
        Tooltip
    }
}
</script>

<style scoped>
</style>
