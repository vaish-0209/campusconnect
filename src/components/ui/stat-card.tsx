"use client";

import { LucideIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, useSpring, useTransform } from "framer-motion";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  iconColor?: string;
  href?: string;
}

function AnimatedNumber({ value }: { value: number }) {
  const [displayValue, setDisplayValue] = useState(0);
  const spring = useSpring(0, { duration: 800 });

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  useEffect(() => {
    const unsubscribe = spring.on("change", (latest) => {
      setDisplayValue(Math.floor(latest));
    });
    return () => unsubscribe();
  }, [spring]);

  return <>{displayValue}</>;
}

export function StatCard({
  title,
  value,
  change,
  changeType = "neutral",
  icon: Icon,
  iconColor = "text-primary",
  href,
}: StatCardProps) {
  const isNumber = typeof value === "number";

  const content = (
    <>
      <div className="flex items-start justify-between mb-4">
        <motion.div
          className={`p-3 rounded-lg bg-secondary/50 ${iconColor}`}
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          <Icon className="w-6 h-6" />
        </motion.div>
        {change && (
          <motion.span
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={`text-sm font-medium ${
              changeType === "positive"
                ? "text-green-500"
                : changeType === "negative"
                ? "text-red-500"
                : "text-muted-foreground"
            }`}
          >
            {change}
          </motion.span>
        )}
      </div>
      <div>
        <p className="text-sm text-muted-foreground mb-1">{title}</p>
        <p className="text-3xl font-bold">
          {isNumber ? <AnimatedNumber value={value as number} /> : value}
        </p>
      </div>
    </>
  );

  if (href) {
    return (
      <motion.div
        whileHover={{ scale: 1.02, y: -4 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
      >
        <Link href={href} className="glass-card rounded-xl p-6 border border-border/50 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/10 transition-all group cursor-pointer block glow-on-hover">
          {content}
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      className="glass-card rounded-xl p-6 border border-border/50 hover:border-primary/30 transition-all group"
    >
      {content}
    </motion.div>
  );
}
