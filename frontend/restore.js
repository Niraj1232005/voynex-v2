/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');

const adminDir = path.join(__dirname, 'src', 'app', 'admin');
const agencyDir = path.join(__dirname, 'src', 'app', 'agency');

const createPage = (dir, name, content) => {
  const pageDir = path.join(dir, name);
  if (!fs.existsSync(pageDir)) fs.mkdirSync(pageDir, { recursive: true });
  fs.writeFileSync(path.join(pageDir, 'page.tsx'), content);
};

// ==========================================
// ADMIN PAGES
// ==========================================

const adminUsersCode = `'use client';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiUsers, FiSearch, FiEdit, FiTrash2, FiUserCheck, FiUserX } from 'react-icons/fi';

export default function AdminUsersPage() {
  const [search, setSearch] = useState('');
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Users Management</h1>
          <p className="text-sm text-muted">Manage all registered travelers</p>
        </div>
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input type="text" placeholder="Search users..." className="pl-10 pr-4 py-2 rounded-xl border border-border bg-card text-sm focus:ring-2 focus:ring-primary/50 outline-none" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-surface-hover/50 border-b border-border">
            <tr><th className="p-4 font-medium text-muted">Name</th><th className="p-4 font-medium text-muted">Email</th><th className="p-4 font-medium text-muted">Joined</th><th className="p-4 font-medium text-muted">Status</th><th className="p-4 font-medium text-muted text-right">Actions</th></tr>
          </thead>
          <tbody>
            {[1,2,3,4,5].map(i => (
              <tr key={i} className="border-b border-border last:border-0 hover:bg-surface-hover/30">
                <td className="p-4 font-medium">User {i}</td><td className="p-4 text-muted">user{i}@example.com</td><td className="p-4 text-muted">Oct 2025</td>
                <td className="p-4"><span className="px-2 py-1 rounded-full bg-teal/10 text-teal text-[10px] font-bold uppercase">Active</span></td>
                <td className="p-4 flex gap-2 justify-end">
                  <button className="p-1.5 text-muted hover:text-primary"><FiEdit size={16}/></button>
                  <button className="p-1.5 text-muted hover:text-orange"><FiUserX size={16}/></button>
                  <button className="p-1.5 text-muted hover:text-red-500"><FiTrash2 size={16}/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}`;

const adminAgenciesCode = `'use client';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiBriefcase, FiSearch, FiCheck, FiX, FiEye } from 'react-icons/fi';

export default function AdminAgenciesPage() {
  const [search, setSearch] = useState('');
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Agency Management</h1>
          <p className="text-sm text-muted">Approve and monitor travel agencies</p>
        </div>
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input type="text" placeholder="Search agencies..." className="pl-10 pr-4 py-2 rounded-xl border border-border bg-card text-sm outline-none" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1,2,3].map(i => (
          <div key={i} className="p-5 rounded-2xl border border-border bg-card hover:shadow-lg transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">A{i}</div>
              <div>
                <h3 className="font-bold">Agency {i}</h3>
                <p className="text-xs text-muted">contact@agency{i}.com</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="p-3 rounded-lg bg-surface-hover"><p className="text-xs text-muted">Trips</p><p className="font-bold">12</p></div>
              <div className="p-3 rounded-lg bg-surface-hover"><p className="text-xs text-muted">Revenue</p><p className="font-bold">₹2.4L</p></div>
            </div>
            <div className="flex gap-2">
              <button className="flex-1 py-2 rounded-lg bg-teal/10 text-teal text-xs font-bold hover:bg-teal/20 transition-all">Approve</button>
              <button className="flex-1 py-2 rounded-lg bg-red-500/10 text-red-500 text-xs font-bold hover:bg-red-500/20 transition-all">Reject</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}`;

