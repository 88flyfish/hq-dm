<template>
    <i-window :visible.sync="isShow"
              :title="title"
              width="700px"
              height="380px">
        <i-form style="padding-left: 40px">
            <i-form-item :required="true"
                         label="上传文件">
                <div style="display:inline-block">
                    <file-uploader v-model="uploadConfig.files"
                                   :multiple="false"></file-uploader>
                </div>
            </i-form-item>
            <div v-if="tipFlag"
                 class="tiptxt">{{tipTXT}}</div>
            <i-form-item :required="true"
                         label="文件描述">
                <i-textarea style="height: 80px;"
                            v-model="form.updateReason"
                            :readonly="readonly"></i-textarea>

            </i-form-item>
        </i-form>

        <div slot="footer"
             style="float:right;margin-right:20px;">

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
    name: "resource-sub-win",
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
        return {
            //新增单个文件信息接口
            saveDirectoryUploadFileInfoApi: './api/dataDirectoryUpdateFileInfo/save',
            //文件的是否存在校验接口
            checkResourceFileApi: "./api/fileDownload/isFileExist/",
            isShow: this.visible,
            readonly: false,
            tipFlag: false,
            tipTXT: '导入失败！',
            // 信息提示
            tooltipConfig: {
                tooltipShow: false,
                tooltipType: "",
                tooltipMessage: ""
            },
            uploadConfig: {
                files: []
            },
            //表单
            form: {
                fileInfoId: '',
                updateReason: '',
                dfId: this.entityId,
            }
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
            } else if ('' == this.form.updateReason) {
                this.showTooltip('failed', '请填写文件描述');
                return false;
            } else if ('' !== this.tipTXT) {
                this.showTooltip('failed', this.tipTXT);
                return false;
            }
            return true;
        },

        //文件是否存在的校验
        checkResourceFile (id) {
            this.$http.get(this.checkResourceFileApi + id).then(
                (res) => {
                    if ('success' == res.body.status) {
                        if (res.body.content == false) {
                            this.showTooltip('failed', res.body.message);
                            this.tipFlag = true;
                            this.tipTXT = res.body.message
                        } else if ((res.body.content == true)) {
                            this.tipFlag = false;
                        }
                    } else {
                        this.showTooltip('failed', res.body.message);
                    }
                },
                (res) => {
                    this.showTooltip('failed', '服务器异常,请刷新后重试');
                })
        },
        // 提交表单
        submit () {
            if (!this.validateForm()) {
                return;
            }
            this.$http.post(this.saveDirectoryUploadFileInfoApi, this.form).then(
                (res) => {
                    if ('success' == res.body.status) {
                        this.showTooltip('success', '上传成功');
                        this.$emit('search');
                    } else {
                        this.showTooltip('failed', "文件上传失败");
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
                this.tipFlag = false;
                //新增
                if (this.type == 'add') {
                    this.readonly = false;
                    this.uploadConfig.files = [];
                    this.form = {
                        dfId: this.entityId,
                        fileInfoId: '',
                        updateReason: '',
                    }
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
                    const id = this.uploadConfig.files[0].url.substring(index + 1, this.uploadConfig.files[0].url.length);
                    this.checkResourceFile(id);
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
.tiptxt {
    height: 40px;
    line-height: 40px;
    background-color: #dff0d8;
    border-color: #d6e9c6;
    color: #3c763d;
    text-align: center;
    width: 60%;
    margin: 0 auto;
}
</style>
