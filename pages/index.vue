<template>
  <section class="container">
    <div>
      <div class="scramble">{{scrambleText}}</div>
      <button @click="onClickConnect">Connect</button>
    </div>
  </section>
</template>

<script>
  import GiiKER from 'giiker';
  import Cube from 'cubejs';
  import 'cubejs/lib/solve';
  import MoveSequence from '~/lib/MoveSequence.js';

  Cube.initSolver();

  export default {
    data () {
      return {
        scramble: null,
      };
    },
    computed: {
      scrambleText() {
        return this.scramble === null ? '' : this.scramble.toString();
      },
    },
    async mounted () {
      this.scramble = MoveSequence.fromScramble(Cube.scramble());
      console.log(this.scramble);
    },
    methods: {
      async onClickConnect() {
        this.giiker = await GiiKER.connect();
        this.giiker.on('move', this.onGiikerMove)
      },
      onGiikerMove(move) {
        console.log(move);
      },
    },
    destroyed () {
      if (this.giiker) {
        this.giiker.removeListener('move', this.onGiikerMove);
      }
    }
  }
</script>

<style>
  .container {
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;
    color: #444;
  }

  .scramble {
    font-size: 10vmin;
    font-weight: bold;
  }
</style>
