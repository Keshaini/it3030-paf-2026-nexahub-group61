import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { resourcesApi } from "../api/resourcesApi";
import ResourceCard from "../components/ResourceCard";
import UserPortalSidebar from "../components/UserPortalSidebar.jsx";
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

  /* 📊 Stats */
  const total = resources.length;
  const highCapacity = resources.filter((r) => r.capacity >= 50).length;
  const labs = resources.filter((r) => r.type === "LAB").length;

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#f5efe8] p-2 sm:p-3 lg:p-4">
      <div className="grid h-full w-full gap-3 rounded-[2rem] bg-slate-50 p-3 shadow-2xl lg:grid-cols-[260px_minmax(0,1fr)] lg:p-4">

        {/* 🔹 SIDEBAR */}
        <UserPortalSidebar user={user} activeItem="resources" />

        {/* 🔹 MAIN CONTENT */}
        <main className="overflow-auto rounded-[1.5rem] bg-white p-4 sm:p-6">
          <div className="rounded-[2rem] border border-white/60 bg-[linear-gradient(180deg,#f6efe7_0%,#eef5ff_100%)] p-4 shadow-2xl sm:p-6">

            {/* 🔹 HEADER */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-5">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                  Resource Catalogue
                </p>
                <h1 className="text-3xl font-black text-slate-900">
                  Explore Resources
                </h1>
                <p className="text-sm text-slate-600 mt-1">
                  Browse and book lecture halls, labs, and equipment
                </p>
              </div>
            </div>

            {/* 🔹 STATS CARDS */}
            <section className="mt-6 grid gap-4 md:grid-cols-3">
              <StatCard label="Total Resources" value={total} />
              <StatCard label="High Capacity (50+)" value={highCapacity} />
              <StatCard label="Labs Available" value={labs} />
            </section>

            {/* 🔹 FILTERS */}
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

            {/* 🔹 CONTENT */}
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
                  <ResourceCard
                    key={r.id}
                    resource={r}
                    onBook={() => handleBook(r.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

/* 🔹 STAT CARD COMPONENT */
const StatCard = ({ label, value }) => (
  <div className="rounded-2xl bg-gradient-to-br from-slate-100 to-slate-50 p-5">
    <p className="text-xs uppercase text-slate-500">{label}</p>
    <p className="text-3xl font-black text-slate-900 mt-2">{value}</p>
  </div>
);