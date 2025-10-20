import app from "./server";
import { connectDB } from "./config";

connectDB();

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
