import {createServer} from './server'
import cors from "cors";

const PORT = process.env.PORT || 4000;

const app = createServer();

app.use(
  cors({
    origin: "*", 
  })
);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
