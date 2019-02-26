<template>
  <div>
    <div class="spinner">
      <i></i>
    </div>
  </div>

</template>

<script>
    export default {
        name: "ILoading"
    }
</script>

<style scoped>
  .spinner{
    border-radius: 50%;
    position: relative;
    font-size: 50px;
    width: 1em;
    height: 1em;
    -webkit-box-shadow: inset 0 0 0 .1em rgba(58, 168, 237, .2);
    -moz-box-shadow: inset 0 0 0 .1em rgba(58, 168, 237, .2);
    box-shadow: inset 0 0 0 .1em rgba(58, 168, 237, .2);
  }
  .spinner i {
    position: absolute;
    width: 1em;
    height: 1em;
    clip: rect(0,1em,1em,.5em);
    animation: spinner-circle-clipper 1s ease-in-out infinite;
  }
  @keyframes spinner-circle-clipper {
    0%{
      transform: rotate(0deg);
    }
    100%{
      transform: rotate(180deg);
    }
  }
  .spinner i:after{
    position: absolute;
    width: 1em;
    height: 1em;
    clip: rect(0,1em,1em,.5em);
    content: '';
    border-radius: 50%;
    -webkit-box-shadow: inset 0 0 0 .1em #3aa8ed;
    -moz-box-shadow: inset 0 0 0 .1em #3aa8ed;
    box-shadow: inset 0 0 0 .1em #3aa8ed;
    animation: spinner-circle 1s ease-in-out infinite;
  }
  @keyframes spinner-circle {
    0%{
      transform: rotate(-180deg);
    }
    100%{
      transform: rotate(180deg);
    }
  }


</style>
