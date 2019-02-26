<template>
    <div>
        <i-window :visible.sync="isShow"
                  :title="title"
                  :width="width"
                  :height="height">
            <div style="width: 99%;">
                <i-steps :active.sync="stepWindowConfig.active"
                         style="margin-left: 18px;"
                         v-if="type =='add'">
                    <i-step title="基本信息"
                            width="40%"></i-step>
                    <i-step title="数据描述"
                            width="40%"
                            :canStep="canStep"
                            @stepSelected="nextStep"></i-step>
                    <i-step title="字段映射配置"
                            width="17%"
                            :canStep="canStep"
                            @stepSelected="nextStep"></i-step>
                </i-steps>
                <i-steps :active.sync="stepWindowConfig.active"
                         style="margin-left: 14px;"
                         v-if="type=='view'">
                    <i-step title="基本信息"
                            width="40%"></i-step>
                    <i-step title="数据描述"
                            width="40%"></i-step>
                    <i-step title="字段映射配置"
                            width="17%"></i-step>
                </i-steps>
            </div>
            <div style="margin-top: 25px;">
                <i-form v-show="stepWindowConfig.active == 1">
                    <i-form-item label="选择数据来源"
                                 :required="true"
                                 v-if="type=='add'">
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
                                 :required="true"
                                 v-if="type=='add'&&chooseType=='2'">
                        <i-button type="blue"
                                  @click="showResourceList"
                                  style="margin-right: 10px;">选择资源</i-button>
                    </i-form-item>

                    <div v-if="this.resourceSelectId!==''&&this.resourceNameShow==true&&this.chooseType == '2'&&this.failMessage==''&&type=='add'"
                         class='fileState'>
                        <span class='iconPic'></span>
                        <span class='fs'>{{chooseFileItem.fileName}}</span>
                        <span class="rightPic"></span>
                    </div>

                    <i-form-item label="选择文件"
                                 :required="true"
                                 v-if="type=='add'&&chooseType=='1'">
                        <div style="display:inline-block">
                            <file-uploader v-model="uploadConfig.files"
                                           :multiple="false"></file-uploader>
                        </div>
                    </i-form-item>
                    <div v-if="tipFlag"
                         class="tiptxt">{{tipTXT}}</div>
                    <i-form-item :required="true"
                                 label="数据名称"
                                 style="margin-top: -13px;">
                        <i-inputbox :maxlength=20
                                    v-model="dataMetaFieldConfig.form.metaInfoVo.metaInfo.metaName"
                                    :readonly="readonly"></i-inputbox>
                    </i-form-item>

                    <i-form-item label="数据规范"
                                 :required="true">
                        <tree-select :selectStyle="standardTreeSelectConfig.selectStyle"
                                     :api="standardTreeSelectConfig.api"
                                     v-if="type=='add'"
                                     :hasSearch="true"
                                     addChildren="standardInfoList"
                                     :treeStyleConfig="{leafIcon:'&#xe934;'}"
                                     v-model="dataMetaFieldConfig.form.metaInfoVo.metaInfo.standardInfoId">
                        </tree-select>
                        <i-inputbox v-model="dataMetaFieldConfig.form.metaInfoVo.metaInfo.standardInfoId"
                                    v-if="type=='view'"
                                    :readonly="readonly"></i-inputbox>
                    </i-form-item>
                    <i-form-item label="资源目录"
                                 :required="true">
                        <tree-select :selectStyle="sourceTreeSelectConfig.selectStyle"
                                     :api="sourceTreeSelectConfig.api"
                                     v-if="type=='add'"
                                     :hasSearch="true"
                                     :treeStyleConfig="{leafIcon:'&#xe92f;'}"
                                     v-model="dataMetaFieldConfig.form.metaInfoVo.metaInfo.themeId">
                        </tree-select>
                        <i-inputbox v-model="dataMetaFieldConfig.form.metaInfoVo.metaInfo.themeId"
                                    v-if="type=='view'"
                                    :readonly="readonly"></i-inputbox>
                    </i-form-item>

                    <i-form-item :required="true"
                                 label="数据源">
                        <i-select width="100%"
                                  panel-height="150px"
                                  v-model="dataMetaFieldConfig.form.metaInfoVo.metaInfo.dataSourceId"
                                  v-if="type=='add'">
                            <i-option v-for="item in selectConfig.sourceInfoOptions"
                                      :key="item.id"
                                      :value="item.id"
                                      :label="item.sourceName">
                            </i-option>
                        </i-select>
                        <i-inputbox v-model="dataMetaFieldConfig.viewForm.sourceName"
                                    :readonly="true"
                                    v-if="type=='view'"></i-inputbox>
                    </i-form-item>

                    <i-form-item :required="true"
                                 label="GIS坐标系">
                        <i-select width="100%"
                                  panel-height="150px"
                                  v-model="dataMetaFieldConfig.form.metaInfoVo.metaInfo.srid"
                                  v-if="type=='add'">
                            <i-option v-for="item in selectConfig.gisOptions"
                                      :key="item.value"
                                      :value="item.value"
                                      :label="item.label">
                            </i-option>
                        </i-select>
                        <i-inputbox v-model="gridName"
                                    :readonly="true"
                                    v-if="type=='view'"></i-inputbox>
                    </i-form-item>

                    <i-form-item label="表名"
                                 v-if="type=='view'">
                        <i-inputbox v-model="dataMetaFieldConfig.viewForm.tableName"
                                    :readonly="true"></i-inputbox>
                    </i-form-item>
                    <i-form-item label="经度"
                                 :required="true"
                                 v-if="extraSelectShow">
                        <!-- 后台数据定的xField -->
                        <i-select v-model="dataMetaFieldConfig.form.metaInfoVo.fileFieldVo.xField"
                                  width="100%"
                                  panelHeight="200px"
                                  :disabled="readonly">
                            <i-option v-for="item in selectConfig.fieldOptions"
                                      :key="item.fieldName"
                                      :value="item.fieldName"
                                      :label="item.fieldName">
                            </i-option>
                        </i-select>
                    </i-form-item>
                    <i-form-item label="纬度"
                                 :required="true"
                                 v-if="extraSelectShow">
                        <i-select v-model="dataMetaFieldConfig.form.metaInfoVo.fileFieldVo.yField"
                                  width="100%"
                                  panelHeight="200px"
                                  :disabled="readonly">
                            <i-option v-for="item in selectConfig.fieldOptions"
                                      :key="item.fieldName"
                                      :value="item.fieldName"
                                      :label="item.fieldName">
                            </i-option>
                        </i-select>
                    </i-form-item>
                    <i-form-item style="line-height: 80px;"
                                 label="数据描述">
                        <i-textarea style="height: 80px;"
                                    v-model="dataMetaFieldConfig.form.metaInfoVo.metaInfo.metaDes"
                                    :readonly="readonly"></i-textarea>
                    </i-form-item>
                </i-form>
                <i-form v-show="stepWindowConfig.active == 2">
                    <div v-if="type=='add'||type=='view'"
                         class='title'>基本描述信息</div>
                    <div class="baseInfo"
                         v-if="type=='add'||type=='view'">
                        <div class="info-row"
                             v-for="(item,index) in type=='view'?shpBaseInfo:shpBaseInfo.slice(2)"
                             :key="item.name">
                            <div class="info-name">{{item.name}}</div>
                            <div :class="{'info-value':true,'no-border':index>1?false:true}">{{item.value}}</div>
                        </div>
                    </div>
                    <div class='title'>描述项信息</div>
                    <toggle-box :title="itemArr.name"
                                v-for="(itemArr) in dataMetaFieldConfig.descGroupArr"
                                v-if="dataMetaFieldConfig.descGroupArr.length>0"
                                :key="itemArr.name">
                        <p v-if="itemArr.describeInfoList.length==0">暂无数据</p>
                        <table class="table"
                               v-if="itemArr.describeInfoList.length>0">
                            <thead>
                                <tr>
                                    <th scope="col"
                                        style="width: 33%;"
                                        :key='i'
                                        v-for="i in dataMetaFieldConfig.descTableConfig.title">{{i}}</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="(item) in itemArr.describeInfoList"
                                    :key="item.name">
                                    <td>{{item.name}}</td>
                                    <td>
                                        <i-inputbox v-model="item.describeValue"
                                                    v-if="type=='add'"
                                                    :readonly="readonly"></i-inputbox>
                                        <span style="display: inline-block;height: 30px;line-height: 30px;"
                                              v-if="type=='view'">{{item.describeValue}}</span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </toggle-box>
                    <no-data v-if="dataMetaFieldConfig.descGroupArr.length==0"></no-data>
                </i-form>
                <i-form v-show="stepWindowConfig.active == 3">
                    <div v-if="type=='add'"
                         class='tip'>
                        <span style="display:inline-block;color:red;font-family: iconfont;font-size: 11px;">★</span> 标记的字段为必填项 </div>
                    <table class="table">
                        <thead>
                            <tr>
                                <th scope="col"
                                    style="50%"
                                    :key='i'
                                    v-for="i in type=='add'?dataMetaFieldConfig.fieldTableConfig.title:dataMetaFieldConfig.fieldTableConfig.titleView">{{i}}</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(item,index) in dataMetaFieldConfig.form.metaInfoVo.stFieldInfoList "
                                :key="item.fieldName">
                                <td v-if="type=='add'">
                                    <span style="display:inline-block;color:red;font-family: iconfont;font-size: 11px;"
                                          v-if="item.type=='5'">★</span>
                                    {{item.fieldName}}——{{item.chineseName}}</td>
                                <td class='shpField'
                                    v-if="type=='view'">{{item}}</td>
                                <td style="position:relative;">
                                    <i-select v-model="selectConfig.standardFieldSelect[index]"
                                              @change="changeField(index)"
                                              v-if="type=='add'">
                                        <i-option v-for="i in selectConfig.standardFieldOptions[index]"
                                                  :class="{'colorSelect':i.selectState == true}"
                                                  :key="i.id"
                                                  :value="i.fieldName"
                                                  :label="i.fieldName">
                                        </i-option>
                                    </i-select>
                                    <span style="display: inline-block;height: 30px;line-height: 30px;"
                                          v-if="type=='view'">{{selectConfig.standardFieldSelect[index]}}</span>
                                    <span style="color:red;font-size:10px;position:absolute;top:10px;right:5px;"
                                          v-if="type=='add'&& item.type
                                                &&shpCheckArr[index]&& shpCheckArr[index].type
                                                &&item.type!==shpCheckArr[index].type">
                                        类型不一致
                                    </span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <no-data v-if="dataMetaFieldConfig.form.metaInfoVo.stFieldInfoList.length==0"></no-data>
                </i-form>
            </div>
            <div slot="footer"
                 style="float:right;margin-right:20px;">
                <i-button type="primary"
                          :disabled="stepWindowConfig.active <= 1"
                          @click="stepWindowConfig.active--">上一步</i-button>
                <i-button type="primary"
                          :disabled="stepWindowConfig.active >= 3"
                          @click="nextStep">下一步</i-button>
                <i-button type="primary"
                          @click="submit"
                          :disabled="canSubmit"
                          v-if="(type=='add'&&stepWindowConfig.active == 3)||(type=='add'&&stepWindowConfig.active == 3)">提交</i-button>
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
                 :message="tooltipConfig.tooltipMessage"></tooltip>

    </div>
