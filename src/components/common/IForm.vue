<template>
  <div class="i-form">
    <slot>
      Content can't be empty!
    </slot>
  </div>
</template>

<script>
  export default {
    name: "i-form"
  }
</script>

<style scoped>
  .i-form {
      box-sizing:border-box;
-moz-box-sizing:border-box; /* Firefox */
-webkit-box-sizing:border-box;
    width: 100%;
    height: 100%;
    display: block;
    padding:20px;
  }

</style>
