import { createServer } from 'http';  
import { readFile } from 'fs/promises';
import path from 'path';

const PORT = 3000;
const urlDatabase = {}; // Store URLs in-memory

const serverFile = async (res, filePath, contentType) => {
    try {
        const data = await readFile(filePath);
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(data);
    } catch (err) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end("File not found");
    }
};

const server = createServer(async (req, res) => {
    console.log(req.url);

    if (req.method === "GET") {
        if (req.url === "/") {
            return serverFile(res, path.join("public", "index.html"), "text/html");
        } else if (req.url === "/styles.css") {
            return serverFile(res, path.join("public", "styles.css"), "text/css");
        } else if (req.url.startsWith('/short/')) {
            const shortCode = req.url.split('/')[2];
            const originalUrl = urlDatabase[shortCode];
            if (originalUrl) {
                res.writeHead(302, { 'Location': originalUrl });
                res.end();
            } else {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end("Short URL not found.");
            }
        }
    }

    if (req.method === "POST" && req.url === "/shorten") {
        let body = "";
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            const { url, Shortcode } = JSON.parse(body);
            if (!url || !Shortcode || urlDatabase[Shortcode]) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ error: 'Invalid request or shortcode already in use.' }));
            }
            urlDatabase[Shortcode] = url;
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ shortUrl: `http://localhost:${PORT}/short/${Shortcode}` }));
        });
    }
});

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
