<template>
    <i-window :visible.sync="isShow"
              :title="title"
              width="650px"
              height="500px">
        <i-form>
            <i-form-item :required="true"
                         label="数据名称">
                <i-inputbox :maxlength=20
                            v-model="form.metaName"
                            :readonly="readonly">
                </i-inputbox>
            </i-form-item>
            <i-form-item label="资源目录"
                         :required="true">
                <tree-select :selectStyle="treeSelectConfig.selectStyle"
                             :api="treeSelectConfig.api"
                             v-model="form.themeId"
                             :value="form.themeId"
                             :treeStyleConfig="{leafIcon:'&#xe92f;'}"></tree-select>
            </i-form-item>
            <i-form-item label="数据描述">
                <i-textarea style="height: 100px;"
                            v-model="form.metaDes"
                            :readonly="readonly">
                </i-textarea>
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
import ITextarea from "../../components/common/ITextarea";
import tooltip from "../../components/common/OperationStatusTooltip"
import IButton from "../../components/common/IButton";
import TreeSelect from "../../components/DmComponent/TreeSelect"
export default {
    name: "gis-server-win",
    inject: ['search'],
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
        type: {
            type: String,
            default: ""
        }
    },
    data () {
        return {
            //获取单个数据的配置信息
            getMateDateSingleApi: './api/metaInfo/getById?id=',
            //修改单个数据接口
            modifyMateDateSingleApi: './api/metaInfo/modify',
            isShow: this.visible,
            readonly: false,

            // 信息提示
            tooltipConfig: {
                tooltipShow: false,
                tooltipType: "",
                tooltipMessage: ""
            },
            // 资源目录树形下拉框
            treeSelectConfig: {
                api: "./api/theme/getAll",
                field: "name",
                selectStyle: {
                    width: "100%",
                    height: "35px",
                    float: "left"
                }
            },
            // 表单
            form: {
                id: '',
                metaName: '',
                metaDes: '',
                themeId: ''
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

        // 通过id查询
        getMateDateSingle () {
            this.$http.get(this.getMateDateSingleApi + this.entityId).then((res) => {
                var clgInfo = res.body.content;
                this.form = {
                    id: clgInfo.id,
                    metaName: clgInfo.metaName,
                    metaDes: clgInfo.metaDes,
                    themeId: clgInfo.theme.id
                };
            })
        },

        // 表单验证
        validateForm () {
            if ('' == this.form.metaName || this.form.metaName.match(/^\s+$/)) {
                this.showTooltip('failed', '请填写数据名称');
                return false;
            }
            if (this.form.metaName.match(/\s/)) {
                this.showTooltip('failed', '数据中不能包含空格');
                return false;
            }
            // if ('' == this.form.metaDes || this.form.metaDes.match(/^\s+$/)) {
            //     this.showTooltip('failed', '请填写数据描述');
            //     return false;
            // }

            return true;
        },

        // 提交表单
        submit () {
            if (!this.validateForm()) {
                return;
            }

            let message;
            let url;
            message = '修改';
            this.form.id = this.entityId;
            this.$http.post(this.modifyMateDateSingleApi, this.form).then(
                (res) => {
                    if ('success' == res.body.status) {
                        this.showTooltip('success', message + '成功');
                        this.search();
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
                //新增
                if (this.type == 'add') {

                }
                //修改
                else if (this.type == 'modify') {
                    this.readonly = false;
                    this.getMateDateSingle();
                }
                //查看
                else if (this.type == 'view') {

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
        }
    },
    components: {
        IButton,
        IInputbox,
        IFormItem,
        IForm,
        IWindow,
        tooltip,
        ITextarea,
        TreeSelect
    }
}

</script>

<style scoped>
</style>
