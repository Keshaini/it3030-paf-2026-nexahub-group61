import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { resourcesApi } from "../api/resourcesApi";
import ResourceCard from "../components/ResourceCard";
import UserPortalSidebar from "../components/UserPortalSidebar.jsx";
import ResourceForm from "../components/ResourceForm";
import { getAuthUser } from "../auth/roles.js";

const TYPES = ["", "LECTURE_HALL", "LAB", "MEETING_ROOM", "EQUIPMENT"];

const TYPE_LABELS = {
  "": "All types",
  LECTURE_HALL: "Lecture Hall",
  LAB: "Lab",
  MEETING_ROOM: "Meeting Room",
  EQUIPMENT: "Equipment",
};

export default function ResourcesPage() {
  const navigate = useNavigate();
  const user = getAuthUser();

  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ================= CRUD STATES ================= */
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  /* ================= FILTERS ================= */
  const [filters, setFilters] = useState({
    type: "",
    location: "",
    minCapacity: "",
    sort: "name",
  });

  useEffect(() => {
    loadResources();
  }, [filters]);

  const loadResources = () => {
    setLoading(true);

    resourcesApi
      .getAll({
        type: filters.type || undefined,
        location: filters.location || undefined,
        minCapacity: filters.minCapacity || undefined,
        status: "ACTIVE",
      })
      .then((data) => {
        let sorted = [...data];

        if (filters.sort === "name") {
          sorted.sort((a, b) => a.name.localeCompare(b.name));
        }

        if (filters.sort === "capacity") {
          sorted.sort((a, b) => b.capacity - a.capacity);
        }

        setResources(sorted);
      })
      .finally(() => setLoading(false));
  };

  const setFilter = (key) => (e) =>
    setFilters((f) => ({ ...f, [key]: e.target.value }));

  const handleBook = (resourceId) => {
    navigate(`/dashboard?resourceId=${resourceId}`);
  };

  /* ================= CREATE / UPDATE ================= */

  const handleSubmit = async (data) => {
    setSaving(true);

    try {
      if (editTarget) {
        await resourcesApi.update(editTarget.id, data);
      } else {
        await resourcesApi.create(data);
      }

      setShowForm(false);
      setEditTarget(null);
      loadResources();
    } finally {
      setSaving(false);
    }
  };

  /* ================= DELETE ================= */

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this resource?"))
      return;

    setDeleteId(id);

    try {
      await resourcesApi.delete(id);
      setResources((prev) => prev.filter((r) => r.id !== id));
    } finally {
      setDeleteId(null);
    }
  };

  /* ================= STATS ================= */

  const total = resources.length;
  const highCapacity = resources.filter((r) => r.capacity >= 50).length;
  const labs = resources.filter((r) => r.type === "LAB").length;

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#f5efe8] p-2 sm:p-3 lg:p-4">

      <div className="grid h-full w-full gap-3 rounded-[2rem] bg-slate-50 p-3 shadow-2xl lg:grid-cols-[260px_minmax(0,1fr)] lg:p-4">

        {/* ================= SIDEBAR ================= */}
        <UserPortalSidebar user={user} activeItem="resources" />

        {/* ================= MAIN ================= */}
        <main className="overflow-auto rounded-[1.5rem] bg-white p-4 sm:p-6">

          <div className="rounded-[2rem] border border-white/60 bg-gradient-to-b from-[#f6efe7] to-[#eef5ff] p-4 shadow-2xl sm:p-6">

            {/* ================= HEADER ================= */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-5">

              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                  Resource Catalogue
                </p>

                <h1 className="text-3xl font-black text-slate-900">
                  Explore Resources
                </h1>

                <p className="text-sm text-slate-600 mt-1">
                  Manage, book and maintain university resources
                </p>
              </div>

              {/* ➕ ADD BUTTON */}
              <button
                onClick={() => {
                  setEditTarget(null);
                  setShowForm(true);
                }}
                className="px-5 py-2 bg-blue-600 text-white rounded-xl shadow-md hover:bg-blue-700"
              >
                + Add Resource
              </button>
            </div>

            {/* ================= STATS ================= */}
            <section className="mt-6 grid gap-4 md:grid-cols-3">
              <StatCard label="Total Resources" value={total} />
              <StatCard label="High Capacity (50+)" value={highCapacity} />
              <StatCard label="Labs Available" value={labs} />
            </section>

            {/* ================= FILTERS ================= */}
            <section className="mt-6 rounded-2xl border bg-white p-4 shadow-sm">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

                <select
                  value={filters.type}
                  onChange={setFilter("type")}
                  className="rounded-xl border px-4 py-2"
                >
                  {TYPES.map((t) => (
                    <option key={t} value={t}>
                      {TYPE_LABELS[t]}
                    </option>
                  ))}
                </select>

                <input
                  placeholder="Location"
                  value={filters.location}
                  onChange={setFilter("location")}
                  className="rounded-xl border px-4 py-2"
                />

                <input
                  type="number"
                  placeholder="Min capacity"
                  value={filters.minCapacity}
                  onChange={setFilter("minCapacity")}
                  className="rounded-xl border px-4 py-2"
                />

                <select
                  value={filters.sort}
                  onChange={setFilter("sort")}
                  className="rounded-xl border px-4 py-2"
                >
                  <option value="name">Sort by Name</option>
                  <option value="capacity">Sort by Capacity</option>
                </select>

              </div>
            </section>

            {/* ================= MODAL FORM (FIXED CRUD UI) ================= */}
            {showForm && (
              <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

                <div className="bg-white w-full max-w-2xl rounded-2xl p-6 shadow-2xl relative">

                  {/* CLOSE */}
                  <button
                    onClick={() => {
                      setShowForm(false);
                      setEditTarget(null);
                    }}
                    className="absolute top-3 right-4 text-gray-500 hover:text-black"
                  >
                    ✕
                  </button>

                  {/* TITLE */}
                  <h2 className="text-xl font-bold mb-4">
                    {editTarget ? "Edit Resource" : "Add Resource"}
                  </h2>

                  {/* FORM */}
                  <ResourceForm
                    initial={editTarget || {}}
                    onSubmit={handleSubmit}
                    loading={saving}
                  />

                  {/* 🔥 EXPLICIT ACTION BUTTONS (IMPORTANT FOR SCREENSHOTS) */}
                  <div className="flex justify-end gap-3 mt-4">

                    <button
                      onClick={() => {
                        setShowForm(false);
                        setEditTarget(null);
                      }}
                      className="px-4 py-2 rounded-xl border"
                    >
                      Cancel
                    </button>

                    <button
                      onClick={() =>
                        document.querySelector("form")?.requestSubmit()
                      }
                      className="px-4 py-2 bg-blue-600 text-white rounded-xl"
                    >
                      {editTarget ? "Update Resource" : "Add Resource"}
                    </button>

                  </div>

                </div>

              </div>
            )}

            {/* ================= CONTENT ================= */}
            {loading ? (
              <div className="mt-10 text-center text-slate-500">
                Loading resources...
              </div>
            ) : resources.length === 0 ? (
              <div className="mt-10 text-center text-slate-500">
                No resources found
              </div>
            ) : (
              <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">

                {resources.map((r) => (
                  <div key={r.id}>

                    <ResourceCard
                      resource={r}
                      onBook={() => handleBook(r.id)}
                    />

                    {/* ADMIN ACTIONS */}
                    <div className="flex gap-2 mt-2">

                      <button
                        onClick={() => {
                          setEditTarget(r);
                          setShowForm(true);
                        }}
                        className="px-2 py-1 text-xs bg-yellow-400 rounded"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => handleDelete(r.id)}
                        className="px-2 py-1 text-xs bg-red-500 text-white rounded"
                      >
                        {deleteId === r.id ? "..." : "Delete"}
                      </button>

                    </div>

                  </div>
                ))}

              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}

/* ================= STAT CARD ================= */
const StatCard = ({ label, value }) => (
  <div className="rounded-2xl bg-gradient-to-br from-slate-100 to-slate-50 p-5">
    <p className="text-xs uppercase text-slate-500">{label}</p>
    <p className="text-3xl font-black text-slate-900 mt-2">{value}</p>
  </div>
);