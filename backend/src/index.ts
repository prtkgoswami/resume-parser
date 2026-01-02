import {createServer} from './server'

const PORT = 4000;

const app = createServer();

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