const adminTripsCode = `'use client';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiMap, FiSearch, FiTrash2, FiEyeOff } from 'react-icons/fi';
import { mockTrips } from '@/lib/mockData';

export default function AdminTripsPage() {
  const [search, setSearch] = useState('');
  const trips = mockTrips;
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Platform Trips</h1>
          <p className="text-sm text-muted">Monitor all trips created by agencies</p>
        </div>
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input type="text" placeholder="Search trips..." className="pl-10 pr-4 py-2 rounded-xl border border-border bg-card text-sm outline-none" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-surface-hover/50 border-b border-border">
            <tr><th className="p-4 font-medium text-muted">Trip</th><th className="p-4 font-medium text-muted">Agency</th><th className="p-4 font-medium text-muted">Price</th><th className="p-4 font-medium text-muted text-right">Actions</th></tr>
          </thead>
          <tbody>
            {trips.map(t => (
              <tr key={t._id} className="border-b border-border hover:bg-surface-hover/30">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    {t.images && t.images[0] ? <img src={t.images[0]} alt="" className="w-10 h-10 rounded-lg object-cover" /> : <div className="w-10 h-10 rounded-lg bg-surface-hover" />}
                    <div><p className="font-medium">{t.title}</p><p className="text-xs text-muted">{t.destination}</p></div>
                  </div>
                </td>
                <td className="p-4 text-muted">{t.agency.name}</td>
                <td className="p-4 font-medium text-primary">₹{t.price}</td>
                <td className="p-4 flex gap-2 justify-end">
                  <button className="p-1.5 text-muted hover:text-orange"><FiEyeOff size={16}/></button>
                  <button className="p-1.5 text-muted hover:text-red-500"><FiTrash2 size={16}/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}`;

const adminBookingsCode = `'use client';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiCalendar, FiSearch } from 'react-icons/fi';
import { mockAgencyBookings } from '@/lib/mockData';

export default function AdminBookingsPage() {
  const [search, setSearch] = useState('');
  const bookings = mockAgencyBookings;
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Global Bookings</h1>
          <p className="text-sm text-muted">Oversight of all platform transactions</p>
        </div>
      </div>
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-surface-hover/50 border-b border-border">
            <tr><th className="p-4 font-medium text-muted">ID</th><th className="p-4 font-medium text-muted">Trip</th><th className="p-4 font-medium text-muted">User</th><th className="p-4 font-medium text-muted">Amount</th><th className="p-4 font-medium text-muted">Status</th></tr>
          </thead>
          <tbody>
            {bookings.map(b => (
              <tr key={b._id} className="border-b border-border hover:bg-surface-hover/30">
                <td className="p-4 font-mono text-xs text-muted">{b._id.toUpperCase()}</td>
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    {b.trip.images && b.trip.images[0] ? <img src={b.trip.images[0]} alt="" className="w-8 h-8 rounded-lg object-cover" /> : null}
                    <div><p className="font-medium max-w-[150px] truncate">{b.trip.title}</p></div>
                  </div>
                </td>
                <td className="p-4"><p className="font-medium">{b.userName}</p><p className="text-xs text-muted">{b.userEmail}</p></td>
                <td className="p-4 font-bold">₹{b.totalPrice}</td>
                <td className="p-4"><span className="px-2 py-1 rounded-full bg-surface-hover text-xs uppercase font-bold">{b.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}`;

const adminReviewsCode = `'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { FiStar, FiTrash2 } from 'react-icons/fi';
import { mockReviews } from '@/lib/mockData';

export default function AdminReviewsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Reviews Moderation</h1>
          <p className="text-sm text-muted">Monitor and moderate user feedback</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockReviews.map(r => (
          <div key={r._id} className="p-5 rounded-2xl border border-border bg-card hover:shadow-lg transition-all">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="font-bold">{r.user.name}</p>
                <div className="flex text-yellow-500 text-xs mt-1">
                  {[...Array(5)].map((_, i) => <FiStar key={i} fill={i < r.rating ? 'currentColor' : 'none'} />)}
                </div>
              </div>
              <button className="p-1.5 text-muted hover:text-red-500 rounded-lg hover:bg-red-500/10"><FiTrash2 size={16}/></button>
            </div>
            <p className="text-sm text-muted italic">&quot;{r.comment}&quot;</p>
            <p className="text-[10px] text-muted mt-3 text-right">{new Date(r.createdAt).toLocaleDateString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}`;