</template>

<script>
import IWindow from "../../components/common/IWindow"
import IButton from "../../components/common/IButton"
import Tooltip from "../../components/common/OperationStatusTooltip"
import grid from "../../components/common/grid"
import IInputbox from "../../components/common/IInputbox"
import ISelect from "../../components/DmComponent/ISelect"
import IOption from "../../components/DmComponent/IOption"
import IRadio from "../../components/common/IRadio"
import Checkbox from "../../components/common/Checkbox"
import IForm from "../../components/common/IForm"
import IFormItem from "../../components/common/IFormItem"
import TreeSelect from "../../components/common/TreeSelect"
import ITransfer from "../../components/DmComponent/ITransfer"
import FileUploader from "../../components/common/FileUploader"
import ISteps from "../../components/common/ISteps"
import IStep from "../../components/common/IStep"
import ITextarea from "../../components/common/ITextarea"
import ToggleBox from "../../components/common/ToggleBox"
import noData from "../../components/layout/noData"
import resourceListWin from "../SystemConfigManage/DataSpecificationManage/resourceListWin"

export default {
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
            getFieldSingleApi: './api/metaInfo/getField?metaInfoId=',
            getDescribeSingleApi: './api/metaInfo/getDescribe?metaInfoId=',
            getMetaAttributeInfoSingleApi: './api/metaAttributeInfo/getByWhere',
            // 获取数据源ID接口
            sourceInfoSelectApi: './api/sourceInfo/getAll',
            // 获取数据规范接口
            standardInfoSelectApi: './api/standardInfo/getAll',
            //获取数据规范树结构接口
            standardInfoSelectTreeApi: './api/theme/getThemeStandardInfo',
            // 获取组别描述数据接口
            getDescGroupApi: './api/standardInfo/selectDescribeInfoByStandardId?id=',
            // 获取shp文件解析的字段接口
            getShpFieldApi: './api/metaInfo/getFileField',
            //上传文件为execl时获取经度纬度接口
            getCoordinateApi: './api/metaInfo/getExcelField?fileInfoId=',
            // 获取shp文件解析的已匹配字段信息接口
            getShpFieldMatchApi: './api/metaFieldInfo/getMatchField',

            //选择资源列表的文件的是否存在校验接口
            checkResourceFileApi: "./api/fileDownload/isFileExist/",
            // 获取某个规范文件定义字段接口
            getStandardFieldApi: './api/fieldInfo/getByWhere',
            // 提交数据表单接口
            saveMetaDataApi: './api/metaInfo/saveMetaInfo',
            //名字重复校验
            checkMetaNameApi: './api/metaInfo/isMetaNameExist?metaName=',
            readonly: false,
            canStep: false,
            freshNum: 10,
            isShow: this.visible,
            canSubmit: false,
            tipFlag: false,
            tipTXT: '导入失败！',
            //数据来源选择
            chooseType: '',
            //是否获取调用shp文件解析的字段接口
            ajaxFlag: true,
            //规范数据
            standardInfoSelectArr: [],
            width: "820px",
            height: "560px",
            colorTip: true,
            tooltipConfig: {
                tooltipShow: false,
                tooltipType: "",
                tooltipMessage: ""
            },
            uploadConfig: {
                files: [],
            },
            //资源目录选择项的信息
            resourceSelectId: '',
            chooseFileItem: '',
            resourceNameShow: true,
            // 步骤弹窗
            stepWindowConfig: {
                show: false,
                active: 1
            },
            //下拉框
            selectConfig: {
                sourceInfoOptions: [],
                standardInfoOptions: [],
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
                //选择后的规范字段
                standardFieldSelect: [],
                //字段集合
                standardFieldOptions: [],
                //execl 坐标
                fieldOptions: [],
            },

            //判断上传的文件是shp文件还是execl,execl文件额外显示经度纬度下拉框
            extraFlag: false,
            extraSelectShow: false,
            //shp文件解析的基本坐标信息

            shpBaseInfo: [
                {
                    name: '上传人',
                    value: ''
                },
                {
                    name: '上传时间',
                    value: ''
                },
                {
                    name: '最大纬度',
                    value: ''
                },
                {
                    name: '最小纬度',
                    value: ''
                },
                {
                    name: '最大经度',
                    value: ''
                },
                {
                    name: '最小经度',
                    value: ''
                }
            ],
            //shp文件解析的字段信息存储
            shpBaseArr: [],
            //字段匹配后的ship对应字段的详细信息存储
            shpCheckArr: [],
            // 数据规范树形下拉框
            standardTreeSelectConfig: {
                api: "./api/theme/getThemeStandardInfo",
                field: "name",
                selectStyle: {
                    width: "100%",
                    height: "35px",
                    float: "left"
                }
            },
            // 资源目录树形下拉框
            sourceTreeSelectConfig: {
                api: "./api/theme/getAll",
                field: "name",
                selectStyle: {
                    width: "100%",
                    height: "35px",
                    float: "left"
                }
            },
            // 数据配置
            dataMetaFieldConfig: {
                type: "", //add modify view 分别表示新增，修改以及查看
                show: false,
                parent: this,
                title: "",
                descTableConfig: {
                    title: ['描述项名称', '描述内容']
                },
                fieldTableConfig: {
                    title: ['规范字段名——中文名', '文件字段名'],
                    titleView: ['字段名称', '中文名']
                },
                height: "500px",
                width: "600px",
                //资源选择文件错误状态信息
                failMessage: '',
                //描述项
                descGroupArr: [],
                ShpFiledId: '',
                //文件解析后查找已存在的字段校验信息
                shpFieldMatchArr: {},
                //校验前ajax获取的右侧规范字段列表
                standardFieldArr: [],
                //获取单个数据信息的数据
                viewForm: {
                    sourceName: '',
                    tableName: ''
                },
                //提交表单
                form: {
                    metaInfoVo: {
                        metaInfo: {
                            metaName: '',
                            metaDes: '',
                            dataSourceId: '',
                            standardInfoId: '',
                            themeId: '',
                            fileInfoId: '',
                            srid: ''
                        },
                        fileFieldVo: {
                            xField: '',
                            yField: ''
                        },
                        metaAttributeInfo: null,
                        //描述项
                        metaDescribeInfoList: [],
                        //规范字段列表
                        stFieldInfoList: [],
                        //源文件的解析字段
                        sourceFieldInfoList: [],
                        //校验完成后的对应列表
                        matchMap: []
                    }
                },
            },
            // 查看资源弹窗
            resourceListWin: {
                show: false,
                title: '',
                entityId: '',
                type: '',
            }

        }
    },
    computed: {
        gridName () {
            if (this.dataMetaFieldConfig.form.metaInfoVo.metaInfo.srid == 4490) {
                return "CGCS2000"
            } else if (this.dataMetaFieldConfig.form.metaInfoVo.metaInfo.srid == 2435) {
                return "深圳独立坐标系"
            } else if (this.dataMetaFieldConfig.form.metaInfoVo.metaInfo.srid == 4326) {
                return 'WGS84'
            }

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
        changeField (i) {
            //字段校验表格右侧列数据
            this.dataMetaFieldConfig.form.metaInfoVo.sourceFieldInfoList = [];
            this.selectConfig.standardFieldSelect.forEach((item, index) => {
                var flag = false;
                this.dataMetaFieldConfig.standardFieldArr.forEach((itemInner) => {
                    //   对应规范名的字段列表
                    if (itemInner.fieldName == item) {
                        this.dataMetaFieldConfig.form.metaInfoVo.sourceFieldInfoList.push(itemInner);
                        flag = true;
                    }
                })
                if (flag == false) {
                    this.dataMetaFieldConfig.form.metaInfoVo.sourceFieldInfoList.push('');
                }
            })
            if (this.dataMetaFieldConfig.form.metaInfoVo.sourceFieldInfoList.length == 0) {
                this.dataMetaFieldConfig.form.metaInfoVo.sourceFieldInfoList = this.shpBaseArr;
            } else {
                this.dataMetaFieldConfig.form.metaInfoVo.sourceFieldInfoList = this.dataMetaFieldConfig.form.metaInfoVo.sourceFieldInfoList.filter((item, index) => {
                    return item !== '';
                })
            }

            var stFieldArr = [];
            //字段校验表格左侧列展示
            stFieldArr = this.dataMetaFieldConfig.form.metaInfoVo.stFieldInfoList.map((item) => {
                return item.fieldName
            })
            this.dataMetaFieldConfig.form.metaInfoVo.matchMap = [];
            //字段校验选择后一一对应项数据
            stFieldArr.forEach((item, index) => {
                var obj = {};
                obj[item] = this.selectConfig.standardFieldSelect[index];
                this.dataMetaFieldConfig.form.metaInfoVo.matchMap.push(obj);
            });
            //匹配后的SHP文件详细字段集合信息
            this.shpCheckArr = Array(this.shpBaseArr.length).fill({ type: '' });

            this.selectConfig.standardFieldSelect.forEach((item, index) => {
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
            this.dataMetaFieldConfig.form.metaInfoVo.sourceFieldInfoList.forEach((item, index) => {
                this.selectConfig.standardFieldOptions.forEach((itemArr) => {
                    itemArr.forEach((itemInner) => {
                        itemInner.selectState = false;
                    })
                })
            })
            //第二部把被选择的标示为true，在下拉框选项中颜色标注为蓝色
            this.dataMetaFieldConfig.form.metaInfoVo.sourceFieldInfoList.forEach((item, index) => {
                this.selectConfig.standardFieldOptions.forEach((itemArr) => {
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
            this.resourceSelectId = '';
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
        // 表单非空验证
        validateForm () {
            let execlFlag;
            if (this.extraFlag == false) {
                execlFlag = true;
            } else {
                if (this.dataMetaFieldConfig.form.metaInfoVo.fileFieldVo.xField !== ''
                    && this.dataMetaFieldConfig.form.metaInfoVo.fileFieldVo.yField !== '') {
                    execlFlag = true;
                } else {
                    execlFlag = false;
                }
            }
            if (this.uploadConfig.files.length == 0 && this.resourceSelectId == '') {
                this.showTooltip('failed', '请上传文件或者选择资源文件');
                return false;
            } else if (this.dataMetaFieldConfig.form.metaInfoVo.metaInfo.dataSourceId == ''
                || this.dataMetaFieldConfig.form.metaInfoVo.metaInfo.standardInfoId == ''
                || this.dataMetaFieldConfig.form.metaInfoVo.metaInfo.metaName == ''
                || this.dataMetaFieldConfig.form.metaInfoVo.metaInfo.themeId == ''
                || this.dataMetaFieldConfig.form.metaInfoVo.metaInfo.srid == ''
                || !execlFlag) {
                this.showTooltip('failed', '请填写完整配置信息');
                return false;
            } else if (this.dataMetaFieldConfig.form.metaInfoVo.metaInfo.metaName.match(/\s/)) {
                this.showTooltip('failed', '名字中不能包含空格');
                return false;
            } else if (this.failMessage !== '') {
                this.showTooltip('failed', this.failMessage);
                return false;
            }
            return true;
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
        nextStep () {
            if (this.stepWindowConfig.active == 1 && this.type == 'add') {
                if (!this.validateForm()) {
                    return;
                }
                this.$http.get(this.checkMetaNameApi + this.dataMetaFieldConfig.form.metaInfoVo.metaInfo.metaName).then(
                    (res) => {
                        if ('success' == res.body.status) {
                            let checkNameState = res.body.content;
                            if (checkNameState == false) {
                                if (this.chooseType == '1') {
                                    var index = this.uploadConfig.files[0].url.lastIndexOf("\/");
                                    this.dataMetaFieldConfig.ShpFiledId = this.uploadConfig.files[0].url.substring(index + 1, this.uploadConfig
                                        .files[0].url.length);
                                    this.dataMetaFieldConfig.form.metaInfoVo.metaInfo.fileInfoId = this.dataMetaFieldConfig.ShpFiledId;
                                } else if (this.chooseType == '2') {
                                    this.dataMetaFieldConfig.form.metaInfoVo.metaInfo.fileInfoId = this.resourceSelectId;
                                }

                                this.canStep = true;
                                if (this.ajaxFlag == true) {
                                    this.getShpField().then(this.getShpFieldMatch).then(this.getStandardField);
                                }
                            } else {
                                this.showTooltip('failed', '数据名称已存在');
                            }
                        }
                    },
                    (res) => {
                        this.showTooltip("failed", "服务器异常,请刷新后重试");
                    }
                )

            } else if (this.stepWindowConfig.active == 2 && this.type == 'add') {
                this.stepWindowConfig.active++;
            } else if (this.type == 'view' || this.type == 'modify') {
                this.stepWindowConfig.active++;
            }
        },

        //上传文件为execl时获取经度纬度信息
        getCoordinate (info) {
            let id;
            if (this.chooseType == '1') {
                let index = info[0].url.lastIndexOf("\/");
                this.dataMetaFieldConfig.ShpFiledId = info[0].url.substr(index + 1);
                id = info[0].url.substr(index + 1);
            } else if (this.chooseType == '2') {
                id = this.resourceSelectId;
            }

            this.$http.get(this.getCoordinateApi + id).then(
                (res) => {
                    this.selectConfig.fieldOptions = res.body.content;
                },
                (res) => {
                    this.showTooltip('failed', '服务器异常,请刷新后重试');
                })
        },
        //获取单个数据信息
        //获取单个数据基本信息
        getMateDateSingle () {
            this.$http.get(this.getMateDateSingleApi + this.entityId).then(
                (res) => {
                    var clgInfo = res.body.content;
                    this.dataMetaFieldConfig.form.metaInfoVo.metaInfo = {
                        metaName: clgInfo.metaName,
                        metaDes: clgInfo.metaDes,
                        dataSourceId: clgInfo.dataSourceId,
                        standardInfoId: clgInfo.standardInfo.name,
                        fileInfoId: clgInfo.fileInfoId,
                        srid: clgInfo.srid,
                        themeId: clgInfo.theme.name
                    };
                    this.dataMetaFieldConfig.viewForm = {
                        sourceName: clgInfo.sourceInfo.sourceName,
                        tableName: clgInfo.tableName,
                    }
                },
                (res) => {
                    this.showTooltip('failed', '服务器异常,请刷新后重试');
                })
        },
        //获取单个数据规范信息
        getFieldSingle () {
            this.$http.get(this.getFieldSingleApi + this.entityId).then(
                (res) => {
                    var clgInfo = res.body.content;
                    this.dataMetaFieldConfig.form.metaInfoVo.stFieldInfoList = clgInfo.map((item) => {
                        return item.fieldName
                    })
                    this.selectConfig.standardFieldSelect = clgInfo.map((item) => {
                        return item.chineseName
                    })
                },
                (res) => {
                    this.showTooltip('failed', '服务器异常,请刷新后重试');
                })
        },
        //获取单个数据的描述信息
        getDescribeSingle () {
            this.$http.get(this.getDescribeSingleApi + this.entityId).then(
                (res) => {
                    var clgInfoArr = [];
                    if (res.body.status == 'success') {
                        res.body.content.forEach((itemArr, index) => {
                            clgInfoArr.push(itemArr);
                        });
                    }
                    this.dataMetaFieldConfig.descGroupArr = clgInfoArr;
                },
                (res) => {
                    this.showTooltip('failed', '服务器异常,请刷新后重试');
                })
        },

        //获取单个数据的字段校验信息
        getMetaAttributeInfoSingle () {
            let parmas = {
                metaInfoId: this.entityId
            }
            this.$http.post(this.getMetaAttributeInfoSingleApi, parmas).then(
                (res) => {
                    if (res.body.status == 'success') {
                        let clgInfo = res.body.content[0];
                        this.shpBaseInfo.forEach((item) => {
                            switch (item.name) {
                                case '上传人':
                                    item.value = clgInfo.uploadName;
                                    break;
                                case '上传时间':
                                    item.value = clgInfo.uploadDate;
                                    break;
                                case '最大纬度':
                                    item.value = clgInfo.maxY;
                                    break;
                                case '最小纬度':
                                    item.value = clgInfo.minY;
                                    break;
                                case '最大经度':
                                    item.value = clgInfo.maxX;
                                    break;
                                case '最小经度':
                                    item.value = clgInfo.minX;
                                    break;
                            }
                        })
                    }
                },
                (res) => {
                    this.showTooltip('failed', '服务器异常,请刷新后重试');
                })
        },
        //获取数据源
        getSourceInfo () {
            this.$http.get(this.sourceInfoSelectApi).then(
                (res) => {
                    var clgInfo = res.body.content;
                    this.selectConfig.sourceInfoOptions = clgInfo;
                },
                (res) => {
                    this.showTooltip('failed', '服务器异常,请刷新后重试');
                })
        },
        //获取组别描述项
        getDescGroup () {
            this.$http.get(this.getDescGroupApi + this.dataMetaFieldConfig.form.metaInfoVo.metaInfo.standardInfoId).then(
                (res) => {
                    var clgInfoArr = [];
                    res.body.content.groupInfoList.forEach((itemArr, index) => {
                        clgInfoArr.push(itemArr);
                    });
                    this.dataMetaFieldConfig.descGroupArr = clgInfoArr;
                },
                (res) => {
                    this.showTooltip('failed', '服务器异常,请刷新后重试');
                })
        },
        //获取数据规范
        getStandardInfo () {
            this.$http.get(this.standardInfoSelectApi).then(
                (res) => {
                    const clgInfo = res.body.content;
                    this.selectConfig.standardInfoOptions = clgInfo;
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

        //获取shp文件的解析字段已配对信息
        getShpFieldMatch () {
            let parmas = {
                standardInfoId: this.dataMetaFieldConfig.form.metaInfoVo.metaInfo.standardInfoId,
                fieldInfoList: this.shpBaseArr
            };
            return this.$http.post(this.getShpFieldMatchApi, parmas).then(
                (res) => {
                    const clgInfo = res.body.content;
                    this.dataMetaFieldConfig.shpFieldMatchArr = clgInfo;
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
                parmas = {
                    fileInfoId: this.dataMetaFieldConfig.ShpFiledId,
                    xField: this.dataMetaFieldConfig.form.metaInfoVo.fileFieldVo.xField,
                    yField: this.dataMetaFieldConfig.form.metaInfoVo.fileFieldVo.yField
                }
            } else if (this.chooseType == '2') {
                parmas.fileInfoId = this.resourceSelectId;
            }
            return this.$http.post(this.getShpFieldApi, parmas).then(
                (res) => {
                    if (res.body.status == 'success') {
                        this.stepWindowConfig.active++;
                        //shp文件解析字段
                        let fieldInfo = res.body.content.fieldInfoList;

                        this.shpBaseArr = this.objDeepCopy(fieldInfo);
                        //shp文件基本信息
                        this.dataMetaFieldConfig.form.metaInfoVo.metaAttributeInfo = res.body.content.metaAttributeInfo;
                        this.shpBaseInfo.forEach((item) => {
                            switch (item.name) {
                                case '最大纬度':
                                    item.value = this.dataMetaFieldConfig.form.metaInfoVo.metaAttributeInfo.maxY;
                                    break;
                                case '最小纬度':
                                    item.value = this.dataMetaFieldConfig.form.metaInfoVo.metaAttributeInfo.minY;
                                    break;
                                case '最大经度':
                                    item.value = this.dataMetaFieldConfig.form.metaInfoVo.metaAttributeInfo.maxX;
                                    break;
                                case '最小经度':
                                    item.value = this.dataMetaFieldConfig.form.metaInfoVo.metaAttributeInfo.minX;
                                    break;
                            }
                        })
                        this.shpCheckArr = [];
                        this.shpCheckArr = Array(this.shpBaseArr.length).fill();
                        // this.ajaxFlag = false;
                        //新增一个是否被选择标识字段
                        this.dataMetaFieldConfig.standardFieldArr = fieldInfo.map((item) => {
                            item.selectState = false;
                            return item;
                        });

                        this.selectConfig.standardFieldOptions = Array(this.selectConfig.standardFieldSelect.length).fill(fieldInfo)
                            .map((itemArr, index) => {
                                var newItemArr = itemArr.filter((item) => {
                                    if (item.hasOwnProperty('length')) {
                                        //如果拥有length属性 规范里的length必须保证比ship文件解析出来的大
                                        var flag = false;
                                        if (this.dataMetaFieldConfig.form.metaInfoVo.stFieldInfoList[index].hasOwnProperty('length')) {
                                            if (parseInt(item.length) < parseInt(this.dataMetaFieldConfig.form.metaInfoVo.stFieldInfoList[index].length)) {
                                                flag = true;
                                            } else {
                                                flag = false;
                                            }
                                        } else {
                                            flag = true;
                                        }
                                        //type'5'的字段类型必须是'5'
                                        if (item.type === '5') {
                                            return this.dataMetaFieldConfig.form.metaInfoVo.stFieldInfoList[index].type == item.type && flag
                                        } else {
                                            return this.dataMetaFieldConfig.form.metaInfoVo.stFieldInfoList[index].type !== '5' && flag
                                        }
                                    } else {
                                        if (item.type === '5') {
                                            return this.dataMetaFieldConfig.form.metaInfoVo.stFieldInfoList[index].type == item.type
                                        } else {
                                            return this.dataMetaFieldConfig.form.metaInfoVo.stFieldInfoList[index].type !== '5'
                                        }
                                    }
                                })
                                return newItemArr
                            });
                        this.failMessage = '';

                    } else {
                        this.failMessage = res.body.message;
                        this.showTooltip('failed', res.body.message);
                    }

                },
                (res) => {
                    this.showTooltip('failed', '服务器异常,请刷新后重试');
                })
        },

        //获取某规范的数据字段
        getStandardField () {
            this.$http.post(this.getStandardFieldApi, { standardInfoId: this.dataMetaFieldConfig.form.metaInfoVo.metaInfo.standardInfoId }).then(
                (res) => {
                    if (res.body.status == 'success') {
                        var info = res.body.content;
                        this.dataMetaFieldConfig.form.metaInfoVo.stFieldInfoList = info;
                        this.selectConfig.standardFieldSelect = Array(info.length).fill('');
                        if (this.dataMetaFieldConfig.shpFieldMatchArr !== {}) {
                            this.dataMetaFieldConfig.form.metaInfoVo.stFieldInfoList.forEach((item, index) => {
                                Object.entries(this.dataMetaFieldConfig.shpFieldMatchArr).forEach((i, inIndex) => {
                                    if (item.fieldName == i[0]) {
                                        this.selectConfig.standardFieldSelect[index] = i[1];
                                    }
                                })
                            })
                        }
                    } else {
                        this.showTooltip('failed', res.body.message);
                    }

                },
                (res) => {
                    this.showTooltip('failed', '服务器异常,请刷新后重试');
                })
        },
        // 提交数据表单
        saveMetaData () {
            this.$http.post(this.saveMetaDataApi, this.dataMetaFieldConfig.form).then(
                (res) => {
                    if (res.body.status == "success") {
                        this.$emit('freshGrid');
                        this.showTooltip("success", "提交成功");
                        this.isShow = false;
                    } else {
                        this.showTooltip("failed", "提交失败" + res.body.content);
                    }
                },
                (res) => {
                    this.showTooltip('failed', '服务器异常,请刷新后重试');
                }
            )
        },
        //获取规范信息
        getStandardInfoAll () {
            this.$http.get(this.standardInfoSelectTreeApi).then(
                (res) => {
                    if (res.body.status == "success") {
                        this.standardInfoSelectArr = res.body.content;
                    } else {
                        this.showTooltip("failed", "提交失败" + res.body.content);
                    }
                },
                (res) => {
                    this.showTooltip('failed', '服务器异常,请刷新后重试');
                })
        },
        //match配对描述项
        matchDesc () {
            //描述项配置结果
            this.dataMetaFieldConfig.form.metaInfoVo.metaDescribeInfoList = [];
            this.dataMetaFieldConfig.descGroupArr.forEach((itemArr, index) => {
                itemArr.describeInfoList.forEach(item => {
                    let obj = {
                        describeInfoId: item.id,
                        describeValue: item.describeValue
                    };
                    if (item.describeValue !== '' && item.describeValue !== undefined) {
                        this.dataMetaFieldConfig.form.metaInfoVo.metaDescribeInfoList.push(obj)
                    }
                })
            })
        },
        // 修改用户所属机构
        submit () {
            this.freshNum = 10;
            this.changeField();
            this.matchDesc();
            var flag = true;
            this.dataMetaFieldConfig.form.metaInfoVo.stFieldInfoList.some((item, i) => {
                if (item.type == "5") {
                    if (this.selectConfig.standardFieldSelect[i] == '') {
                        flag = false;
                        this.showTooltip('failed', '请完成校验(★标记的字段)');
                        return true;
                    }
                }
            })
            // if (nextFlag == true) {
            //     var stFieldArr = this.dataMetaFieldConfig.form.metaInfoVo.sourceFieldInfoList;
            //     for (var i = 0; i < stFieldArr.length; i++) {
            //         for (var j = i + 1; j < stFieldArr.length; j++) {
            //             if ((stFieldArr[j].fieldName == stFieldArr[i].fieldName)&&stFieldArr[j].fieldName!=='') {
            //                 ++j;
            //                 this.showTooltip('failed', '存在相同字段');
            //                 return;
            //             }
            //         }
            //     }
            //     flag = true;
            // }
            if (flag == true) {
                var _this = this;
                this.canSubmit = true;
                this.saveMetaData();
                //刷新10次
                setInterval(() => {
                    if (this.freshNum > 0) {
                        --this.freshNum;
                        this.$emit('freshGrid', false);
                    }
                }, 5000)
            }
        },
    },
    mounted () {
        if (document.querySelector('file-info')) {
            this.a = document.querySelector('file-info').innerHTML;
        }
    },
    watch: {
        visible (val) {
            this.isShow = val;
            if (val) {
                this.ajaxFlag = true;
                this.canSubmit = false;
            } else {
                this.ajaxFlag = false;
            }
        },
        isShow (val) {
            //   初始化
            this.stepWindowConfig.active = 1;
            this.canStep = false;
            this.dataMetaFieldConfig.form.metaInfoVo.metaInfo.dataSourceId = '';
            this.dataMetaFieldConfig.form.metaInfoVo.metaInfo.standardInfoId = '';
            this.selectConfig.gisSelect = '';
            //为true表示显示当前Window
            if (val) {
                //新增
                if (this.type == 'add') {
                    this.readonly = false;
                    this.tipFlag = false;
                    this.extraSelectShow = false;
                    this.getStandardInfoAll();
                    this.getSourceInfo();
                    this.getStandardInfo();
                    this.chooseType = '';
                    this.failMessage = '';
                    this.chooseFileItem = '';
                    this.dataMetaFieldConfig.form = {
                        metaInfoVo: {
                            metaInfo: {
                                metaName: '',
                                metaDes: '',
                                themeId: '',
                                dataSourceId: '',
                                standardInfoId: '',
                                fileInfoId: '',
                                srid: ''
                            },
                            fileFieldVo: {
                                xField: '',
                                yField: ''
                            },
                            //描述项
                            metaDescribeInfoList: [],
                            //源文件的解析字段
                            stFieldInfoList: [],
                            //校验选择后的右侧规范字段列表
                            sourceFieldInfoList: [],
                            //校验完成后的对应列表
                            matchMap: []
                        }
                    }
                    this.uploadConfig.files = [];
                }
                //修改
                else if (this.type == 'modify') {
                    this.getMateDateSingle();
                    this.getFieldSingle();
                    this.getDescribeSingle();
                    this.readonly = false;
                }
                //查看
                else if (this.type == 'view') {
                    this.readonly = true;
                    this.getMateDateSingle();
                    this.getFieldSingle();
                    this.getDescribeSingle();
                    this.getMetaAttributeInfoSingle();
                }
            } else {
                //通过向父组件传递事件的方式修改visible属性所对应的变量的值
                this.$emit("update:visible", val);
            }
        },
        'dataMetaFieldConfig.form.metaInfoVo.metaInfo': {
            handler () {
                if ('add' == this.type) {
                    let form = this.dataMetaFieldConfig.form.metaInfoVo.metaInfo;
                    for (let idx in form) {
                        if (null == form[idx] || '' == form[idx]) {
                            this.canStep = false;
                        }
                    }
                }
            },
            deep: true
        },

        'dataMetaFieldConfig.form.metaInfoVo.metaInfo.standardInfoId': {
            handler (val) {
                this.standardInfoSelectArr.forEach(item => {
                    if (item.hasOwnProperty('standardInfoList')) {
                        item.standardInfoList.forEach(i => {
                            if (i.id == val) {
                                this.dataMetaFieldConfig.form.metaInfoVo.metaInfo.themeId = item.id;
                            }
                        })
                    }
                })
                // 监控规范选择是否变化，描述项跟随刷新
                if (this.isShow == true && this.type == 'add') {
                    this.ajaxFlag = true;
                    this.getDescGroup();
                    this.getStandardField();
                }
            }
        },
        'uploadConfig.files': {
            handler (val) {
                this.extraFlag = false;
                this.extraSelectShow = false;
                if (val[0] && val[0].name && val[0].url && val[0].name.length > 0 && val[0].url.length > 0) {
                    const fileType = val[0].name.substr(val[0].name.lastIndexOf('.') + 1);
                    const index = this.uploadConfig.files[0].url.lastIndexOf("\/");
                    const id = this.uploadConfig.files[0].url.substring(index + 1, this.uploadConfig.files[0].url.length);
                    this.checkResourceFile(id);
                    if (fileType === 'xls' || fileType === 'xlsx') {
                        this.extraFlag = true;
                        this.extraSelectShow = true;
                        this.getCoordinate(val);
                    }
                }
                if (0 == val.length) {
                    this.canStep = false;
                }
            },
            deep: true
        },
        'chooseFileItem': {
            handler (val) {
                this.extraFlag = false;
                this.extraSelectShow = false;
                if (val) {
                    this.resourceListWin.show = false;
                    const fileType = val.fileName.substr(val.fileName.lastIndexOf('.') + 1);
                    if (fileType === 'xls' || fileType === 'xlsx') {
                        this.extraFlag = true;
                        this.extraSelectShow = true;
                        this.getCoordinate(val);
                    }
                }
            },
            deep: true
        },
        resourceSelectId (val) {
            if (val !== '') {
                this.checkResourceFile(val)
            }
        },
        chooseType (val) {
            this.failMessage = '';
            this.resourceSelectId = '';
            this.uploadConfig.files = [];
        }
    },
    components: {
        ITextarea,
        IWindow,
        IButton,
        Tooltip,
        grid,
        IInputbox,
        ISelect,
        IOption,
        Checkbox,
        IForm,
        IFormItem,
        TreeSelect,
        ITransfer,
        FileUploader,
        ISteps,
        IStep,
        ToggleBox,
        noData,
        IRadio,
        resourceListWin
    }
}

</script>

<style scoped lang="scss">
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
.fileBox {
    display: flex;
}
.tip {
    margin-left: 20px;
    font-size: 12px;
    color: #999;
}
.fileBox > span {
    width: 120px;
    text-align: right;
}
.title {
    width: calc(100% - 50px);
    margin: 10px auto;
    /* color: #336199; */
    line-height: 20px;
    font-size: 16px;
}
.baseInfo {
    box-sizing: border-box;
    width: calc(100% - 50px);
    margin: 10px auto;
    border: 1px solid #dcebf7;
    display: flex;
    flex-wrap: wrap;
}
.baseInfo .info-row {
    display: flex;
    width: 50%;
    height: 32px;
}
.info-row .info-name {
    color: #336199;
    background-color: #edf3f4;
    border-top: 1px solid #f7fbff;
    text-align: right;
    height: 32px;
    line-height: 32px;
    font-weight: 400;
    color: #667e99;
    width: 110px;
    padding-right: 10px;
    vertical-align: middle;
}
.info-row .info-value {
    width: calc(100% - 110px);
    border-top: 1px dotted #dcebf7;
    padding-left: 12px;
    height: 32px;
    line-height: 32px;
}
.info-row .no-border {
    border-top: none;
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
