<template>
    <div>
        <i-window :visible.sync="isShow"
                  :title="title"
                  width="680px"
                  height="500px">
            <div>
                <i-form>
                    <i-form-item label="选择数据来源">
                        <i-radio v-model="chooseType"
                                 name="choose"
                                 label="1">
                            <small>上传文件</small>
                        </i-radio>&nbsp;&nbsp;
                        <i-radio v-model="chooseType"
                                 name="choose"
                                 label="2">
                            <small>提交的资源</small>
                        </i-radio>&nbsp;&nbsp;
                    </i-form-item>
                    <i-form-item label="选择资源"
                                 v-if="type=='update'&&chooseType=='2'">
                        <i-button type="blue"
                                  @click="showResourceList"
                                  style="margin-right: 10px;margin-bottom:13px;">选择资源</i-button>
                    </i-form-item>
                    <div v-if="this.resourceSelectId!==''&&this.chooseType == '2'&&this.failMessage==''"
                         class='fileState'>
                        <span class='iconPic'></span>
                        <span class='fs'>{{chooseFileItem.fileName}}</span>
                        <span class="rightPic"></span>
                    </div>
                    <i-form-item label="选择文件"
                                 v-if="chooseType=='1'">
                        <div style="display:inline-block">
                            <file-uploader v-model="uploadConfig.files"
                                           :multiple="false"></file-uploader>
                        </div>
                    </i-form-item>
                    <div v-if="tipFlag"
                         class="tiptxt">{{tipTXT}}</div>
                    <i-form-item label="经度"
                                 :required="true"
                                 v-if="extraSelectShow">
                        <!-- 后台数据定的xField -->
                        <i-select v-model="form.metaInfoVo.fileFieldVo.xField"
                                  width="100%"
                                  panelHeight="200px"
                                  :disabled="readonly">
                            <i-option v-for="item in fieldOptions"
                                      :key="item.fieldName"
                                      :value="item.fieldName"
                                      :label="item.fieldName">
                            </i-option>
                        </i-select>
                    </i-form-item>
                    <i-form-item label="纬度"
                                 :required="true"
                                 v-if="extraSelectShow">
                        <i-select v-model="form.metaInfoVo.fileFieldVo.yField"
                                  width="100%"
                                  panelHeight="200px"
                                  :disabled="readonly">
                            <i-option v-for="item in fieldOptions"
                                      :key="item.fieldName"
                                      :value="item.fieldName"
                                      :label="item.fieldName">
                            </i-option>
                        </i-select>
                    </i-form-item>
                    <div v-if="this.shpBaseArr.length>0"
                         class='tip'>
                        <span style="display:inline-block;color:red;font-family: iconfont;font-size: 11px;">★</span>
                        标记的字段为必填项
                    </div>
                    <table class="table"
                           v-if="this.shpBaseArr.length>0">
                        <thead>
                            <tr>
                                <th scope="col"
                                    style="width: 50%"
                                    :key='i'
                                    v-for="i in fieldTableConfig.title">{{i}}</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(item,index) in form.metaInfoVo.stFieldInfoList "
                                :key="item.fieldName">
                                <td>
                                    <span style="display:inline-block;color:red;font-family: iconfont;font-size: 11px;"
                                          v-if="item.type=='5'">★</span>
                                    {{item.fieldName}}——{{item.chineseName}}</td>

                                <td style="position:relative;">
                                    <i-select v-model="standardFieldSelect[index]"
                                              @change="changeField(index)">
                                        <i-option v-for="i in standardFieldOptions[index]"
                                                  :class="{'colorSelect':i.selectState == true}"
                                                  :key="i.id"
                                                  :value="i.fieldName"
                                                  :label="i.fieldName">
                                        </i-option>
                                    </i-select>
                                    <span style="color:#20a0ff;font-size:10px;position:absolute;top:10px;right:15px;"
                                          v-if=" item.type
                                                &&shpCheckArr[index]&& shpCheckArr[index].type
                                                &&item.type!==shpCheckArr[index].type">
                                        类型不一致
                                    </span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <no-data v-else></no-data>
                </i-form>

            </div>
            <div slot="footer"
                 style="float:right;margin-right:20px;">
                <i-button type="primary"
                          @click="submit">
                    确定
                </i-button>
                <i-button @click="isShow = false">
                    关闭
                </i-button>
            </div>
        </i-window>
        <!-- 资源目录版本弹窗 -->
        <resource-list-win @emitCoordinate="setCoordinate"
                           @emitShpField="setShpField"
                           v-if="resourceListWin.show"
                           :visible.sync="resourceListWin.show"
                           :title="resourceListWin.title"
                           :entityId="resourceListWin.entityId"
                           :type="resourceListWin.type">
        </resource-list-win>
        <!--　用于显示信息的提示工具　-->
        <tooltip :show.sync="tooltipConfig.tooltipShow"
                 :showType="tooltipConfig.tooltipType"
                 :message="tooltipConfig.tooltipMessage"
                 @tooltipClosed="tooltipConfig.tooltipShow = false;">
        </tooltip>
    </div>
