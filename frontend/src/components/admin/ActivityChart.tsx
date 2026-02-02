import { motion } from "framer-motion";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";

interface ActivityChartProps {
  data: Array<{
    name: string;
    users: number;
    connections: number;
    jobs: number;
  }>;
  title: string;
  description?: string;
}

export function ActivityChart({ data, title, description }: ActivityChartProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-card rounded-2xl border border-border/60 p-6 shadow-sm"
    >
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        )}
      </div>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(221 83% 53%)" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="hsl(221 83% 53%)" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorConnections" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(142 71% 45%)" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="hsl(142 71% 45%)" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorJobs" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(262 83% 58%)" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="hsl(262 83% 58%)" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 91%)" />
            <XAxis 
              dataKey="name" 
              stroke="hsl(220 9% 46%)" 
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="hsl(220 9% 46%)" 
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(0 0% 100%)",
                border: "1px solid hsl(220 13% 91%)",
                borderRadius: "12px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              }}
              labelStyle={{ color: "hsl(222 47% 11%)", fontWeight: 600 }}
            />
            <Area
              type="monotone"
              dataKey="users"
              stroke="hsl(221 83% 53%)"
              fillOpacity={1}
              fill="url(#colorUsers)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="connections"
              stroke="hsl(142 71% 45%)"
              fillOpacity={1}
              fill="url(#colorConnections)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="jobs"
              stroke="hsl(262 83% 58%)"
              fillOpacity={1}
              fill="url(#colorJobs)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-center gap-6 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-primary" />
          <span className="text-sm text-muted-foreground">New Users</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-success" />
          <span className="text-sm text-muted-foreground">Connections</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-junior" />
          <span className="text-sm text-muted-foreground">Job Postings</span>
        </div>
      </div>
    </motion.div>
  );
}
