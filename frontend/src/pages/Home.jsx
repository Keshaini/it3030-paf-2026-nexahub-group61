import { Link } from 'react-router-dom'

const highlights = [
  {
    title: 'Facility and Asset Booking',
    description: 'Book lecture halls, labs, and equipment with clear approval flow and live availability.',
  },
  {
    title: 'Maintenance and Incident Handling',
    description: 'Report faults, track technician updates, and close issues with accountable resolution notes.',
  },
  {
    title: 'Role-Based and Auditable',
    description: 'Students, staff, admins, and technicians all work through one transparent workflow history.',
  },
]

const workflow = [
  {
    title: 'Choose a resource',
    description: 'Browse rooms, labs, and equipment with capacity, zone, and live booking context.',
  },
  {
    title: 'Submit a request',
    description: 'Send a booking with date, time, attendees, and purpose in one clean form.',
  },
  {
    title: 'Track the result',
    description: 'Watch approval status, notifications, and your request history from the dashboard.',
  },
]

const platformStats = [
  { label: 'Spaces tracked', value: '120+' },
  { label: 'Approval workflows', value: '24/7' },
  { label: 'Audit records', value: '100%' },
  { label: 'User roles', value: '4+' },
]

const Home = () => {
  return (
    <div className="min-h-screen bg-[#f4efe9] text-slate-900">
      <main className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14">
        <section className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-7 shadow-xl sm:p-10">
          <div className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-cyan-200/60 blur-3xl"></div>
          <div className="pointer-events-none absolute -bottom-20 left-0 h-56 w-56 rounded-full bg-orange-200/60 blur-3xl"></div>

          <div className="relative z-10 grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
            <div>
              <p className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-slate-600">
                University Operations Hub
              </p>
              <h2 className="mt-4 text-4xl font-black leading-tight sm:text-5xl">
                One Platform for Booking, Maintenance, and Campus Service Visibility
              </h2>
              <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-600">
                Modernize daily operations with a single web platform built for room and lab reservations,
                equipment allocation, issue reporting, technician collaboration, and resolution tracking.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/signup" className="rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-orange-500/30 hover:bg-orange-600">
                  Create Account
                </Link>
                <Link to="/login" className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50">
                  Access Portal
                </Link>
                <Link to="/dashboard" className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50">
                  View Dashboard
                </Link>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <article className="rounded-2xl bg-slate-900 p-5 text-white">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-300">Today</p>
                <p className="mt-2 text-3xl font-black">426</p>
                <p className="text-sm text-slate-300">Total booking requests</p>
              </article>
              <article className="rounded-2xl bg-cyan-500 p-5 text-white">
                <p className="text-xs uppercase tracking-[0.2em] text-cyan-100">Maintenance</p>
                <p className="mt-2 text-3xl font-black">38</p>
                <p className="text-sm text-cyan-100">Open incidents under review</p>
              </article>
              <article className="rounded-2xl bg-violet-700 p-5 text-white">
                <p className="text-xs uppercase tracking-[0.2em] text-violet-200">Auditability</p>
                <p className="mt-2 text-sm leading-relaxed text-violet-100">
                  Every status change is recorded with actor, timestamp, and resolution context.
                </p>
              </article>
            </div>
          </div>
        </section>

        <section className="mt-10 grid gap-4 md:grid-cols-3">
          {highlights.map((item) => (
            <article key={item.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-xl font-black">{item.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">{item.description}</p>
            </article>
          ))}
        </section>

        <section className="mt-10 rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm sm:p-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-slate-500">How it works</p>
              <h3 className="mt-2 text-3xl font-black text-slate-950">A simple path from request to approval</h3>
            </div>
            <Link to="/resources" className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              Explore Resources
            </Link>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            {workflow.map((item, index) => (
              <article key={item.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">
                  0{index + 1}
                </div>
                <h4 className="mt-4 text-lg font-black text-slate-900">{item.title}</h4>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {platformStats.map((stat) => (
            <article key={stat.label} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-3xl font-black text-slate-950">{stat.value}</p>
              <p className="mt-2 text-sm text-slate-500">{stat.label}</p>
            </article>
          ))}
        </section>
      </main>
    </div>
  )
}

export default Home
