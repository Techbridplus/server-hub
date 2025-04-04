"use client"

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

const data = [
  {
    name: "Jan",
    users: 2500,
    servers: 120,
    events: 240,
  },
  {
    name: "Feb",
    users: 3000,
    servers: 150,
    events: 320,
  },
  {
    name: "Mar",
    users: 3200,
    servers: 180,
    events: 380,
  },
  {
    name: "Apr",
    users: 3800,
    servers: 220,
    events: 460,
  },
  {
    name: "May",
    users: 4200,
    servers: 250,
    events: 520,
  },
  {
    name: "Jun",
    users: 4800,
    servers: 280,
    events: 580,
  },
]

export function Overview() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={data}>
        <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
        <Tooltip />
        <Line type="monotone" dataKey="users" stroke="#8884d8" strokeWidth={2} activeDot={{ r: 8 }} />
        <Line type="monotone" dataKey="servers" stroke="#82ca9d" strokeWidth={2} />
        <Line type="monotone" dataKey="events" stroke="#ffc658" strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  )
}