const adminAnalyticsCode = `'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { FiBarChart2 } from 'react-icons/fi';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [{ month: 'Jan', rev: 4000 }, { month: 'Feb', rev: 3000 }, { month: 'Mar', rev: 2000 }, { month: 'Apr', rev: 2780 }, { month: 'May', rev: 1890 }, { month: 'Jun', rev: 2390 }, { month: 'Jul', rev: 3490 }];

export default function AdminAnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Platform Analytics</h1>
        <p className="text-sm text-muted">Deep dive into platform performance</p>
      </div>
      <div className="h-[400px] w-full bg-card border border-border rounded-2xl p-6">
        <h3 className="font-bold mb-6">Revenue Growth</h3>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--brd)" />
            <XAxis dataKey="month" stroke="var(--mut)" />
            <YAxis stroke="var(--mut)" />
            <Tooltip />
            <Area type="monotone" dataKey="rev" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}`;

const adminSubscriptionsCode = `'use client';
import React from 'react';
import { FiCreditCard } from 'react-icons/fi';

export default function AdminSubscriptionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Subscription Plans</h1>
        <p className="text-sm text-muted">Manage agency pricing tiers</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {['Free', 'Pro', 'Premium'].map(tier => (
          <div key={tier} className="p-6 rounded-2xl border border-border bg-card flex flex-col">
            <h3 className="text-xl font-bold">{tier} Plan</h3>
            <p className="text-3xl font-bold text-primary mt-4 mb-6">{tier==='Free'?'₹0':tier==='Pro'?'₹4,999':'₹9,999'}<span className="text-sm text-muted">/mo</span></p>
            <ul className="space-y-3 mb-8 flex-1 text-sm text-muted">
              <li>✓ Up to {tier==='Free'?'5':'Unlimited'} trips</li>
              <li>✓ {tier==='Free'?'Basic':'Advanced'} Analytics</li>
              <li>✓ {tier==='Premium'?'Priority':'Standard'} Support</li>
            </ul>
            <button className="w-full py-2.5 rounded-xl bg-surface-hover font-medium">Edit Plan</button>
          </div>
        ))}
      </div>
    </div>
  );
}`;

const adminRentalsCode = `'use client';
import React from 'react';
import { FiTruck } from 'react-icons/fi';
import { mockAgencyRentals } from '@/lib/mockData';

export default function AdminRentalsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Global Rentals</h1>
        <p className="text-sm text-muted">Oversight of all rental items</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockAgencyRentals.map(r => (
          <div key={r._id} className="p-4 rounded-2xl border border-border bg-card flex gap-4 items-center">
            {r.images && r.images[0] ? <img src={r.images[0]} className="w-16 h-16 rounded-xl object-cover" /> : <div className="w-16 h-16 rounded-xl bg-surface-hover" />}
            <div>
              <h3 className="font-bold">{r.name}</h3>
              <p className="text-xs text-muted">{r.location} • ₹{r.pricePerDay}/day</p>
              <span className={\`mt-2 inline-block px-2 py-0.5 rounded-full text-[10px] uppercase font-bold \${r.available?'bg-teal/10 text-teal':'bg-red-500/10 text-red-500'}\`}>{r.available?'Available':'Out'}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}`;

const adminSystemCode = `'use client';
import React from 'react';
import { FiActivity, FiCpu, FiHardDrive } from 'react-icons/fi';

export default function AdminSystemPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">System Health</h1>
        <p className="text-sm text-muted">Live infrastructure monitoring</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl border border-border bg-card">
          <div className="flex items-center gap-3 mb-4"><FiCpu size={20} className="text-primary"/> <h3 className="font-bold">CPU Usage</h3></div>
          <div className="text-4xl font-bold">24%</div>
          <div className="w-full h-2 bg-surface-hover rounded-full mt-4 overflow-hidden"><div className="h-full w-1/4 bg-primary rounded-full"/></div>
        </div>
        <div className="p-6 rounded-2xl border border-border bg-card">
          <div className="flex items-center gap-3 mb-4"><FiHardDrive size={20} className="text-teal"/> <h3 className="font-bold">Memory</h3></div>
          <div className="text-4xl font-bold">4.2 GB <span className="text-sm text-muted">/ 16 GB</span></div>
          <div className="w-full h-2 bg-surface-hover rounded-full mt-4 overflow-hidden"><div className="h-full w-1/3 bg-teal rounded-full"/></div>
        </div>
      </div>
      <div className="p-6 rounded-2xl border border-border bg-[#0d1117] text-green-400 font-mono text-xs space-y-2 h-[300px] overflow-y-auto">
        <p>[SYS] Server started on port 3000</p>
        <p>[DB] Connected to MongoDB replica set</p>
        <p>[AUTH] JWT keys rotated successfully</p>
        <p className="text-blue-400">[API] GET /api/v1/trips 200 OK 45ms</p>
        <p className="text-blue-400">[API] POST /api/v1/bookings 201 CREATED 120ms</p>
        <p className="text-yellow-400">[WARN] High memory usage detected in worker 4</p>
        <p className="text-blue-400">[API] GET /api/v1/rentals 200 OK 32ms</p>
      </div>
    </div>
  );
}`;

