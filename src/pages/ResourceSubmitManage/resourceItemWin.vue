<template>
    <i-window :visible.sync="isShow"
              :title="title"
              width="700px"
              height="450px">
        <i-form style="padding-left: 40px">
            <i-form-item :required="true"
                         label="资源名称">
                <i-inputbox v-model="form.resourceName"
                            :readonly="readonly">
                </i-inputbox>
            </i-form-item>
            <i-form-item :required="true"
                         label="文件名称">
                <i-inputbox v-model="form.fileInfo.fileName"
                            :disabled="true&&type=='modify'"
                            :readonly="readonly">
                </i-inputbox>
                <div v-show="applyStatus!= '已通过'&&(!readonly)"
                     style="float:left; width:100%;padding-top:10px;">
                    <file-uploader v-model="uploadConfig.files"
                                   :multiple="false"
                                   @input="changeFileName"></file-uploader>
                </div>
            </i-form-item>
            <i-form-item :required="true"
                         label="文件描述">
                <i-textarea style="height: 80px;"
                            v-model="form.fileDes"
                            :readonly="readonly"></i-textarea>
            </i-form-item>

            <i-form-item v-show="applyStatus == '审核未通过'&&readonly"
                         :required="true"
                         label="驳回原因">
                <i-textarea style="height: 80px;"
                            v-model="form.rejectReason"
                            :readonly="readonly"></i-textarea>
            </i-form-item>
        </i-form>

        <div slot="footer"
             style="float:right;margin-right:20px;">
            <i-button v-if="readonly"
                      type="primary"
                      @click="isShow = false">
                关闭
            </i-button>

            <i-button v-if="!readonly"
                      plain
                      @click="isShow = false">
                取消
            </i-button>

            <i-button v-if="!readonly"
                      type="primary"
                      @click="submit">
                提交
            </i-button>
        </div>

        <!--　用于显示信息的提示工具　-->
        <tooltip :show.sync="tooltipConfig.tooltipShow"
                 :showType="tooltipConfig.tooltipType"
                 :message="tooltipConfig.tooltipMessage"
                 @tooltipClosed="tooltipConfig.tooltipShow = false;">
        </tooltip>
    </i-window>
</template>

<script>
import IWindow from "../../components/common/IWindow";
import IForm from "../../components/common/IForm";
import IFormItem from "../../components/common/IFormItem";
import IInputbox from "../../components/common/IInputbox";
import tooltip from "../../components/common/OperationStatusTooltip";
import IButton from "../../components/common/IButton";
import FileUploader from "../../components/common/FileUploader";
import ITextarea from "../../components/common/ITextarea"


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
        },
        applyStatus: {
            type: String,
            default: ""
        }
    },
    data () {
        return {
            //获取单个文件信息接口
            getDirectoryFileInfoApi: './api/directoryFileInfo/getById?id=',
            //修改单个文件信息接口
            modifyDirectoryFileInfoApi: './api/directoryFileInfo/modify',

            isShow: this.visible,
            readonly: false,
            // 信息提示
            tooltipConfig: {
                tooltipShow: false,
                tooltipType: "",
                tooltipMessage: ""
            },
            uploadConfig: {
                files: []
            },
            // 表单
            form: {
                fileInfoId: '',
                fileDes: '',
                resourceName: '',
                fileInfo: {
                    fileName: ''
                },
                rejectReason: ''
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

        // 表单非空验证
        validateForm () {
            if ('' == this.form.fileInfoId) {
                this.showTooltip('failed', '请上传文件');
                return false;
            } else if ('' == this.form.resourceName) {
                this.showTooltip('failed', '请填写资源名称');
                return false;
            } else if ('' == this.form.fileDes) {
                this.showTooltip('failed', '请填写文件描述');
                return false;
            }
            return true;
        },

        // 通过id查询
        getById () {
            this.$http.get(this.getDirectoryFileInfoApi + this.entityId).then(
                (res) => {
                    let resInfo = res.body.content;
                    this.form = resInfo;
                }
            )
        },

        changeFileName (files) {
            this.form.fileInfo.fileName = files[0].name
        },

        // 提交表单
        submit () {
            if (!this.validateForm()) {
                return;
            }
            let message;
            let url;
            if ('modify' == this.type) {
                url = this.modifyDirectoryFileInfoApi;
                message = '修改';
            }
            this.form.applyStatus = '1'
            this.$http.post(url, this.form).then(
                (res) => {
                    if ('success' == res.body.status) {
                        this.showTooltip('success', message + '成功');
                        this.$emit('search');
                    } else {
                        this.showTooltip('failed', res.body.message);
                    }
                },

                (res) => {
                    this.showTooltip('failed', '服务器异常,请刷新后重试');
                }
            );
        }
    },

    watch: {
        visible (val) {
            this.isShow = val;
        },
        isShow (val) {
            //为true表示显示当前Window
            if (val) {
                //修改
                if (this.type == 'modify') {
                    this.readonly = false;
                    this.uploadConfig.files = [];
                    this.getById();
                }
                //查看
                else if (this.type == 'view') {
                    this.readonly = true;
                    this.getById();
                }
            } else {
                //通过向父组件传递事件的方式修改visible属性所对应的变量的值
                this.$emit("update:visible", val);
            }
        },
        "tooltipConfig.tooltipShow": function (val) {
            // 当tooltip关闭后，如果是成功类型的说明操作成功了，此时一并将Window一起关闭
            if (!val && "success" == this.tooltipConfig.tooltipType) {
                this.isShow = false;
            }
        },
        "uploadConfig.files": {
            handler (val) {
                if (val[0] && val[0].url) {
                    let index = val[0].url.lastIndexOf("\/");
                    this.form.fileInfoId = val[0].url.substr(index + 1);
                }
            },
            deep: true
        }
    },
    components: {
        IButton,
        IInputbox,
        IFormItem,
        IForm,
        IWindow,
        tooltip,
        FileUploader,
        ITextarea
    }
}
</script>

<style scoped>
</style>
