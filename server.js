const express = require('express');
const bodyParser = require('body-parser');
const { VM } = require('vm2');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.post('/run-js', (req, res) => {
  const { code, inputs } = req.body;

  if (!code) {
    return res.status(400).json({ error: 'No code provided' });
  }

  try {
    let logOutput = '';

    const vm = new VM({
      timeout: 1000,
      sandbox: {
        console: {
          log: (message) => {
            logOutput += message + '\n';
          },
        },
        prompt: () => inputs.shift(),
      },
    });

    vm.run(code);

    res.json({ output: logOutput.trim() || 'No output' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/run-cpp', (req, res) => {
  const { code, inputs } = req.body;

  if (!code) {
    return res.status(400).json({ error: 'No code provided' });
  }

  const filePath = path.join(__dirname, 'mycode.cpp');
  const inputFilePath = path.join(__dirname, 'input.txt');
  const outputExe = path.join(__dirname, 'mycode.exe');

  fs.writeFile(filePath, code, (err) => {
    if (err) return res.status(500).json({ error: 'Failed to write code file' });

    fs.writeFile(inputFilePath, inputs.join('\n'), (err) => {
      if (err) return res.status(500).json({ error: 'Failed to write input file' });

      exec(`g++ ${filePath} -o ${outputExe} && ${outputExe} < ${inputFilePath}`, (error, stdout, stderr) => {
        if (error) return res.status(400).json({ error: stderr });
        res.json({ output: stdout });
      });
    });
  });
});

app.post("/run-python", (req, res) => {
  const { code, inputs } = req.body;

  if (!code) {
    return res.status(400).json({ error: "No code provided" });
  }

  const filePath = path.join(__dirname, "mycode.py");
  const inputFilePath = path.join(__dirname, 'input.txt');

  fs.writeFileSync(filePath, code);

  fs.writeFileSync(inputFilePath, inputs.join('\n'));

  exec(`python ${filePath} < ${inputFilePath}`, (error, stdout, stderr) => {
    if (error || stderr) {
      return res.status(400).json({ error: stderr || error.message });
    }
    res.status(200).json({ output: stdout });
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
