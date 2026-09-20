// US EPA AQI Color & Health Category Standards
export const AQI_LEVELS = {
  Good: {
    label: "Good",
    range: "0 - 50",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    badgeBg: "bg-emerald-100",
    badgeText: "text-emerald-800",
    dot: "bg-emerald-500",
    hex: "#10b981",
    healthAdvice: "Air quality is satisfactory. Enjoy outdoor activities with peace of mind.",
    icon: "Smile"
  },
  Moderate: {
    label: "Moderate",
    range: "51 - 100",
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    badgeBg: "bg-amber-100",
    badgeText: "text-amber-800",
    dot: "bg-amber-500",
    hex: "#f59e0b",
    healthAdvice: "Air quality is acceptable. Unusually sensitive individuals should consider limiting prolonged outdoor exertion.",
    icon: "Meh"
  },
  "Unhealthy for Sensitive Groups": {
    label: "Unhealthy for Sensitive Groups",
    range: "101 - 150",
    bg: "bg-orange-50",
    text: "text-orange-700",
    border: "border-orange-200",
    badgeBg: "bg-orange-100",
    badgeText: "text-orange-800",
    dot: "bg-orange-500",
    hex: "#f97316",
    healthAdvice: "Members of sensitive groups (children, elderly, respiratory conditions) should reduce outdoor exertion.",
    icon: "AlertCircle"
  },
  Unhealthy: {
    label: "Unhealthy",
    range: "151 - 200",
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-200",
    badgeBg: "bg-red-100",
    badgeText: "text-red-800",
    dot: "bg-red-500",
    hex: "#ef4444",
    healthAdvice: "Everyone may begin to experience health effects. Limit prolonged outdoor activities; wear an N95 respirator if outside.",
    icon: "AlertTriangle"
  },
  "Very Unhealthy": {
    label: "Very Unhealthy",
    range: "201 - 300",
    bg: "bg-purple-50",
    text: "text-purple-700",
    border: "border-purple-200",
    badgeBg: "bg-purple-100",
    badgeText: "text-purple-800",
    dot: "bg-purple-500",
    hex: "#8b5cf6",
    healthAdvice: "Health alert: Increased likelihood of adverse effects for everyone. Avoid strenuous outdoor exertion.",
    icon: "ShieldAlert"
  },
  Hazardous: {
    label: "Hazardous",
    range: "301+",
    bg: "bg-rose-100",
    text: "text-rose-900",
    border: "border-rose-300",
    badgeBg: "bg-rose-200",
    badgeText: "text-rose-950",
    dot: "bg-rose-700",
    hex: "#7f1d1d",
    healthAdvice: "Emergency conditions: Entire population is likely to be seriously affected. Keep windows shut and run HEPA air filtration.",
    icon: "Skull"
  },
  Unavailable: {
    label: "Unavailable",
    range: "N/A",
    bg: "bg-slate-50",
    text: "text-slate-600",
    border: "border-slate-200",
    badgeBg: "bg-slate-100",
    badgeText: "text-slate-700",
    dot: "bg-slate-400",
    hex: "#64748b",
    healthAdvice: "Calculated AQI is currently unavailable due to insufficient pollutant readings.",
    icon: "HelpCircle"
  }
};

export function getAQILevel(statusOrValue) {
  if (typeof statusOrValue === "number") {
    const val = statusOrValue;
    if (val <= 50) return AQI_LEVELS["Good"];
    if (val <= 100) return AQI_LEVELS["Moderate"];
    if (val <= 150) return AQI_LEVELS["Unhealthy for Sensitive Groups"];
    if (val <= 200) return AQI_LEVELS["Unhealthy"];
    if (val <= 300) return AQI_LEVELS["Very Unhealthy"];
    if (val > 300) return AQI_LEVELS["Hazardous"];
    return AQI_LEVELS["Unavailable"];
  }

  return AQI_LEVELS[statusOrValue] || AQI_LEVELS["Unavailable"];
}
