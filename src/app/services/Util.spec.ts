import {bestGridLayout, GridLayout} from './Util';

const GAP = 8;
const ASPECT = 16 / 9;

/** total size the tiles of a layout take, including gaps */
function usedSize(layout: GridLayout) {
  return {
    width: layout.cols * layout.tileWidth + GAP * (layout.cols - 1),
    height: layout.rows * layout.tileHeight + GAP * (layout.rows - 1),
  };
}

describe('bestGridLayout', () => {

  it('returns an empty layout for no tiles or no space', () => {
    expect(bestGridLayout(0, 1200, 600).tileWidth).toBe(0);
    expect(bestGridLayout(3, 0, 600).tileWidth).toBe(0);
    expect(bestGridLayout(3, 1200, 0).tileWidth).toBe(0);
  });

  it('uses the full height for a single tile in a wide container', () => {
    const layout = bestGridLayout(1, 1200, 600);
    expect(layout.cols).toBe(1);
    expect(layout.rows).toBe(1);
    expect(layout.tileWidth).toBe(1066);
    expect(layout.tileHeight).toBe(599); // 1066 / (16/9) = 599.6, floored so it never overflows
  });

  it('uses the full width for a single tile in a tall container', () => {
    const layout = bestGridLayout(1, 400, 800);
    expect(layout.tileWidth).toBe(400);
    expect(layout.tileHeight).toBe(225);
  });

  it('puts 3 tiles next to each other in a wide container', () => {
    const layout = bestGridLayout(3, 1600, 400);
    expect(layout.cols).toBe(3);
    expect(layout.rows).toBe(1);
  });

  it('stacks 3 tiles in a tall container', () => {
    const layout = bestGridLayout(3, 400, 1200);
    expect(layout.cols).toBe(1);
    expect(layout.rows).toBe(3);
  });

  it('uses 2x2 for 4 tiles in a 16:9 container', () => {
    const layout = bestGridLayout(4, 1600, 900);
    expect(layout.cols).toBe(2);
    expect(layout.rows).toBe(2);
  });

  it('uses 5x4 for 20 tiles in 1200x600', () => {
    const layout = bestGridLayout(20, 1200, 600);
    expect(layout.cols).toBe(5);
    expect(layout.rows).toBe(4);
    expect(layout.tileWidth).toBe(233);
  });

  it('keeps the aspect ratio', () => {
    const layout = bestGridLayout(7, 1300, 700);
    expect(layout.tileHeight).toBe(Math.floor(layout.tileWidth / ASPECT));
  });

  it('always fits into the container without a minimum width', () => {
    const sizes = [[1200, 600], [800, 800], [400, 1000], [1920, 300], [333, 187]];
    for (const [width, height] of sizes) {
      for (let count = 1; count <= 30; count++) {
        const layout = bestGridLayout(count, width, height, ASPECT, GAP);
        const used = usedSize(layout);
        expect(layout.cols * layout.rows).toBeGreaterThanOrEqual(count);
        expect(used.width).withContext(count + " tiles in " + width + "x" + height).toBeLessThanOrEqual(width);
        expect(used.height).withContext(count + " tiles in " + width + "x" + height).toBeLessThanOrEqual(height);
        expect(layout.scroll).toBeFalse();
      }
    }
  });

  describe('with a minimum tile width', () => {

    it('does not change layouts that are big enough', () => {
      expect(bestGridLayout(4, 1600, 900, ASPECT, GAP, 240))
        .toEqual(bestGridLayout(4, 1600, 900, ASPECT, GAP));
    });

    it('keeps the minimum width and scrolls when there are too many tiles', () => {
      const layout = bestGridLayout(20, 800, 400, ASPECT, GAP, 240);
      expect(layout.tileWidth).toBeGreaterThanOrEqual(240);
      expect(layout.cols).toBe(3);
      expect(layout.rows).toBe(7);
      expect(usedSize(layout).width).toBeLessThanOrEqual(800);
      expect(layout.scroll).toBeTrue();
    });

    it('uses a single column of container width if the container is narrower than the minimum', () => {
      const layout = bestGridLayout(5, 200, 300, ASPECT, GAP, 240);
      expect(layout.cols).toBe(1);
      expect(layout.tileWidth).toBe(200);
      expect(layout.scroll).toBeTrue();
    });
  });
});
