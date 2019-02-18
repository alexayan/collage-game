function clone(matrix) {
  const rtn = [];
  matrix.forEach((item) => {
    rtn.push([].concat(item));
  })
  return rtn;
}

function genMatrix(size) {
  const rtn = [];
  let id = 0;
  for (let i = 0; i < size[0]; i++) {
    const arr = [];
    for (let j = 0; j < size[1]; j++) {
      id = id + 1;
      arr.push(id);
    }
    rtn.push(arr);
  }
  return rtn;
}

Component({
  data: {
    blocks: [],
    gameStyle: '',
    isEnd: false
  },
  properties: {
    meta: {
      type: Object,
      value: null,
      observer: function(v) {
        if (v) {
          this.refresh();
        }
      }
    },
    animationTime: {
      type: Number,
      value: 100
    },
    showTip: {
      type: Boolean,
      value: false
    }
  },

  detached() {
    this.shuffling = false;
  },

  methods: {
    isEnd() {
      let isEnd = true;
      for (let i = 0; i < this.initPosition.length; i++) {
        for (let j = 0; j < this.initPosition[0].length; j++) {
          if (this.initPosition[i][j] !== this.position[i][j]) {
            isEnd = false;
            break;
          }
        }
      }
      return isEnd;
    },
    getActivePos(flag) {
      const ePos = this.getPosById(this.lastId);
      const poses = [];
      const matrix = this.initPosition;
      if (!matrix) {
        return [];
      }
      const rowCount = matrix.length;
      const columnCount = matrix[0].length;
      if (typeof flag === 'undefined' || flag) {
        for (let i = 0; i < rowCount; i++) {
          if (i !== ePos[0]) {
            poses.push([i, ePos[1]]);
          }
        }
      }
      if (typeof flag === 'undefined' || !flag) {
        for (let i = 0; i < columnCount; i++) {
          if (i !== ePos[1]) {
            poses.push([ePos[0], i]);
          }
        }
      }
      return poses;
    },
    reset() {
      this.stopShuffle();
      this.refresh();
      this.moveAnimate();
    },
    async shuffle(count) {
      try {
        if (this.shuffling) {
          return;
        }
        this.shuffling = true;
        let flag = true;
        while (this.shuffling) {
          flag = !flag;
          const poses = this.getActivePos(flag);
          const pos = poses[Math.floor(Math.random() * poses.length)];
          await this.move(pos);
        }
      } catch (e) {
        console.error(e);
      } finally {
        this.shuffling = false;
      }
    },
    stopShuffle() {
      this.shuffling = false;
    },
    click(e) {
      try {
        if (this.data.isEnd) {
          return;
        }
        this.stopShuffle();
        const tid = e.target.dataset.id;
        const pos = this.getPosById(tid);
        if (!tid) {
          return;
        }
        if (tid === this.lastId) {
          return;
        }
        const ePos = this.getPosById(this.lastId);
        if (pos[0] !== ePos[0] && pos[1] !== ePos[1]) {
          return;
        }
        this.move(pos);
        if (wx.vibrateShort) {
          wx.vibrateShort();
        }
        if (this.isEnd()) {
          this.setData({
            isEnd: true
          });
          this.triggerEvent("collagesuccess", {}, {
            bubbles: true,
            composed: true
          });
        }
      } catch (e) {
        console.error(e);
      }
    },
    refresh() {
      const { image, width = 300, height = 300, line = 4, column = 4, padding = 0 } = (this.properties.meta || {});
      const matrix = genMatrix([line, column]);
      if (!width || !height || !matrix) {
        return;
      }
      const gameStyle = `width: ${width}px; height: ${height}px;`;
      const rowCount = line;
      const columnCount = column;
      this.lastId = matrix[rowCount - 1][columnCount - 1];
      const blockWidth = Math.floor((width - (columnCount + 1) * padding) / columnCount);
      const blockHeight = Math.floor((height - (rowCount + 1) * padding) / rowCount);
      const blocks = [];
      const animation = wx.createAnimation({
        duration: 0
      });
      animation.translateX(0).translateY(0).step();
      for (let i = 0; i < rowCount; i++) {
        for (let j = 0; j < columnCount; j++) {
          const block = {
            id: matrix[i][j],
            width: blockWidth,
            height: blockHeight,
            animation: animation.export(),
            padding: padding
          };
          const blockBoxStyle = `width: ${block.width}px; height: ${
            block.height
          }px; margin: ${padding / 2}px;`;
          const blockBgStyle = `background-position: -${block.width *
            j}px -${block.height *
            i}px; background-size: ${width}px ${height}px; background-image: url('${image}');`;
          block.style = blockBoxStyle;
          if (image) {
            block.style = block.style + blockBgStyle;
          }
          blocks.push(block);
        }
      }
      blocks[blocks.length - 1].isLast = true;
      this.initPosition = matrix;
      this.position = clone(matrix);
      this.setData({
        blocks,
        gameStyle,
        isEnd: false
      });
    },
    getPosById(id, pos) {
      pos = pos || this.position;
      let x = 0;
      let y = 0;
      for (let i = 0; i < pos.length; i++) {
        for (let j = 0; j < pos[0].length; j++) {
          if (id === pos[i][j]) {
            x = i;
            y = j;
          }
        }
      }
      return [x, y];
    },

    getIdByPos(pos, p) {
      p = p || this.position;
      return p[pos[0]][pos[1]];
    },

    getLineIds(line, p) {
      p = p || this.position;
      return [].concat(p[line]);
    },

    getColumnIds(column, p) {
      p = p || this.position;
      return p.map(line => {
        return line[column];
      });
    },

    getBetweenPoses(a, b) {
      if (a[0] === b[0]) {
        const range = Math.abs(a[1] - b[1]);
        const rtn = [];
        if (a[1] < b[1]) {
          for (let i = 0; i <= range; i++) {
            rtn.push([a[0], a[1] + i, this.getIdByPos([a[0], a[1] + i])]);
          }
        } else {
          for (let i = 0; i <= range; i++) {
            rtn.push([a[0], b[1] + i, this.getIdByPos([a[0], b[1] + i])]);
          }
        }
        return rtn;
      } else if (a[1] === b[1]) {
        const range = Math.abs(a[0] - b[0]);
        const rtn = [];
        if (a[0] < b[0]) {
          for (let i = 0; i <= range; i++) {
            rtn.push([a[0] + i, a[1], this.getIdByPos([a[0] + i, a[1]])]);
          }
        } else {
          for (let i = 0; i <= range; i++) {
            rtn.push([b[0] + i, a[1], this.getIdByPos([b[0] + i, a[1]])]);
          }
        }
        return rtn;
      } else {
        return [];
      }
    },

    moveInLine(pos, range) {
      const id = pos[2];
      this.position[pos[0]][pos[1] + range] = id;
    },

    moveInColumn(pos, range) {
      const id = pos[2];
      this.position[pos[0] + range][pos[1]] = id;
    },

    getBlockById(id) {
      for (let i = 0; i < this.data.blocks.length; i++) {
        if (this.data.blocks[i].id === id) {
          return this.data.blocks[i];
        }
      }
    },

    moveAnimate() {
      for (let i = 0; i < this.initPosition.length; i++) {
        for (let j = 0; j < this.initPosition[0].length; j++) {
          const id = this.initPosition[i][j];
          const block = this.getBlockById(id);
          if (!block) {
            continue;
          }
          const animationTime = this.shuffling ? 50 : this.properties.animationTime;
          if (id !== this.position[i][j]) {
            const pa = [i, j];
            const pb = this.getPosById(id);
            const animation = wx.createAnimation({
              duration: block.isLast ? 0 : animationTime
            });
            console.log(pb[1] - pa[1], pb[0] - pa[0])
            animation
              .translateX((pb[1] - pa[1]) * block.width + ((pb[1] - pa[1])) * block.padding)
              .translateY((pb[0] - pa[0]) * block.height + ((pb[0] - pa[0])) * block.padding)
              .step();
            block.animation = animation.export();
          } else {
            const animation = wx.createAnimation({
              duration: block.isLast ? 0 : animationTime
            });
            animation
              .translateX(0)
              .translateY(0)
              .step();
            block.animation = animation.export();
          }
        }
      }
      this.setData({
        blocks: this.data.blocks
      });
    },

    async move(pos) {
      try {
        if (this.moving) {
          return;
        }
        this.moving = true;
        const ePos = this.getPosById(this.lastId);
        const poses = this.getBetweenPoses(pos, ePos);
        if (pos[0] === ePos[0]) {
          const range = pos[1] - ePos[1];
          let direction = 1;
          if (pos[1] < ePos[1]) {
            direction = 1;
          } else {
            direction = -1;
          }
          poses.forEach(p => {
            if (p[2] === this.lastId) {
              this.moveInLine(p, range);
            } else {
              this.moveInLine(p, direction);
            }
          });
        } else {
          const range = pos[0] - ePos[0];
          let direction = 1;
          if (pos[0] < ePos[0]) {
            direction = 1;
          } else {
            direction = -1;
          }
          poses.forEach(p => {
            if (p[2] === this.lastId) {
              this.moveInColumn(p, range);
            } else {
              this.moveInColumn(p, direction);
            }
          });
        }
        this.moveAnimate();
        const animationTime = this.shuffling ? 180 : this.properties.animationTime;
        await new Promise(resolve => {
          setTimeout(resolve, animationTime);
        });
      } catch (e) {
        console.error(e);
      } finally {
        this.moving = false;
      }
    }
  }
});
