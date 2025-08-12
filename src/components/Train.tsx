import React from "react";

const TrainItem = ({
  from,
  to,
  time,
  delay,
  isUrgent,
}: {
  from: string;
  to: string;
  time: string;
  delay: string;
  isUrgent: boolean;
}) => (
  <div
    style={{
      backgroundColor: isUrgent ? "#FF5722" : "#4E4E4E", // A vibrant orange for urgent, and a dark grey for normal
      color: "white",
      padding: "5px 8px",
      borderRadius: "4px",
      marginBottom: "5px",
      display: "flex",
      justifyContent: "space-between",
      borderLeft: `4px solid ${isUrgent ? "#FF5722" : "var(--color-primary)"}`, // Use accent color for border
    }}
  >
    <div>
      <div>
        <strong>
          {from} - {to}
        </strong>
      </div>
      <small>{time}</small>
    </div>
    <span style={{ fontWeight: "bold" }}>{delay}</span>
  </div>
);

export function Train() {
  const trains = [
    {
      from: "Stockholm C",
      to: "Malmö C",
      time: "2024-12-18 1",
      delay: "138 min",
      isUrgent: true,
    },
    {
      from: "Lund C",
      to: "Stockholm C",
      time: "2024-12-11 13:19",
      delay: "120 min",
      isUrgent: true,
    },
    {
      from: "Linköping C",
      to: "Malmö C",
      time: "2024-12-16 1",
      delay: "107 min",
      isUrgent: false,
    },
  ];

  return (
    <div className="section-container" style={{ maxWidth: "300px" }}>
      <div className="section-header">
        <span>Tåg</span>
        <button>Tåg karta</button>
      </div>
      <div>
        {trains.map((train, index) => (
          <TrainItem key={index} {...train} />
        ))}
      </div>
    </div>
  );
}
