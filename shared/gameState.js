const Egg = require("./egg");
const Vector = require("./vector");
const Wave = require("./wave");
const { GUMMY, GAME, YOLK } = require("./constants");

class GameState {
  constructor(data = {}) {
    this.eggs = data.eggs ? data.eggs.map((egg) => new Egg(egg)) : [];
    this.gummies = data.gummies
      ? data.gummies.map((gummy) => new Vector(gummy.x, gummy.y))
      : [];
    // this.waves = data.waves ? data.waves.map((wave) => new Wave(wave)) : [];
    this.predictMode = data.predictMode ?? false;
  }

  // returns list of ids of eggs that just died (for now)
  update() {
    // for (const wave of this.waves) {
    //   wave.updatePosition();
    // }

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
        if (Vector.dist(egg.yolkPos, gummy) < GUMMY.SIZE) {
          gummiesEaten.push(gummy);
        }
      }

      egg.whiteSize += GUMMY.BOOST * gummiesEaten.length;
      egg.playAy += gummiesEaten.length;
      for (const gummy of gummiesEaten) {
        this.gummies.splice(this.gummies.indexOf(gummy), 1);
      }

      if (egg.whiteSize < GAME.KILL_SIZE) {
        deadEggs.push(egg.id);
      }
    }

    for (const id of deadEggs) {
      this.eggs.splice(this.indexOfId(id), 1);
    }

    // respawn gummies to max number unless in predict mode
    // if we're in predict mode, we don't want to misplace random gummies
    while (!this.predictMode && this.gummies.length < GUMMY.COUNT) {
      this.gummies.push(
        new Vector(Math.random() * GAME.MAP_SIZE, Math.random() * GAME.MAP_SIZE)
      );
    }

    return deadEggs;
  }

  indexOfId(id) {
    return this.eggs.findIndex((egg) => egg.id == id);
  }

  getById(id) {
    const i = this.indexOfId(id);
    return i == -1 ? null : this.eggs[i];
  }

  spawnPlayer(id) {
    this.eggs.push(new Egg({ id }));
  }

  disconnectPlayer(id) {
    const i = this.indexOfId(id);
    if (i != -1) this.eggs.splice(i, 1);
  }

  setArrow(id, key, pressed) {
    this.getById(id)?.setArrow(key, pressed);
  }

  moveMouse(id, pos) {
    this.getById(id)?.moveMouse(pos);
  }

  setMouse(id, clicked) {
    const egg = this.getById(id);
    if (egg) {
      egg.setMouse(clicked);
      // if (clicked) {
      //   let dir = Vector.diff(egg.mousePos, egg.yolkPos);
      //   dir = Vector.scale(1 / dir.norm(), dir);
      //   const pos = Vector.sum(egg.yolkPos, Vector.scale(1.5 * YOLK.SIZE, dir));
      //   this.waves.push(new Wave({ pos, dir }));
      // }
    }
  }
}

module.exports = GameState;