// ==========================================
// AGENCY PAGES
// ==========================================

const agencyTripsCode = `'use client';
import React from 'react';
import { FiMap, FiPlus, FiEdit, FiTrash2 } from 'react-icons/fi';
import { mockTrips } from '@/lib/mockData';

export default function AgencyTripsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Trips</h1>
          <p className="text-sm text-muted">Manage your listed experiences</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-medium hover:opacity-90"><FiPlus/> Add Trip</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {mockTrips.map(t => (
          <div key={t._id} className="rounded-2xl border border-border bg-card overflow-hidden hover:shadow-lg transition-all">
            {t.images && t.images[0] ? <img src={t.images[0]} className="w-full h-40 object-cover" /> : <div className="w-full h-40 bg-surface-hover" />}
            <div className="p-5">
              <h3 className="font-bold truncate">{t.title}</h3>
              <p className="text-xs text-muted mb-4">{t.destination} • {t.duration} days</p>
              <div className="flex items-center justify-between">
                <span className="font-bold text-primary">₹{t.price}</span>
                <div className="flex gap-2">
                  <button className="p-2 bg-surface-hover rounded-lg hover:text-primary"><FiEdit size={14}/></button>
                  <button className="p-2 bg-surface-hover rounded-lg hover:text-red-500"><FiTrash2 size={14}/></button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}`;

const agencyBookingsCode = `'use client';
import React from 'react';
import { FiCalendar } from 'react-icons/fi';
import { mockAgencyBookings } from '@/lib/mockData';

export default function AgencyBookingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Bookings</h1>
        <p className="text-sm text-muted">Track all customer reservations</p>
      </div>
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-surface-hover/50 border-b border-border">
            <tr><th className="p-4 font-medium text-muted">Customer</th><th className="p-4 font-medium text-muted">Trip</th><th className="p-4 font-medium text-muted">Amount</th><th className="p-4 font-medium text-muted">Status</th></tr>
          </thead>
          <tbody>
            {mockAgencyBookings.map(b => (
              <tr key={b._id} className="border-b border-border hover:bg-surface-hover/30">
                <td className="p-4"><p className="font-medium">{b.userName}</p><p className="text-xs text-muted">{b.userEmail}</p></td>
                <td className="p-4 truncate max-w-[150px]">{b.trip.title}</td>
                <td className="p-4 font-bold">₹{b.totalPrice}</td>
                <td className="p-4"><span className="px-2 py-1 rounded-full bg-surface-hover text-[10px] uppercase font-bold">{b.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}`;

const agencyRentalsCode = `'use client';
import React from 'react';
import { FiTruck, FiPlus } from 'react-icons/fi';
import { mockAgencyRentals } from '@/lib/mockData';

export default function AgencyRentalsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Rental Management</h1>
          <p className="text-sm text-muted">Manage your rentable inventory</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-teal text-white rounded-xl text-sm font-medium hover:opacity-90"><FiPlus/> Add Rental</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockAgencyRentals.map(r => (
          <div key={r._id} className="p-4 rounded-2xl border border-border bg-card flex gap-4 items-center">
            {r.images && r.images[0] ? <img src={r.images[0]} className="w-16 h-16 rounded-xl object-cover" /> : <div className="w-16 h-16 rounded-xl bg-surface-hover flex items-center justify-center text-2xl">{r.type==='bike'?'🏍️':r.type==='car'?'🚗':'📷'}</div>}
            <div>
              <h3 className="font-bold">{r.name}</h3>
              <p className="text-xs text-muted">₹{r.pricePerDay}/day</p>
              <span className={\`mt-2 inline-block px-2 py-0.5 rounded-full text-[10px] uppercase font-bold \${r.available?'bg-teal/10 text-teal':'bg-red-500/10 text-red-500'}\`}>{r.available?'Available':'Out'}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}`;

