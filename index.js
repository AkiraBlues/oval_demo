/**
 * @typedef LinePosition
 * @property {Number} startX
 * @property {Number} startY
 * @property {Number} endX
 * @property {Number} endY
 */

(function(){
  'use strict';

  /**
   * 常量类
   */
  class Constants {
    /**
     * 
     * @param {HTMLCanvasElement} canvas 
     */
    constructor(canvas) {
      /** @type {HTMLCanvasElement} */
      this._canvas = canvas;
      this._global = {
        // 帧率
        INTERVAL: 1000 / 60,
        // X轴步进
        STEP_ANGEL: 0.25,
        // 画布宽度
        CANVAS_WIDTH: canvas.clientWidth,
        // 画布高度
        CANVAS_HEIGHT: canvas.clientHeight,
        // 线段长度上限
        MAX_LINE: Math.floor(canvas.clientHeight / 2),
        // 中心点坐标，X
        CENTER_X: 300,
        // 中心点坐标，Y
        CENTER_Y: 320,
        END_WAIT: 1500,
      };
      this.flush();
    }

    get global() {
      return this._global;
    }

    get line() {
      return this._constants;
    }

    flush() {
      this._constants = this._generate();
    }
    
    /**
     * 构造常量对象
     * @param {Boolean} flush 是否重新构造 
     */
    _generate() {
      let lineA = Math.round(10 + Math.random() * 110);
      let lineB = Math.round(50 + Math.random() * (this.global.MAX_LINE - 170));
      const ratio = lineB / lineA;
      const startX = this._global.CENTER_X - lineA;
      return {
        LINE_A: lineA,
        LINE_B: lineB,
        RATIO: ratio,
        START_X: startX,
        START_Y: this._global.CENTER_Y,
      };
    }
  }
  
  // 全局变量
  const PI = Math.PI;
  let DIRECTION_Y = false;
  let globalAngel = 0;

  // 初始化并运行
  const canvas = init();
  const draw2d = canvas.getContext('2d');
  const constants = new Constants(canvas);
  doAnimation(draw2d, {
    startX: constants.line.START_X,
    startY: constants.line.START_Y,
    endX: constants.global.CENTER_X,
    endY: constants.global.CENTER_Y
  }, constants);
  
  /**
   * @returns {HTMLCanvasElement}
   */
  function init() {
    /** @type {HTMLCanvasElement} */
    const canvas = document.querySelector('#canvas');
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const draw2d = canvas.getContext('2d');
    draw2d.font = '16px Microsoft Yahei';
    draw2d.fillStyle = '#5F5F5F';
    draw2d.fillText(`宽度: ${width}  高度: ${height}`, 10, 20);
    return canvas;
  }

  /**
   * @param {CanvasRenderingContext2D} draw2d
   * @param {Number} canvasWidth
   * @param {Number} canvasHeight
   * @param {Number} centerX
   * @param {Number} centerY
   */
  function clearBeforeRepaint(draw2d, canvasWidth, canvasHeight, centerX, centerY) {
    draw2d.clearRect(0, 30, canvasWidth, canvasHeight - 30);
    draw2d.strokeStyle = '#2F2F2F';
    draw2d.lineWidth = 1;
    draw2d.beginPath();
    draw2d.moveTo(0, centerY);
    draw2d.lineTo(canvasWidth, centerY);
    draw2d.stroke();
    draw2d.beginPath();
    draw2d.moveTo(centerX, 30);
    draw2d.lineTo(centerX, canvasHeight);
    draw2d.stroke();
  }

  /**
   * 根据当前位置，计算X和Y的下一个坐标位置，推荐使用角度进行计算而非让X轴的恒定运动
   * @param {LinePosition} linePosition 当前线段坐标
   * @param {Constants} constants
   * @returns {LinePosition} 返回下一个线段坐标
   */
  function getLinePosition(linePosition, constants) {
    globalAngel = globalAngel + constants.global.STEP_ANGEL;
    if (globalAngel > 360) {
      globalAngel = 0;
    }
    // 根据角度计算X的开始位置
    linePosition.startX = constants.global.CENTER_X - Math.cos(globalAngel * PI / 180) * constants.line.LINE_A;
    // Y的计算需要使用函数
    const distanceX = Math.abs(linePosition.endX - linePosition.startX);
    const distanceY = Math.round(Math.sqrt(Math.pow(constants.line.LINE_A, 2) - Math.pow(distanceX, 2)) * 100) / 100;
    // 当前线段到达右侧，且上一次末端Y为正时，下一次末端Y要往下走
    // 反之，当线段到达左侧，且上一次末端Y为负时，下一次末端要往上走
    if (linePosition.startX >= constants.global.CENTER_X + constants.line.LINE_A) {
      DIRECTION_Y = true;
    } else if (linePosition.startX <= constants.global.CENTER_X - constants.line.LINE_A) {
      DIRECTION_Y = false;
    }
    if (DIRECTION_Y) {
      linePosition.endY = Math.round((constants.global.CENTER_Y + distanceY) * 100) / 100;
    } else {
      linePosition.endY = Math.round((constants.global.CENTER_Y - distanceY) * 100) / 100;
    }
    return linePosition;
  }

  /**
   * 绘制线段2的坐标
   * @param {LinePosition} lineAPosition
   * @param {Constants} constants
   * @returns {LinePosition}
   */
  function getLineBPosition(lineAPosition, constants) {
    const lineBPosition = {
      startX: lineAPosition.endX,
      startY: lineAPosition.endY,
      endX: constants.global.CENTER_X,
      endY: constants.global.CENTER_Y
    };

    // 给定任意一个线段的坐标，都可以绘制出线段2的坐标
    const distanceX = lineAPosition.endX - lineAPosition.startX;
    const distanceY = lineAPosition.endY - lineAPosition.startY;
    lineBPosition.endX = distanceX * constants.line.RATIO + lineBPosition.startX;
    lineBPosition.endY = distanceY * constants.line.RATIO + lineBPosition.startY;

    return lineBPosition;
  }

  /**
   * @param {CanvasRenderingContext2D} draw2d
   * @param {LinePosition} linePosition
   * @param {Constants} constants
   * @param {Function} callback
   */
  function doLoop(draw2d, linePosition, constants, callback) {
    draw2d.strokeStyle = '#CB4335';
    draw2d.lineWidth = 0.25;
    draw2d.beginPath();
    draw2d.moveTo(linePosition.startX, linePosition.startY);
    draw2d.lineTo(linePosition.endX, linePosition.endY);
    draw2d.stroke();
    // 之后开始绘制LINE_B
    const lineBPosition = getLineBPosition(linePosition, constants);
    draw2d.beginPath();
    draw2d.moveTo(lineBPosition.startX, lineBPosition.startY);
    draw2d.lineTo(lineBPosition.endX,lineBPosition.endY);
    draw2d.stroke();
    
    // 计算下一次坐标，参与下一次绘制
    linePosition = getLinePosition(linePosition, constants);
    setTimeout(callback, constants.global.INTERVAL);
  }

  /**
   * @param {CanvasRenderingContext2D} draw2d
   * @param {LinePosition} linePosition
   * @param {Constants} constants
   */
  function doAnimation(draw2d, linePosition, constants) {
    const global = constants.global;
    requestAnimationFrame(() => {
      if(linePosition.startX === constants.line.START_X && linePosition.endY === global.CENTER_Y) {
        constants.flush();
        setTimeout(() => {
          clearBeforeRepaint(draw2d, global.CANVAS_WIDTH, global.CANVAS_HEIGHT, global.CENTER_X, global.CENTER_Y);
          doLoop(draw2d, linePosition, constants, () => {
            doAnimation(draw2d, linePosition, constants);
          });
        }, constants.global.END_WAIT);
      } else {
        doLoop(draw2d, linePosition, constants, () => {
          doAnimation(draw2d, linePosition, constants);
        });
      }
    });
  }

})();