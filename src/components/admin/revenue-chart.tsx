"use client";

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export function RevenueChart({ data }: { data: { date: string; total: number }[] }) {
  if (data.length === 0) {
    return <p className="text-sm text-muted-foreground py-16 text-center">No sales data yet.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#C9822B" stopOpacity={0.35} />
            <stop offset="95%" stopColor="#C9822B" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
        <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={50} />
        <Tooltip
          formatter={(value: number) => [`₹${value.toLocaleString("en-IN")}`, "Revenue"]}
          contentStyle={{ borderRadius: 8, fontSize: 12, border: "1px solid #eee" }}
        />
        <Area type="monotone" dataKey="total" stroke="#C9822B" strokeWidth={2} fill="url(#revenueFill)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}