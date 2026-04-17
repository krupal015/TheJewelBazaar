import { useEffect } from "react";
import AppRoutes from "./routes/AppRoutes";
import { useAuthStore } from "./store/store";

function App() {
  useEffect(() => {
    useAuthStore.getState().bootstrap();
  }, []);

  return <AppRoutes />;
}
export default App;

