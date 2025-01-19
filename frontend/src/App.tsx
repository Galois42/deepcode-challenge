import { Provider } from "react-redux";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { store } from "./store";
import BreachMonitor from "./BreachMonitor"; // Update this import path as needed

// Create a QueryClient instance
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <BreachMonitor />
      </Provider>
    </QueryClientProvider>
  );
}

export default App;
