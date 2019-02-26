<template>
    <i-window :visible.sync="isShow"
              :title="title"
              width="800px"
              height="500px">
        <div class="left">
            <div class="leftTop">
                <div class="pic"></div>
            </div>
            <div class="leftBottom"
                 v-if='detailData'>
                <div><span>联系人：</span><span>{{detailData.resource.approvename}}111</span></div>
                <div><span>联系电话：</span><span>{{detailData.metadata.tele}}</span></div>
                <div><span>地址：</span><span>{{detailData.department.address}}</span></div>
                <div><span>所属部门：</span><span>{{detailData.department.name}}</span></div>
            </div>
        </div>
        <div class="right">
            <div class="tip">
                资源详情
            </div>
            <div class="titleBox"
                 v-if='detailData'>
                <div class="title"><span>{{detailData.resource.aliasname}}</span><span>在线服务</span></div>
                <div class="count">申请次数&nbsp;{{detailData.resource.count}}</div>
                <div class='time'>{{date}}</div>
            </div>
            <div class="contain">
                <div class="textTop"
                     v-if='detailData'>
                    <div><span>摘要：</span><span>{{detailData.resource.abstractDesc}}</span></div>
                    <div><span>发布者：</span><span>{{detailData.resource.approvename}}</span></div>
                    <div><span>资源目录：</span><span>{{detailData.resource.themeName}}</span></div>
                    <div><span>关键词：</span><span>{{detailData.resource.keyword}}</span></div>
                    <div><span>发布日期：</span><span>{{date}}</span></div>
                    <div><span>服务类型：</span><span>{{detailData.resourceType.description}}</span></div>
                </div>
                <div class="textBottom"
                     v-if='detailData'>
                    <div><span>坐标系：</span><span>{{coordinate}}</span></div>
                    <div><span>服务名：</span><span>{{detailData.resource.name}}</span></div>
                    <div><span>服务别名：</span><span>{{detailData.resource.aliasname}}</span></div>
                    <div><span>服务版本：</span><span>{{detailData.metadata.typeVersion}}</span></div>
                </div>
            </div>
        </div>
        <div slot="footer"
             style="float:right;margin-right:20px;">
            <i-button type="primary"
                      @click="isShow = false">
                关闭
            </i-button>
        </div>
    </i-window>
</template>

<script>
import IWindow from "../../components/common/IWindow";
import IButton from "../../components/common/IButton";
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
        detailData: {
            type: Object
        }
    },
    data () {
        return {
            isShow: this.visible
        }
    },
    computed: {
        date () {
            let date = new Date(this.detailData.resource.publishdate).toLocaleString();
            date = date.substr(0, date.indexOf(' ')).replace(/\//g, '-')
            return date
        },
        coordinate () {
            let coordinate
            switch (this.detailData.resource.coordinateType) {
                case "EPSG:4490":
                    coordinate = 'CGCS2000'
                    break;
                case "EPSG:4326":
                    coordinate = 'WGS84'
                    break;
                case "EPSG:2435":
                    coordinate = '深圳独立坐标系'
                    break;
                default:
                    break;
            }
            return coordinate
        }
    },
    methods: {

    },
    components: {
        IWindow,
        IButton
    },
    watch: {
        visible (val) {
            this.isShow = val;
        },
        isShow (val) {
            //通过向父组件传递事件的方式修改visible属性所对应的变量的值
            this.$emit("update:visible", val);
        },
    }
}
</script>

<style scoped lang='scss'>
.left {
    float: left;
    width: 210px;
    .leftTop {
        width: 200px;
        height: 200px;
        padding: 5px;
        border: 1px solid #ebf0f8;
        .pic {
            width: 100%;
            height: 100%;
            background: url('../../assets/img/resource.png') no-repeat;
        }
    }
    .leftBottom {
        width: 210px;
        margin-top: 10px;
        padding: 10px 0 10px 0;
        border-top: 1px solid #e0e7f5;
        border-bottom: 1px solid #e0e7f5;
        div {
            width: 100%;
            height: 20px;
            span {
                display: inline-block;
                width: 140px;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                color: #666;
                font-family: '微软雅黑';
                font-size: 12px;
                &:first-child {
                    width: 70px;
                }
                &:nth-child(2) {
                    width: calc(100% - 70px);
                }
            }
        }
    }
}
@mixin txt {
    &:first-child {
        width: 110px;
        font-weight: bold;
        color: #666;
        display: inline-block;
        font-size: 14px;
        line-height: 22px;
    }
    &:nth-child(2) {
        color: #666;
        display: inline-block;
        font-size: 14px;
        line-height: 22px;
        width: calc(100% - 110px);
    }
}
.right {
    float: left;
    width: calc(100% - 210px);
    padding-left: 20px;
    box-sizing: border-box;
    .tip {
        width: 100%;
        background-color: #ebeff8;
        height: 30px;
        line-height: 30px;
        color: #1f95f1;
        font-size: 16px;
        padding-left: 10px;
    }
    .titleBox {
        margin-top: 20px;
        overflow: hidden;
        .title {
            float: left;
            width: 60%;
            height: 40px;
            span {
                &:first-child {
                    color: #333;
                    font-size: 24px;
                }
                &:nth-child(2) {
                    height: 22px;
                    line-height: 22px;
                    margin-bottom: 5px;
                    padding: 2px 6px;
                    margin-left: 5px;
                    vertical-align: middle;
                    text-align: center;
                    background-color: #ffba2f;
                    color: #ffffff;
                    font-size: 14px;
                }
            }
        }
        .count {
            float: left;
            width: 40%;
            height: 40px;
            padding-top: 10px;
            padding-right: 40px;
            text-align: right;
        }
        .time {
            color: #bbbbbb;
            font-size: 15px;
            margin-bottom: 10px;
        }
    }
    .contain {
        .textTop {
            padding: 8px 0;
            border-top: 2px solid #e0e7f5;
            div {
                width: 100%;
                height: 20px;
                span {
                    @include txt;
                }
            }
        }
        .textBottom {
            padding: 8px 0;
            border-top: 1px solid #e0e7f5;
            div {
                width: 100%;
                height: 20px;
                span {
                    @include txt;
                }
            }
        }
    }
}
</style>
