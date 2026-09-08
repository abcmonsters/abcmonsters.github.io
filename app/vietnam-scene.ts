// Canvas scenery keeps the blocky game style while using regional Vietnamese forms.
export function drawVietnamScene(
  c: CanvasRenderingContext2D,
  level: number,
  camera: number,
  time: number,
) {
  const region = level === 24 ? 8 : level % 12;
  const box = (x: number, y: number, w: number, h: number, color: string) => {
    c.fillStyle = color;
    c.fillRect(Math.round(x), Math.round(y), w, h);
  };
  const poly = (points: number[][], color: string) => {
    c.fillStyle = color;
    c.beginPath();
    points.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y)));
    c.closePath();
    c.fill();
  };
  const roof = (x: number, y: number, w: number) => {
    poly(
      [
        [x - 12, y + 18],
        [x + 8, y],
        [x + w - 8, y],
        [x + w + 12, y + 18],
      ],
      '#914d38',
    );
    box(x - 14, y + 17, w + 28, 6, '#663e32');
    for (let j = 0; j < w; j += 12) box(x + j, y + 6, 5, 9, '#b36b47');
  };
  const lantern = (x: number, y: number) => {
    c.save();
    c.translate(x, y);
    c.rotate(Math.sin(time * 1.6 + x) * 0.07);
    box(-1, -20, 2, 20, '#715047');
    poly(
      [
        [-10, 0],
        [10, 0],
        [15, 12],
        [10, 27],
        [-10, 27],
        [-15, 12],
      ],
      '#dc6247',
    );
    box(-3, 0, 6, 27, '#f4b85f');
    box(-6, 27, 12, 3, '#9d4238');
    box(-1, 30, 2, 12, '#e3a749');
    c.restore();
  };
  // Rivers run behind the stepping stones, including on land-based routes.
  box(0, 510, 432, 45, '#78b3a9');
  for (let i = 0; i < 12; i++)
    box(
      ((i * 51 + time * 8 - camera * 0.18) % 500) - 30,
      521 + (i % 3) * 9,
      27,
      2,
      '#bde0be',
    );
  for (let i = -1; i < 7; i++) {
    const x = i * 180 - ((camera * 0.35) % 180);
    if ([2, 7, 11].includes(region)) {
      for (let j = 0; j < 5; j++) {
        const y = 332 + j * 33;
        box(x + j * 8, y, 190 - j * 14, 34, j % 2 ? '#a7b64d' : '#d6c169');
        box(x + j * 8, y, 190 - j * 14, 5, '#6d9555');
        for (let k = 0; k < 8; k++)
          box(x + 10 + k * 20 + j * 8, y + 14, 2, 9, '#718d48');
      }
      if (region === 11) {
        poly(
          [
            [x + 30, 330],
            [x + 44, 245],
            [x + 86, 214],
            [x + 117, 280],
            [x + 135, 400],
          ],
          '#5f8b76',
        );
      }
    } else if ([4, 5, 9].includes(region)) {
      if (region === 5)
        poly(
          [
            [x, 466],
            [x + 20, 318],
            [x + 42, 261],
            [x + 85, 272],
            [x + 108, 365],
            [x + 130, 469],
          ],
          '#669788',
        );
      if (region !== 5) {
        box(x + 62, 341, 9, 164, '#826b48');
        for (let j = 0; j < 5; j++)
          poly(
            [
              [x + 66, 342],
              [x - 2 + j * 33, 318 - Math.abs(j - 2) * 7],
              [x + 20 + j * 26, 357],
            ],
            '#527c4a',
          );
      }
      c.save();
      c.translate(x + 60, 489 + Math.sin(time * 2 + i) * 2);
      poly(
        [
          [-58, 0],
          [58, 0],
          [39, 17],
          [-34, 17],
        ],
        '#795540',
      );
      box(-35, -7, 72, 9, '#c8945e');
      if (region === 5) {
        box(0, -108, 3, 108, '#765b40');
        poly(
          [
            [6, -105],
            [47, -23],
            [6, -15],
          ],
          '#e5b971',
        );
      } else {
        roof(-22, -38, 53);
        box(-10, -19, 29, 12, '#e9bf61');
      }
      c.restore();
    } else if (region === 6) {
      box(x + 8, 386, 150, 116, '#ad704c');
      box(x + 34, 395, 27, 107, '#653f35');
      box(x + 103, 395, 27, 107, '#653f35');
      box(x + 64, 436, 37, 66, '#3d5246');
      roof(x + 6, 363, 154);
      roof(x + 40, 330, 87);
      box(x + 59, 348, 49, 22, '#dcb879');
    } else if (region === 10) {
      box(x + 32, 428, 9, 77, '#745442');
      box(x + 112, 428, 9, 77, '#745442');
      box(x + 26, 405, 103, 49, '#bd935c');
      poly(
        [
          [x + 9, 408],
          [x + 77, 238],
          [x + 145, 408],
        ],
        '#9b7649',
      );
      poly(
        [
          [x + 31, 391],
          [x + 77, 268],
          [x + 123, 391],
        ],
        '#c3a369',
      );
      box(x + 64, 411, 28, 43, '#544536');
      for (let j = 0; j < 4; j++)
        box(x + 61 - j * 4, 459 + j * 10, 34 + j * 8, 5, '#99794f');
    } else if (region === 0 || region === 3) {
      box(x + 12, 372, 143, 132, region === 3 ? '#e6ba58' : '#cdb181');
      roof(x + 7, 348, 153);
      box(x + 33, 425, 29, 79, '#607260');
      box(x + 91, 426, 37, 78, '#516d60');
      box(x + 36, 390, 25, 20, '#876545');
      box(x + 99, 390, 25, 20, '#876545');
      box(x + 19, 419, 129, 5, '#eee0b2');
      lantern(x + 20, 410);
      lantern(x + 146, 408);
      if (region === 0) {
        box(x + 55, 375, 61, 14, '#874b3b');
        c.font = 'bold 9px Arial';
        c.fillStyle = '#f3dc9e';
        c.textAlign = 'center';
        c.fillText('PHỐ CỔ', x + 85, 386);
      }
    } else {
      // Village courtyard: tile-roof houses, bamboo fences, lotus ponds and pottery.
      box(x + 18, 423, 126, 78, '#dbbd7d');
      roof(x + 8, 396, 146);
      box(x + 69, 446, 30, 55, '#667352');
      for (let j = 0; j < 5; j++) {
        box(x + j * 28, 472, 4, 38, '#a08c58');
        box(x, 483, 132, 4, '#b6a36e');
      }
      if (region === 1) {
        for (let j = 0; j < 3; j++) {
          poly(
            [
              [x + 22 + j * 33, 474],
              [x + 12 + j * 33, 487],
              [x + 18 + j * 33, 502],
              [x + 37 + j * 33, 502],
              [x + 43 + j * 33, 487],
              [x + 33 + j * 33, 474],
            ],
            '#b97954',
          );
          box(x + 21 + j * 33, 472, 14, 4, '#784e3f');
        }
      } else {
        for (let j = 0; j < 3; j++) {
          box(x + 9 + j * 24, 338, 5, 117, '#648955');
          for (let k = 0; k < 5; k++)
            box(x + 9 + j * 24, 354 + k * 18, 6, 3, '#b6c685');
          poly(
            [
              [x + 10 + j * 24, 366],
              [x - 17 + j * 24, 347],
              [x + 8 + j * 24, 357],
            ],
            '#4f8351',
          );
        }
      }
      if (region === 8) {
        for (let j = 0; j < 3; j++) {
          poly(
            [
              [x + 20 + j * 40, 510],
              [x + 5 + j * 40, 496],
              [x + 22 + j * 40, 501],
              [x + 31 + j * 40, 486],
              [x + 38 + j * 40, 505],
            ],
            '#d990aa',
          );
        }
      }
    }
  }
  if (level === 12 || level === 15) {
    c.fillStyle = '#27335730';
    c.fillRect(0, 280, 432, 230);
  }
}

