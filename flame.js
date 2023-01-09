const fs = require('fs');
const path = require('path');

const perfData = fs.readFileSync('perf.csv').toString();

const lines = perfData.split('\n');
lines.shift(); // remove header
lines.pop(); // remove empty line

function splitByPid(lines) {
  const res = {};
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].split('|');

    if (!res[line[0]]) {
      res[line[0]] = [];
    }
    res[line[0]].push(line);
  }

  return res;
}

const byPid = splitByPid(lines);

function toFlameData(lines) {
  let flameData = null;
  let current;

  const stack = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const phase = line[1];
    const isStart = line[2] === ' start ';
    const elapsed = parseInt(line[3]);

    if (isStart) {
      const node = {
        name: phase,
        value: elapsed,
        children: []
      };

      if (flameData === null) {
        flameData = node;
        current = flameData;
      } else {
        current.children.push(node);
        current = node;
      }
      stack.push({line: line, node: current});
    } else {
      const popped = stack.pop();
      popped.node.value = elapsed - popped.node.value;

      current = stack[stack.length -1] ? stack[stack.length -1].node : null;
      if (popped.line[1] !== phase) {
        throw Error(`phase missmatch: ${popped.line[1]} vs ${phase}`);
      }
    }
  }

  return flameData;
}

const converted = Object.entries(byPid).map((item) => {
  return [item[0], toFlameData(item[1])];
});


if (!fs.existsSync('perf')){
  fs.mkdirSync('perf');
}

converted.map((item) => {
  let folderName = new Date().toTimeString();
  fs.mkdirSync(`perf/${folderName}`);
  const fileName = `perf/${folderName}/${item[0].trim()}.json`;
  fs.writeFileSync(fileName, JSON.stringify(item[1]));
  console.log(path.resolve(fileName));
});
