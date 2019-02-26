import vue from 'vue'

 String.prototype.SubStringNum = function(num){
    var strNew = '';
    if(this.length>(num+10)){
        strNew = this.substring(0,num) + '...'
        return strNew;
    }else{
        return this;
    }
}
// 日期过滤器，转化"XX年XX月XX日”为data
const dataFilter = str => {
    try{
        return str.replace('年','-').replace('月','-').replace('日','');
    }catch(e){
        return ''
    }
}
// 文件下载
// 下载文件方法
const funDownload = function (content, filename) {
    var eleLink = document.createElement('a');
    eleLink.download = filename;
    eleLink.style.display = 'none';
    // 字符内容转变成blob地址
    var blob = new Blob([content]);
    eleLink.href = URL.createObjectURL(blob);
    // 触发点击
    document.body.appendChild(eleLink);
    eleLink.click();
    // 然后移除
    document.body.removeChild(eleLink);
};
 export {dataFilter,funDownload}