import { Link } from "react-router-dom";

const TYPE_STYLES = {
  LECTURE_HALL: "bg-blue-100 text-blue-700",
  LAB: "bg-emerald-100 text-emerald-700",
  MEETING_ROOM: "bg-violet-100 text-violet-700",
  EQUIPMENT: "bg-amber-100 text-amber-700",
};

const TYPE_LABELS = {
  LECTURE_HALL: "Lecture Hall",
  LAB: "Lab",
  MEETING_ROOM: "Meeting Room",
  EQUIPMENT: "Equipment",
};

export default function ResourceCard({ resource, onBook }) {
  const typeStyle = TYPE_STYLES[resource.type] || TYPE_STYLES.EQUIPMENT;

  const isAvailable = resource.status === "ACTIVE";

  return (
    <div className="group rounded-2xl border bg-white p-5 shadow-sm transition hover:shadow-md hover:-translate-y-1">

      {/* 🔹 TOP ROW */}
      <div className="flex justify-between items-start gap-2">

        {/* TYPE */}
        <span className={`text-xs font-bold px-3 py-1 rounded-full ${typeStyle}`}>
          {TYPE_LABELS[resource.type]}
        </span>

        {/* STATUS */}
        <span
          className={`text-xs font-bold px-3 py-1 rounded-full ${
            isAvailable
              ? "bg-emerald-100 text-emerald-700"
              : "bg-rose-100 text-rose-700"
          }`}
        >
          {isAvailable ? "Available" : "Unavailable"}
        </span>
      </div>

      {/* 🔹 TITLE */}
      <h3 className="mt-3 text-lg font-black text-slate-900">
        {resource.name}
      </h3>

      {/* 🔹 LOCATION */}
      <p className="text-sm text-slate-500 mt-1">
        📍 {resource.location}
      </p>

      {/* 🔹 DETAILS */}
      <div className="flex justify-between text-xs text-slate-500 mt-4 pt-3 border-t border-dashed">
        <span>
          👥 {resource.capacity ? `${resource.capacity} seats` : "N/A"}
        </span>

        <span>
          🕒{" "}
          {resource.availabilityStart
            ? `${resource.availabilityStart} - ${resource.availabilityEnd}`
            : "Flexible"}
        </span>
      </div>

      {/* 🔹 ACTIONS */}
      <div className="mt-4 flex gap-2">

        {/* VIEW DETAILS */}
        <Link
          to={`/resource/${resource.id}`}
          className="w-1/2 text-center rounded-xl border border-slate-300 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
        >
          View
        </Link>

        {/* BOOK BUTTON */}
        <button
          onClick={onBook}
          disabled={!isAvailable}
          className={`w-1/2 rounded-xl py-2 text-sm font-bold text-white transition ${
            isAvailable
              ? "bg-blue-600 hover:bg-blue-700"
              : "bg-slate-300 cursor-not-allowed"
          }`}
        >
          Book
        </button>
      </div>

      {/* 🔹 HINT TEXT */}
      <p className="mt-3 text-xs text-blue-600 opacity-0 group-hover:opacity-100 transition">
        Quick booking available →
      </p>
    </div>
  );
}