const agencyAnalyticsCode = adminAnalyticsCode.replace('AdminAnalyticsPage', 'AgencyAnalyticsPage').replace('Platform Analytics', 'Revenue Analytics').replace('Deep dive into platform performance', 'Track your agency earnings');

const agencyTeamCode = `'use client';
import React from 'react';
import { FiUsers, FiUserPlus } from 'react-icons/fi';

export default function AgencyTeamPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Team Management</h1>
          <p className="text-sm text-muted">Manage agency staff access</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-medium hover:opacity-90"><FiUserPlus/> Add Member</button>
      </div>
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-surface-hover/50 border-b border-border">
            <tr><th className="p-4 font-medium text-muted">Name</th><th className="p-4 font-medium text-muted">Role</th><th className="p-4 font-medium text-muted">Status</th></tr>
          </thead>
          <tbody>
            {['Rajesh Kumar', 'Priya Sharma', 'Amit Singh'].map((name, i) => (
              <tr key={i} className="border-b border-border hover:bg-surface-hover/30">
                <td className="p-4 font-medium">{name}</td>
                <td className="p-4 text-muted capitalize">{i===0?'Admin':'Staff'}</td>
                <td className="p-4"><span className="px-2 py-1 rounded-full bg-teal/10 text-teal text-[10px] font-bold uppercase">Active</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}`;

const agencyReviewsCode = adminReviewsCode.replace('AdminReviewsPage', 'AgencyReviewsPage');

const agencySubscriptionCode = `'use client';
import React from 'react';
import { FiCreditCard, FiCheckCircle } from 'react-icons/fi';

export default function AgencySubscriptionPage() {
  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold">Your Subscription</h1>
        <p className="text-muted mt-2">You are currently on the <span className="text-primary font-bold">Pro Plan</span>.</p>
      </div>
      <div className="p-8 rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/5 to-teal/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4"><span className="px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-bold">ACTIVE</span></div>
        <h2 className="text-2xl font-bold mb-6">Pro Plan Features</h2>
        <ul className="space-y-4 mb-8">
          <li className="flex items-center gap-3"><FiCheckCircle className="text-teal"/> Up to 15 Active Trips</li>
          <li className="flex items-center gap-3"><FiCheckCircle className="text-teal"/> Unlimited Bookings</li>
          <li className="flex items-center gap-3"><FiCheckCircle className="text-teal"/> Advanced Analytics</li>
          <li className="flex items-center gap-3"><FiCheckCircle className="text-teal"/> Team Management (Up to 5)</li>
        </ul>
        <div className="flex gap-4">
          <button className="px-6 py-3 rounded-xl bg-primary text-white font-bold hover:shadow-lg transition-all">Upgrade to Premium</button>
          <button className="px-6 py-3 rounded-xl border border-border hover:bg-surface-hover font-bold transition-all">Manage Billing</button>
        </div>
      </div>
    </div>
  );
}`;

createPage(adminDir, 'users', adminUsersCode);
createPage(adminDir, 'agencies', adminAgenciesCode);
createPage(adminDir, 'trips', adminTripsCode);
createPage(adminDir, 'bookings', adminBookingsCode);
createPage(adminDir, 'reviews', adminReviewsCode);
createPage(adminDir, 'analytics', adminAnalyticsCode);
createPage(adminDir, 'subscriptions', adminSubscriptionsCode);
createPage(adminDir, 'rentals', adminRentalsCode);
createPage(adminDir, 'system', adminSystemCode);

createPage(agencyDir, 'trips', agencyTripsCode);
createPage(agencyDir, 'bookings', agencyBookingsCode);
createPage(agencyDir, 'rentals', agencyRentalsCode);
createPage(agencyDir, 'analytics', agencyAnalyticsCode);
createPage(agencyDir, 'team', agencyTeamCode);
createPage(agencyDir, 'reviews', agencyReviewsCode);
createPage(agencyDir, 'subscription', agencySubscriptionCode);

console.log('Advanced restoration complete!');
