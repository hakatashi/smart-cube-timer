<template>
  <section class="container">
    <div>
      <div class="scramble">
        <span v-for="move, index in scrambleMoves" :key="index" :style="{color: move.grey ? '#CCC' : ''}">
          {{move.text}}
        </span>
      </div>
      <button @click="onClickConnect">Connect</button>
    </div>
  </section>
</template>

<script>
  import assert from 'assert';
  import GiiKER from 'giiker';
  import Cube from 'cubejs';
  import 'cubejs/lib/solve';
  import MoveSequence from '~/lib/MoveSequence.js';

  // Cube.initSolver();

  export default {
    data () {
      return {
        placeholderMoves: [],
        scramble: null,
      };
    },
    computed: {
      scrambleMoves() {
        if (this.scramble === null) {
          return [];
        }

        assert(this.placeholderMoves.length >= this.scramble.moves.length);

        const greyedMovesCount = this.placeholderMoves.length - this.scramble.moves.length;

        return this.placeholderMoves.map((move, index) => {
          if (index < greyedMovesCount) {
            return {
              text: MoveSequence.moveToString(move),
              grey: true,
            };
          }

          const actualMove = this.scramble.moves[index - greyedMovesCount];

          if (index === greyedMovesCount) {
            if (move.face === actualMove.face) {
              return {
                text: MoveSequence.moveToString(move),
                grey: false,
              };
            }
          }

          return {
            text: MoveSequence.moveToString(actualMove),
            grey: false,
          };
        });
      },
    },
    async mounted() {
      this.scramble = MoveSequence.fromScramble("D' R2 B2 D2 B2 D' F2 U' B2 L2 U2 B2 R B' L F' D' B L F2 U2");
      this.placeholderMoves = this.scramble.moves.map((move) => ({...move}));
    },
    methods: {
      async onClickConnect() {
        this.giiker = await GiiKER.connect();
        console.log('connect');
        this.giiker.on('move', this.onGiikerMove)
      },
      onGiikerMove(move) {
        this.scramble.unshift({
          face: move.face,
          amount: -move.amount,
        });
        if (this.scramble.moves.length > this.placeholderMoves.length) {
          this.placeholderMoves = this.scramble.moves.map((move) => ({...move}));
        }
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
