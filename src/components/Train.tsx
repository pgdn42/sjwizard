const MapIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M12 18.5l-3 -1.5l-6 3v-13l6 -3l6 3l6 -3v7.5" />
    <path d="M9 4v13" />
    <path d="M15 7v5.5" />
    <path d="M21.121 20.121a3 3 0 1 0 -4.242 0c.418 .419 1.125 1.045 2.121 1.879c1.051 -.89 1.759 -1.516 2.121 -1.879z" />
    <path d="M19 18v.01" />
  </svg>
);

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
      from: "Linköping C",
      to: "Malmö C",
      time: "2024-12-16 1",
      delay: "107 min",
      isUrgent: false,
    },
  ];

  return (
    <div className="section-container">
      <div className="section-header">
        <span>Tåg</span>
        <button className="button-svg" title="Järnvägs karta">
          <MapIcon />
        </button>
      </div>
      <div>
        {trains.map((train, index) => (
          <TrainItem key={index} {...train} />
        ))}
      </div>
    </div>
  );
}
