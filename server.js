// dev.ts (or dev.js if using JavaScript)
import app from "./dist/index.js";

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
