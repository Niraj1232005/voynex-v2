'use client';
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
        <p>[DB] Connected to PostgreSQL Database (TypeORM)</p>
        <p>[AUTH] JWT keys rotated successfully</p>
        <p className="text-blue-400">[API] GET /api/v1/trips 200 OK 45ms</p>
        <p className="text-blue-400">[API] POST /api/v1/bookings 201 CREATED 120ms</p>
        <p className="text-yellow-400">[WARN] High memory usage detected in worker 4</p>
        <p className="text-blue-400">[API] GET /api/v1/rentals 200 OK 32ms</p>
      </div>
    </div>
  );
}