export function drawVietnamFood(
  c: CanvasRenderingContext2D,
  x: number,
  y: number,
  kind: number,
) {
  c.save();
  c.translate(x, y);
  const box = (a: number, b: number, w: number, h: number, color: string) => {
    c.fillStyle = color;
    c.fillRect(a, b, w, h);
  };
  if (kind === 0 || kind === 4) {
    c.fillStyle = '#f8edcf';
    c.beginPath();
    c.ellipse(0, 0, 18, 7, 0, 0, Math.PI * 2);
    c.fill();
    box(-15, 0, 30, 11, '#f2e7c9');
    box(-10, 11, 20, 4, '#8db2a0');
    c.strokeStyle = '#dabd76';
    c.lineWidth = 2;
    for (let j = 0; j < 3; j++) {
      c.beginPath();
      c.ellipse(-8 + j * 8, -1, 6, 3, 0, 0, Math.PI * 2);
      c.stroke();
    }
    box(-7, -4, 5, 4, '#549959');
    box(6, -2, 7, 3, '#aa6d49');
  } else if (kind === 1) {
    c.rotate(-0.25);
    box(-19, -8, 38, 18, '#c68640');
    box(-16, -11, 32, 18, '#f0c66f');
    box(-17, 1, 34, 4, '#648c41');
    box(-11, -8, 4, 7, '#fff0b0');
    box(2, -8, 4, 7, '#fff0b0');
  } else if (kind === 2) {
    box(-15, -13, 30, 28, '#437849');
    box(-12, -10, 24, 22, '#70a35b');
    box(-2, -13, 3, 28, '#e7d799');
    box(-15, -2, 30, 3, '#e7d799');
  } else if (kind === 3) {
    c.rotate(-0.25);
    for (let i = -1; i < 2; i++) {
      box(-14, i * 10 - 5, 28, 8, '#efefcb');
      box(-10, i * 10 - 3, 9, 4, '#6baf63');
      box(4, i * 10 - 3, 6, 4, '#db9670');
    }
  } else {
    c.fillStyle = '#e7b94e';
    c.beginPath();
    c.arc(0, -4, 19, 0, Math.PI);
    c.fill();
    box(-11, 0, 6, 4, '#7f9c4f');
    box(3, 2, 7, 3, '#bd784a');
  }
  c.restore();
}