</template>

<script>
import IWindow from "../../components/common/IWindow";
import IButton from "../../components/common/IButton";
import grid from '../../components/common/grid.vue';
import IForm from "../../components/common/IForm";
import IFormItem from "../../components/common/IFormItem";
import resourceListWin from "../SystemConfigManage/DataSpecificationManage/resourceListWin"
import FileUploader from "../../components/common/FileUploader"
import IRadio from "../../components/common/IRadio"
import ISelect from "../../components/DmComponent/ISelect"
import IOption from "../../components/DmComponent/IOption"
import tooltip from '../../components/common/OperationStatusTooltip.vue';
import noData from "../../components/layout/noData";

export default {
    name: "update-meta-data-win",
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
        standardInfoId: {
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
            // 获取shp文件解析的字段接口
            getShpFieldApi: './api/metaInfo/getFileField',
            // 获取shp文件解析的已匹配字段信息接口
            getShpFieldMatchApi: './api/metaFieldInfo/getMatchField',
            //获取单个数据字段信息接口
            getFieldSingleApi: './api/metaInfo/getField?metaInfoId=',
            //更新字段信息接口
            updateMetadataApi: './api/metaInfo/updateMetaInfo',
            //上传文件为execl时获取经度纬度接口
            getCoordinateApi: './api/metaInfo/getExcelField?fileInfoId=',
            //选择资源列表的文件的是否存在校验接口
            checkResourceFileApi: "./api/fileDownload/isFileExist/",
            // 获取某个规范文件定义字段接口
            getStandardFieldApi: './api/fieldInfo/getByWhere',
            isShow: this.visible,
            chooseType: '',
            tipFlag: false,
            tipTXT: '导入失败！',
            readonly: false,
            //判断上传的文件是shp文件还是execl,execl文件额外显示经度纬度下拉框
            extraFlag: false,
            extraSelectShow: false,
            ShpFiledId: '',
            //文件解析后查找已存在的字段校验信息
            shpFieldMatchArr: {},
            //资源选择文件错误状态信息
            failMessage: '',
            //校验前ajax获取的右侧规范字段列表
            standardFieldArr: [],
            //选择后的规范字段
            standardFieldSelect: [],
            //字段集合
            standardFieldOptions: [],
            //execl 坐标
            fieldOptions: [],
            // 信息提示
            tooltipConfig: {
                tooltipShow: false,
                tooltipType: "",
                tooltipMessage: ""
            },
            fieldTableConfig: {
                title: ['规范字段名——中文名', '文件字段名'],
            },
            uploadConfig: {
                files: [],
            },
            gisOptions: [{
                value: 4490,
                label: "CGCS2000"
            }, {
                value: 2435,
                label: "深圳独立坐标系"
            }, {
                value: 4326,
                label: 'WGS84'
            }],
            //shp文件解析的字段信息存储
            shpBaseArr: [],
            //字段匹配后的ship对应字段的详细信息存储
            shpCheckArr: [],
            //资源目录选择项的信息
            resourceSelectId: '',
            chooseFileItem: null,
            // 查看资源弹窗
            resourceListWin: {
                show: false,
                title: '',
                entityId: '',
                type: '',
            },

            //提交表单
            form: {
                metaInfoVo: {
                    metaInfo: {
                        id: '',
                        fileInfoId: '',
                    },
                    fileFieldVo: {
                        xField: '',
                        yField: ''
                    },
                    //规范字段列表
                    stFieldInfoList: [],
                    //源文件的解析字段
                    sourceFieldInfoList: [],
                    //校验完成后的对应列表
                    matchMap: []
                }
            },
        }
    },
    methods: {

        showTooltip (type, message) {
            this.tooltipConfig = {
                tooltipType: type,
                tooltipMessage: message,
                tooltipShow: true
            };
        },

        // 表单非空验证
        validateForm () {
            if ('' == this.form.metaInfoVo.metaInfo.fileInfoId) {
                this.showTooltip('failed', '请上传文件或者选择资源文件');
                return false;
            } else if ('' !== this.failMessage) {
                this.showTooltip('failed', this.failMessage);
                return false;
            } else if (this.extraFlag && ('' == this.form.metaInfoVo.fileFieldVo.xField || '' == this.form.metaInfoVo.fileFieldVo.yField)) {
                this.showTooltip('failed', '请填写坐标配置信息');
                return false;
            }
            return true;
        },
        submit () {
            this.changeField();
            if (!this.validateForm()) {
                return;
            }
            this.form.metaInfoVo.sourceFieldInfoList = this.form.metaInfoVo.sourceFieldInfoList.map((item) => {
                delete item.selectState;
                return item
            })
            this.form.metaInfoVo.metaInfo.id = this.entityId;
            return this.$http.post(this.updateMetadataApi, this.form).then(
                (res) => {
                    if (res.body.status == 'success') {
                        this.showTooltip('success', '更新成功');
                        this.isShow = false;
                    } else {
                        this.showTooltip('failed', res.body.message);
                    }
                    this.$emit('freshGrid');
                },
                (res) => {
                    this.showTooltip('failed', '服务器异常,请刷新后重试');
                })
        },
        changeField (i) {
            //字段校验表格右侧列数据
            this.form.metaInfoVo.sourceFieldInfoList = [];
            this.standardFieldSelect.forEach((item, index) => {
                var flag = false;
                this.standardFieldArr.forEach((itemInner) => {
                    //  对应规范名的字段列表
                    if (itemInner.fieldName == item) {
                        this.form.metaInfoVo.sourceFieldInfoList.push(itemInner);
                        flag = true;
                    }
                })
                if (flag == false) {
                    this.form.metaInfoVo.sourceFieldInfoList.push('');
                }
            })
            this.form.metaInfoVo.sourceFieldInfoList = this.form.metaInfoVo.sourceFieldInfoList.filter((item, index) => {
                return item !== '';
            })
            var stFieldArr = [];
            //字段校验表格左侧列展示
            stFieldArr = this.form.metaInfoVo.stFieldInfoList.map((item) => {
                return item.fieldName
            })
            this.form.metaInfoVo.matchMap = [];
            //字段校验选择后一一对应项数据
            stFieldArr.forEach((item, index) => {
                var obj = {};
                obj[item] = this.standardFieldSelect[index];
                this.form.metaInfoVo.matchMap.push(obj);
            });
            //匹配后的SHP文件详细字段集合信息
            this.shpCheckArr = Array(this.shpBaseArr.length).fill({ type: '' });

            this.standardFieldSelect.forEach((item, index) => {
                this.shpBaseArr.forEach(i => {
                    if (i.fieldName == item) {
                        this.shpCheckArr[index] = i;
                    } else {
                        return;
                    }
                })
            })
            //下拉框选项动态展示优化
            //第一步初始化
            this.form.metaInfoVo.sourceFieldInfoList.forEach((item, index) => {
                this.standardFieldOptions.forEach((itemArr) => {
                    itemArr.forEach((itemInner) => {
                        itemInner.selectState = false;
                    })
                })
            })
            //第二部把被选择的标示为true，在下拉框选项中颜色标注为蓝色
            this.form.metaInfoVo.sourceFieldInfoList.forEach((item, index) => {
                this.standardFieldOptions.forEach((itemArr) => {
                    itemArr.forEach((itemInner) => {
                        if (itemInner.fieldName == item.fieldName) {
                            itemInner.selectState = true;
                        }
                    })
                })
            })
        },

        // 显示资源列表弹窗
        showResourceListWin (id, title, type) {
            this.resourceListWin = {
                show: true,
                entityId: id,
                title: title,
                type: type
            }
        },
        showResourceList () {
            this.showResourceListWin(this.entityId, `资源列表`, 'view');
        },
        setCoordinate (info) {
            this.resourceSelectId = info.chooseId;
            this.chooseFileItem = info.chooseFileItem;
        },
        setShpField (info) {
            this.resourceSelectId = info.chooseId;
            this.chooseFileItem = info.chooseFileItem;
        },
        //选择资源目录文件是否存在的校验
        checkResourceFile (id) {
            this.$http.get(this.checkResourceFileApi + id).then(
                (res) => {
                    if ('success' == res.body.status) {
                        if (res.body.content == false) {
                            this.showTooltip('failed', res.body.message);
                            this.resourceNameShow = false;
                            this.tipFlag = true;
                            this.tipTXT = res.body.message
                        } else if ((res.body.content == true)) {
                            this.resourceNameShow = true;
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
        //历史版本修改
        changeRecord (item) {
            this.recordItem = item;
            this.resourceRecordWin.show = false;
        },
        //上传文件为execl时获取经度纬度信息
        getCoordinate (info) {
            let id;
            if (this.chooseType == '1') {
                let index = info[0].url.lastIndexOf("\/");
                this.ShpFiledId = info[0].url.substr(index + 1);
                id = info[0].url.substr(index + 1);
            } else if (this.chooseType == '2') {
                id = this.resourceSelectId;
            }

            this.$http.get(this.getCoordinateApi + id).then(
                (res) => {
                    this.fieldOptions = res.body.content;
                },
                (res) => {
                    this.showTooltip('failed', '服务器异常,请刷新后重试');
                })
        },
        //获取单个数据规范信息
        getFieldSingle () {
            return this.$http.post(this.getStandardFieldApi, { standardInfoId: this.standardInfoId }).then(
                (res) => {
                    var clgInfo = res.body.content;
                    this.form.metaInfoVo.stFieldInfoList = clgInfo.map((item) => {
                        delete item.metaInfoId;
                        delete item.sourceFieldName;
                        return item
                    });
                },
                (res) => {
                    this.showTooltip('failed', '服务器异常,请刷新后重试');
                })
        },

        //获取shp文件的解析字段信息
        getShpField () {
            let parmas = {
                fileInfoId: '',
                xField: '',
                yField: ''
            }

            //上传文件 | 资源选择
            if (this.chooseType == '1') {
                var index = this.uploadConfig.files[0].url.lastIndexOf("\/");
                const id = this.uploadConfig.files[0].url.substring(index + 1, this.uploadConfig.files[0].url.length);
                this.ShpFiledId = this.uploadConfig.files[0].url.substring(index + 1, this.uploadConfig
                    .files[0].url.length);
                parmas = {
                    fileInfoId: this.ShpFiledId,
                    xField: this.form.metaInfoVo.fileFieldVo.xField,
                    yField: this.form.metaInfoVo.fileFieldVo.yField
                };
                this.form.metaInfoVo.metaInfo.fileInfoId = this.ShpFiledId;
            } else if (this.chooseType == '2') {
                parmas.fileInfoId = this.resourceSelectId;
                this.form.metaInfoVo.metaInfo.fileInfoId = this.resourceSelectId;
            }
            return this.$http.post(this.getShpFieldApi, parmas).then(
                (res) => {
                    if (res.body.status == 'success') {
                        const index = this.uploadConfig.files[0].url.lastIndexOf("\/");
                        const id = this.uploadConfig.files[0].url.substring(index + 1, this.uploadConfig.files[0].url.length);
                        this.checkResourceFile(id);
                        //shp文件解析字段
                        let fieldInfo = res.body.content.fieldInfoList;
                        this.shpBaseArr = this.objDeepCopy(fieldInfo);
                        //shp文件基本信息
                        this.form.metaInfoVo.metaAttributeInfo = res.body.content.metaAttributeInfo;
                        this.shpCheckArr = [];
                        this.shpCheckArr = Array(this.shpBaseArr.length).fill();
                        this.ajaxFlag = false;
                        //新增一个是否被选择标识字段
                        this.standardFieldArr = fieldInfo.map((item) => {
                            item.selectState = false;
                            return item;
                        });
                        this.getShpFieldMatch();
                        this.standardFieldOptions = Array(this.form.metaInfoVo.stFieldInfoList.length).fill(fieldInfo)
                            .map((itemArr, index) => {
                                var newItemArr = itemArr.filter((item) => {
                                    if (item.hasOwnProperty('length')) {
                                        //如果拥有length属性 规范里的length必须保证比ship文件解析出来的大
                                        var flag = false;
                                        if (this.form.metaInfoVo.stFieldInfoList[index].hasOwnProperty('length')) {
                                            if (parseInt(item.length) < parseInt(this.form.metaInfoVo.stFieldInfoList[index].length)) {
                                                flag = true;
                                            } else {
                                                flag = false;
                                            }
                                        } else {
                                            flag = true;
                                        }
                                        //type'5'的字段类型必须是'5'
                                        if (item.type === '5') {
                                            return this.form.metaInfoVo.stFieldInfoList[index].type == item.type && flag
                                        } else {
                                            return this.form.metaInfoVo.stFieldInfoList[index].type !== '5' && flag
                                        }
                                    } else {
                                        if (item.type === '5') {
                                            return this.form.metaInfoVo.stFieldInfoList[index].type == item.type
                                        } else {
                                            return this.form.metaInfoVo.stFieldInfoList[index].type !== '5'
                                        }
                                    }
                                })
                                return newItemArr
                            });
                        this.failMessage = '';
                        this.resourceListWin.show = false;
                    } else {
                        this.failMessage = res.body.message;
                        this.showTooltip('failed', res.body.message);
                    }

                },
                (res) => {
                    this.showTooltip('failed', '服务器异常,请刷新后重试');
                })
        },

        //获取shp文件的解析字段已配对信息
        getShpFieldMatch () {
            let parmas = {
                standardInfoId: this.standardInfoId,
                fieldInfoList: this.shpBaseArr
            };
            return this.$http.post(this.getShpFieldMatchApi, parmas).then(
                (res) => {
                    const clgInfo = res.body.content;
                    this.shpFieldMatchArr = clgInfo;
                    if (this.shpFieldMatchArr !== {}) {
                        this.form.metaInfoVo.stFieldInfoList.forEach((item, index) => {
                            Object.entries(this.shpFieldMatchArr).forEach((i, inIndex) => {
                                if (item.fieldName == i[0]) {
                                    this.$set(this.standardFieldSelect, index, i[1])
                                }
                            })
                        })
                    }
                },
                (res) => {
                    this.showTooltip('failed', '服务器异常,请刷新后重试');
                })
        },

        //深拷贝函数
        objDeepCopy (source) {
            var sourceCopy = source instanceof Array ? [] : {};
            for (var item in source) {
                sourceCopy[item] = typeof source[item] === 'object' ? this.objDeepCopy(source[item]) : source[item];
            }
            return sourceCopy;
        },
    },
    mounted () {

    },
    watch: {
        visible (val) {
            this.isShow = val;
        },
        isShow (val) {
            //为true表示显示当前Window
            if (val) {
                this.tipFlag = false;
                this.form = {
                    metaInfoVo: {
                        metaInfo: {
                            id: '',
                            fileInfoId: '',
                        },
                        fileFieldVo: {
                            xField: '',
                            yField: ''
                        },
                        //规范字段列表
                        stFieldInfoList: [],
                        //源文件的解析字段
                        sourceFieldInfoList: [],
                        //校验完成后的对应列表
                        matchMap: []
                    }
                };
                this.chooseType = '';
                this.standardFieldSelect = [];
                this.standardFieldOptions = [];
                this.uploadConfig.files = [];
                this.resourceSelectId = '';
                this.chooseFileItem = null;
                this.failMessage = '';
                this.shpBaseArr = [];
            } else {
                //通过向父组件传递事件的方式修改visible属性所对应的变量的值
                this.$emit("update:visible", val);
            }
        },
        chooseType (val) {
            if (val == '2') {
                // this.showResourceListWin('', `资源列表`, 'view');
            }

            this.form = {
                metaInfoVo: {
                    metaInfo: {
                        id: '',
                        fileInfoId: '',
                    },
                    fileFieldVo: {
                        xField: '',
                        yField: ''
                    },
                    //规范字段列表
                    stFieldInfoList: [],
                    //源文件的解析字段
                    sourceFieldInfoList: [],
                    //校验完成后的对应列表
                    matchMap: []
                }
            };
            this.standardFieldSelect = [];
            this.standardFieldOptions = [];
            this.uploadConfig.files = [];
            this.resourceSelectId = '';
            this.chooseFileItem = null;
            this.failMessage = '';
            this.shpBaseArr = [];
        },
        'uploadConfig.files': {
            handler (val) {
                this.extraFlag = false;
                this.extraSelectShow = false;
                if (val[0] && val[0].name && val[0].url && val[0].name.length > 0 && val[0].url.length > 0) {
                    const fileType = val[0].name.substr(val[0].name.lastIndexOf('.') + 1);

                    if (fileType === 'xls' || fileType === 'xlsx') {
                        this.extraFlag = true;
                        this.extraSelectShow = true;
                        this.getCoordinate(val);
                        this.getFieldSingle().then(this.getShpField());
                    } else {
                        this.getFieldSingle().then(this.getShpField());
                    }
                }
            },
            deep: true
        },
        'chooseFileItem': {
            handler (val) {
                // this.checkResourceFile(val.fileInfoId);
                this.extraFlag = false;
                this.extraSelectShow = false;
                if (val) {
                    const fileType = val.fileName.substr(val.fileName.lastIndexOf('.') + 1);
                    if (fileType === 'xls' || fileType === 'xlsx') {
                        this.extraFlag = true;
                        this.extraSelectShow = true;
                        this.getCoordinate();
                        this.getFieldSingle().then(this.getShpField());
                    } else {
                        this.getFieldSingle().then(this.getShpField());
                    }
                }
            },
            deep: true
        }

    },
    components: {
        grid,
        IWindow,
        IButton,
        IForm,
        IFormItem,
        resourceListWin,
        FileUploader,
        IRadio,
        ISelect,
        IOption,
        tooltip,
        noData
    }
}
</script>

<style scoped lang="scss">
.tip {
  margin-left: 20px;
  font-size: 12px;
  color: #999;
}
.fileState {
  margin: 10px auto;
  width: calc(100% - 240px);
  height: 30px;
  line-height: 30px;
  & .iconPic {
    float: left;
    margin-left: 5px;
    margin-right: 5px;
    &:before {
      font-family: iconfont;
      content: '\E925';
    }
  }

  & .rightPic {
    float: right;
    margin-right: 5px;
    color: #00b83f;
    &:before {
      font-family: iconfont;
      content: '\E63B';
    }
  }
  &:hover {
    cursor: pointer;
    background-color: #f5f7fa;
    border-radius: 4px;
    transition: background-color 0.5s;
    & .fs {
      color: #409eff;
    }
  }
}

/* 数据表设置table样式 */

.table {
  width: calc(100% - 50px);
  margin: 0 auto;
  font-size: 12px;
  text-align: center;
  border-collapse: collapse;
  border: 1px solid #e8edff;
}

th {
  font-size: 16px;
  font-weight: normal;
  padding: 8px;
  text-align: center;
  color: #fff;
  background-color: #44aaf5;
}

tr {
  text-align: center;
}

td {
  font-size: 13px;
  padding: 1px;
  color: #555;
  border: 1px solid #fff;
}

tbody tr:nth-child(2n) {
  background: #e5e5e5;
}

tbody tr:nth-child(2n + 1) {
  background: #eeeeee;
}

tr:hover td {
  font-size: 13px;
  background: #ddd;
}
.colorSelect {
  color: blue;
}
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
