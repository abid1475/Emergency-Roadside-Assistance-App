import React from "react";

const RequestStatus = ({ status }) => {
  // Convert status to lowercase
  const currentStatus = status?.toLowerCase() || "pending";

  // Status configuration
  const statusConfig = {
    pending: {
      label: "Pending",
      icon: "⏳",
      className: "border-yellow-500/30 bg-yellow-500/10 text-yellow-400",
    },

    accepted: {
      label: "Accepted",
      icon: "✓",
      className: "border-blue-500/30 bg-blue-500/10 text-blue-400",
    },

    "on the way": {
      label: "On the Way",
      icon: "🚗",
      className: "border-purple-500/30 bg-purple-500/10 text-purple-400",
    },

    ontheway: {
      label: "On the Way",
      icon: "🚗",
      className: "border-purple-500/30 bg-purple-500/10 text-purple-400",
    },

    "in progress": {
      label: "In Progress",
      icon: "🔧",
      className: "border-teal-500/30 bg-teal-500/10 text-teal-400",
    },

    inprogress: {
      label: "In Progress",
      icon: "🔧",
      className: "border-teal-500/30 bg-teal-500/10 text-teal-400",
    },

    completed: {
      label: "Completed",
      icon: "✓",
      className: "border-green-500/30 bg-green-500/10 text-green-400",
    },

    cancelled: {
      label: "Cancelled",
      icon: "✕",
      className: "border-red-500/30 bg-red-500/10 text-red-400",
    },

    canceled: {
      label: "Cancelled",
      icon: "✕",
      className: "border-red-500/30 bg-red-500/10 text-red-400",
    },
  };

  const config = statusConfig[currentStatus] || {
    label: status,
    icon: "•",
    className: "border-slate-500/30 bg-slate-500/10 text-slate-400",
  };

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${config.className}`}
    >
      <span>{config.icon}</span>

      <span>{config.label}</span>
    </span>
  );
};

export default RequestStatus;
