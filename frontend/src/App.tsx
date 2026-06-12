import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ListsPage from "./routes/ListsPage";
import ListDetailPage from "./routes/ListDetailPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/lists" replace />} />
        <Route path="/lists" element={<ListsPage />} />
        <Route path="/lists/:listId" element={<ListDetailPage />} />
      </Routes>
    </BrowserRouter>
  );
}
