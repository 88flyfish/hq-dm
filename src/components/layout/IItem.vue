<template>
    <div class='itembox'>
        <slot></slot>
    </div>
</template>
<script>
export default {
    props:{
    
    },
    data(){
    return {
        
    }
    },
    methods: {

    },
    mounted() {

    },
    computed:{
    
    }
}
</script>
<style scoped>
    .itembox{
        margin:10px 50px 0;
    }
    .itembox label{
        color: #478FCA!important;
        font-weight: lighter;
        font-size: 14px;
    }
</style>
      