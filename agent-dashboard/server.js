const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 4173;
const ROOT = __dirname;
const DATA_FILE = path.join(ROOT, 'data.json');

function readData() {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    return { agents: [], tasks: [], activities: [] };
  }
}

function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

function sendJson(res, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(200, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(body)
  });
  res.end(body);
}

function notFound(res) {
  res.writeHead(404);
  res.end('Not found');
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (req.method === 'GET' && (url.pathname === '/' || url.pathname === '/index.html')) {
    const filePath = path.join(ROOT, 'index.html');
    fs.readFile(filePath, (err, content) => {
      if (err) {
        res.writeHead(500);
        return res.end('Error loading index.html');
      }
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(content);
    });
    return;
  }

  if (req.method === 'GET' && url.pathname === '/style.css') {
    const filePath = path.join(ROOT, 'style.css');
    fs.readFile(filePath, (err, content) => {
      if (err) return notFound(res);
      res.writeHead(200, { 'Content-Type': 'text/css' });
      res.end(content);
    });
    return;
  }

  if (req.method === 'GET' && url.pathname === '/app.js') {
    const filePath = path.join(ROOT, 'app.js');
    fs.readFile(filePath, (err, content) => {
      if (err) return notFound(res);
      res.writeHead(200, { 'Content-Type': 'application/javascript' });
      res.end(content);
    });
    return;
  }

  if (req.method === 'GET' && url.pathname === '/api/state') {
    const data = readData();
    return sendJson(res, data);
  }

  if (req.method === 'POST' && url.pathname === '/api/task') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body || '{}');
        const { title, agentId } = payload;
        if (!title || !agentId) {
          res.writeHead(400);
          return res.end('Missing title or agentId');
        }
        const data = readData();
        const id = Date.now().toString();
        const now = new Date().toISOString();
        const task = { id, title, agentId, status: 'todo', createdAt: now, updatedAt: now };
        data.tasks.push(task);
        data.activities.unshift({
          time: now,
          type: 'info',
          text: `Task baru untuk ${agentId}: ${title}`
        });
        writeData(data);
        return sendJson(res, { ok: true, task });
      } catch (e) {
        res.writeHead(500);
        return res.end('Error parsing body');
      }
    });
    return;
  }

  if (req.method === 'POST' && url.pathname === '/api/task/status') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body || '{}');
        const { id, status } = payload;
        if (!id || !status) {
          res.writeHead(400);
          return res.end('Missing id or status');
        }
        const data = readData();
        const task = data.tasks.find(t => t.id === id);
        if (!task) {
          res.writeHead(404);
          return res.end('Task not found');
        }
        task.status = status;
        task.updatedAt = new Date().toISOString();
        data.activities.unshift({
          time: task.updatedAt,
          type: 'info',
          text: `Task ${id} pindah ke ${status.toUpperCase()}`
        });
        writeData(data);
        return sendJson(res, { ok: true, task });
      } catch (e) {
        res.writeHead(500);
        return res.end('Error parsing body');
      }
    });
    return;
  }

  if (req.method === 'POST' && url.pathname === '/api/activity') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body || '{}');
        const now = new Date().toISOString();
        const { text, type, agentId, time } = payload;
        if (!text) {
          res.writeHead(400);
          return res.end('Missing text');
        }
        const data = readData();
        data.activities.unshift({
          time: time || now,
          type: type || 'info',
          agentId: agentId || null,
          text
        });
        // Optional: trim log to avoid unbounded growth
        if (data.activities.length > 500) {
          data.activities = data.activities.slice(0, 500);
        }
        writeData(data);
        return sendJson(res, { ok: true });
      } catch (e) {
        res.writeHead(500);
        return res.end('Error parsing body');
      }
    });
    return;
  }

  notFound(res);
});

server.listen(PORT, () => {
  console.log(`Agent dashboard server running on port ${PORT}`);
});
