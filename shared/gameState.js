const Egg = require("./egg");
const Vector = require("./vector");

const GUMMY_COUNT = 8;
const GUMMY_SIZE = 64;
const GUMMY_BOOST = 20;

const KILL_SIZE = 640;
const MAP_SIZE = 1280;

class GameState {
  constructor() {
    this.eggs = [];
    this.gummies = [];
  }

  // returns list of ids of eggs that just died (for now)
  update() {
    for (const a of this.eggs) {
      for (const b of this.eggs) {
        if (a.id != b.id) {
          Egg.yolkWhiteCollision(a, b);
          Egg.yolkYolkCollision(a, b);
          Egg.whiteWhiteCollision(a, b);
        }
      }
    }

    let deadEggs = [];
    for (const egg of this.eggs) {
      egg.updatePosition();

      const gummiesEaten = [];
      for (const gummy of this.gummies) {
        if (Vector.dist(egg.yolkPos, gummy) < GUMMY_SIZE) {
          gummiesEaten.push(gummy);
        }
      }

      egg.whiteSize += GUMMY_BOOST * gummiesEaten.length;
      for (const gummy of gummiesEaten) {
        this.gummies.splice(this.gummies.indexOf(gummy), 1);
      }

      if (egg.whiteSize < KILL_SIZE) {
        deadEggs.push(egg);
      }
    }

    for (const egg of deadEggs) {
      this.eggs.splice(this.eggs.indexOf(egg), 1);
    }

    while (this.gummies.length < GUMMY_COUNT) {
      this.gummies.push(
        new Vector(Math.random() * MAP_SIZE, Math.random() * MAP_SIZE)
      );
    }

    return deadEggs.map((egg) => egg.id);
  }

  indexOfId(id) {
    return this.eggs.findIndex((egg) => egg.id == id);
  }

  getById(id) {
    const i = this.indexOfId(id);
    return i == -1 ? null : this.eggs[i];
  }

  spawnPlayer(id) {
    this.eggs.push(new Egg(id));
  }

  disconnectPlayer(id) {
    this.eggs.splice(this.indexOfId(id), 1);
  }

  moveWhite(id, dir) {
    const egg = this.getById(id);
    if (egg) egg.moveWhite(dir);
  }

  moveMouse(id, pos) {
    const egg = this.getById(id);
    if (egg) egg.moveMouse(pos);
  }

  setMouse(id, clicked) {
    const egg = this.getById(id);
    if (egg) egg.mouseClicked = clicked;
  }

  // clone() {
  //   const copy = new GameState();
  //   copy.eggs = this.eggs.map((egg) => egg.clone());
  //   copy.gummies = [...this.gummies];
  // }
}

module.exports = GameState;
