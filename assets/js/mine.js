/**
* author: Jack Zhang
* email: 714816371@qq.com
* time: 2018年12月
*/



function Mine (xNum, yNum, mineNum, canvasEle) {
  this.cellSize = 20 // 一个格子的大小
  this.xNum = xNum // 一行多少格
  this.yNum = yNum // 多少行
  this.mineNum = mineNum // 雷数
  this.canvas = document.querySelector('#' + canvasEle)
  this.ctx = this.canvas.getContext('2d')
  this.imgPath = './assets/img/' // 图片相对路径
  
}

// let e = e || window.event;

Mine.prototype = {
  init: function () {
    // console.log('init')
    // 画布宽高
    this.canvas.width = this.cellSize * this.xNum
    this.canvas.height = this.cellSize * this.yNum
    this.mineArr = [] // 扫雷标记数组

    this.firstClick = true
    this.createCells()
    this.onclick()

    this.preRightMenu()
  },

  createCells: function () {
    let xNum = this.xNum,
        yNum = this.yNum

    for(let i = 0; i < xNum; i++) {
      for(let j = 0; j < yNum; j++) {
        this.drawCell([i, j], 0)
      }
    }
  },

  // 绘制不同种类格子
  drawCell: function (pos, type) {
    //0正常格 1无数字格子 2旗子格 3问号格 4正常雷格 5点中雷格 6.错误标记
    let srcArr = ["blank.bmp","0.bmp","flag.bmp","ask.bmp","mine.bmp","blood.bmp","error.bmp"],
        cellSize = this.cellSize,
        coord = this.getCellCoord(pos),
        ctx = this.ctx,
        img = new Image()
    img.src = this.imgPath + srcArr[type]
    img.onload = function () {
      ctx.drawImage(img, coord[0], coord[1], cellSize, cellSize)
    }
  },
  // 绘制数字
  drawNum: function (pos, num) {
    let cellSize = this.cellSize,
        coord = this.getCellCoord(pos),
        ctx = this.ctx,
        img = new Image()
    img.src = this.imgPath + num + '.bmp'
    img.onload = function () {
      ctx.drawImage(img, coord[0], coord[1], cellSize, cellSize)
    }
  },


  onclick: function () {
    let that = this
    // 用mouseup左击右击均触发
    this.canvas.onmouseup = function(e) {
      let pos = that.getCellPos(that.getEventCoord(e))
      if(that.firstClick) {
        that.createMineArr(pos)
        that.firstClick = false
      }
      e = e || window.event
      that.triggerClick(pos, e)
    }
  },
  triggerClick: function (pos, e) {
    // console.log(e)
    let mineArr = this.mineArr
    if(!(mineArr[pos[1]] && mineArr[pos[1]][pos[0]])) return

    let theCell = mineArr[pos[1]][pos[0]]
    if(theCell.isOpened) return

    if(e && e.button == 2) { // 右击标记
      this.rightClick(pos, theCell)
      return
    }
    if(theCell.mark == 1) return // 插旗不能点击，问号可点击

    if(theCell.num == 9) { // 点到雷
      theCell.isOpened = true
      this.clickMine(pos)
    } else if(theCell.num == 0) {
      this.drawNum(pos, theCell.num)
      theCell.isOpened = true

      this.triggerClick([pos[0] - 1, pos[1] - 1])
      this.triggerClick([pos[0], pos[1] - 1])
      this.triggerClick([pos[0] + 1, pos[1] - 1])

      this.triggerClick([pos[0] - 1, pos[1]])
      this.triggerClick([pos[0] + 1, pos[1]])

      this.triggerClick([pos[0] - 1, pos[1] + 1])
      this.triggerClick([pos[0], pos[1] + 1])
      this.triggerClick([pos[0] + 1, pos[1] + 1])

    } else {
      this.drawNum(pos, theCell.num)
      theCell.isOpened = true
    }
  },
  clickMine: function (pos) {
    this.showAllMines()
    this.drawCell(pos, 5)
    this.canvas.onmouseup = ''
  },
  showAllMines: function () { // 点击到雷，显示所有雷
    let mineArr = this.mineArr
    for(let i = 0; i < this.yNum; i++) {
      for(let j = 0; j < this.xNum; j++) {
        if(mineArr[i][j].num == 9) {
          this.drawCell([j, i], 4)
        }
        if(mineArr[i][j].num != 9 && mineArr[i][j].mark == 1) {
          this.drawCell([j, i], 6)
        }
      }
    }
  },
  rightClick: function (pos, theCell) { // 右击
    if(theCell.mark == 0) {
      this.drawCell(pos, 2)
      theCell.mark = 1
    } else if(theCell.mark == 1) {
      this.drawCell(pos, 3)
      theCell.mark = 2
    } else {
      this.drawCell(pos, 0)
      theCell.mark = 0
    }
  },

  // 当前格+1
  cellNumAdd: function (pos) {
    let mineArr = this.mineArr
    if(mineArr[pos[1]] != undefined && mineArr[pos[1]][pos[0]] != undefined && mineArr[pos[1]][pos[0]].num != 9) {
      mineArr[pos[1]][pos[0]].num += 1
    }
  },
  // 雷周围一圈+1
  aroundNumAdd: function (pos) {
      this.cellNumAdd([pos[0] - 1, pos[1] - 1])
      this.cellNumAdd([pos[0], pos[1] - 1])
      this.cellNumAdd([pos[0] + 1, pos[1] - 1])

      this.cellNumAdd([pos[0] - 1, pos[1]])
      this.cellNumAdd([pos[0] + 1, pos[1]])

      this.cellNumAdd([pos[0] - 1, pos[1] + 1])
      this.cellNumAdd([pos[0], pos[1] + 1])
      this.cellNumAdd([pos[0] + 1, pos[1] + 1])
  },
  // 埋雷
  layMine: function (pos) {
    // debugger
    let i = 0,
        mineArr = this.mineArr
    while (i < this.mineNum) {
      let minePos = [this.getRandom(this.xNum), this.getRandom(this.yNum)]
      // 已有雷的不布雷 && 第一次点击的格子非雷
      if(mineArr[minePos[1]][minePos[0]].num != 9 && (pos[0] != minePos[0] || pos[1] != minePos[1])) {
        mineArr[minePos[1]][minePos[0]].num = 9
        this.aroundNumAdd(minePos)
        i++
      }
    }
  },
  // 建立扫雷数组
  createMineArr: function (pos) {
    for(let i = 0; i < this.yNum; i++) {
      let xArr = []
      for(let j = 0; j < this.xNum; j++) {
        xArr[j] = {
          num: 0, // 0-8为周围雷数，9为雷
          isOpened: false,
          mark: 0 // 0：无标记，1：插旗，2：问号
        }
      }
      this.mineArr[i] = xArr
    }
    this.layMine(pos)
  },

  // 根据格子位置获得格子左上角坐标
  getCellCoord: function (pos) {
    return [pos[0] * this.cellSize, pos[1] * this.cellSize]
  },
  // 根据格子坐标获得格子位置
  getCellPos: function (coord) {
    return [Math.floor(coord[0] / this.cellSize), Math.floor(coord[1] / this.cellSize)]
  },

  // 获取点击点坐标
  getEventCoord: function (e) {
    e = e || window.event;
    return [e.offsetX, e.offsetY]
  },
  // 生成随机正整数[0, n-1]
  getRandom: function (n){
      return Math.floor(Math.random() * n)
  },
  // 阻止右键菜单
  preRightMenu: function () {
    this.canvas.addEventListener('contextmenu', function(e) {
      if (document.all) window.event.returnValue = false;// for IE
      else e.preventDefault();
    })
  },
}