import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import ResourcesPage from "./pages/ResourcesPage";
import ResourceDetailPage from "./pages/ResourceDetailPage";
import AdminResourcesPage from "./pages/AdminResourcesPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ResourcesPage />} />
        <Route path="/resource/:id" element={<ResourceDetailPage />} />
        <Route path="/admin/resources" element={<AdminResourcesPage />} />
      </Routes>
    </Router>
  );
}

export default App;