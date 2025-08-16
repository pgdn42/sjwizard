import { useState, useEffect, useMemo } from "react"; // Add useState and useEffect
import type { DocumentData } from "firebase/firestore"; // Import DocumentData
import type { ModuleCopyConfig, FormData } from "../types";
import { DynamicButtonRow } from "./DynamicButtonRow";
import { onUserCollectionUpdate } from "../services/firestoreService"; // Import the listener

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

interface TrainItemData {
  departureStation: string;
  arrivalStation: string;
  departureDate: string;
  delay: number;
  trainNumber: string;
}
const getDelayColor = (delay: number) => {
  if (delay >= 240) return "#ff00006e"; // Red
  if (delay >= 120) return "#ff3c0077"; // Orange
  if (delay >= 60) return "#ffc40077"; // Yellow
  return "#4e4e4e7a"; // Gray
};

const TrainItem = ({
  departureStation,
  arrivalStation,
  departureDate,
  delay,
  trainNumber,
}: TrainItemData) => (
  <div
    style={{
      backgroundColor: getDelayColor(delay),
      color: "white",
      padding: "5px 8px",
      borderRadius: "4px",
      marginBottom: "5px",
      display: "flex",
      justifyContent: "space-between",
      borderLeft: `4px solid ${getDelayColor(delay)}`,
    }}
  >
    <div style={{ width: "100%", overflow: "hidden", fontSize: "14px" }}>
      <div>
        <strong>
          {departureStation || "N/A"} - {arrivalStation || "N/A"}
        </strong>
      </div>
      <small>
        Tåg: {trainNumber} - {departureDate}
      </small>
      <strong style={{ float: "right" }}>{delay} min</strong>
    </div>
  </div>
);

interface TrainProps {
  data: FormData;
  customButtons: ModuleCopyConfig;
  userId: string; // Expect the user ID as a prop
}

export function Train({ data, customButtons, userId }: TrainProps) {
  const [delayedTrains, setDelayedTrains] = useState<DocumentData[]>([]);
  const currentTrain = data.ersattning;

  useEffect(() => {
    if (!userId) return;

    // Listen for real-time updates to the delayedTrains collection for the current user
    const unsubscribe = onUserCollectionUpdate(
      "delayedTrains",
      userId,
      (fetchedTrains) => {
        // Sort trains by creation date, newest first
        const sortedTrains = fetchedTrains.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setDelayedTrains(sortedTrains);
      }
    );

    // Clean up the listener when the component unmounts
    return () => unsubscribe();
  }, [userId]);

  const sortedTrains = useMemo(() => {
    const getScore = (train: DocumentData) => {
      // Rule 1 (Top Priority): Same train number, date, and route.
      if (
        currentTrain.trainNumber &&
        train.trainNumber === currentTrain.trainNumber &&
        currentTrain.departureDate &&
        train.departureDate === currentTrain.departureDate &&
        currentTrain.departureStation &&
        train.departureStation === currentTrain.departureStation &&
        currentTrain.arrivalStation &&
        train.arrivalStation === currentTrain.arrivalStation
      ) {
        return 100; // Highest score for a perfect match
      }

      // Rule 2 (Second Priority): Same train number and date.
      if (
        currentTrain.trainNumber &&
        train.trainNumber === currentTrain.trainNumber &&
        currentTrain.departureDate &&
        train.departureDate === currentTrain.departureDate
      ) {
        return 50; // Medium score for a likely match
      }

      return 0; // No significant match
    };

    return [...delayedTrains].sort((a, b) => {
      const scoreA = getScore(a);
      const scoreB = getScore(b);

      // If scores are different, sort by score (higher scores first)
      if (scoreA !== scoreB) {
        return scoreB - scoreA;
      }

      // If scores are the same, use creation date as a tie-breaker (newest first)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [delayedTrains, currentTrain]);

  return (
    <div className="section-container train-data-container">
      <div className="section-header">
        <span className="section-title">Tåg</span>
        <div className="buttons-wrapper">
          <DynamicButtonRow buttons={customButtons} formData={data} />
        </div>
        <button className="button-svg" title="Järnvägs karta">
          <MapIcon />
        </button>
      </div>
      <div className="train-list-container">
        {sortedTrains.length > 0 ? (
          sortedTrains.map((train) => (
            <TrainItem
              key={train.id}
              departureStation={train.departureStation}
              arrivalStation={train.arrivalStation}
              departureDate={train.departureDate}
              delay={train.delay}
              isUrgent={train.delay > 60}
              trainNumber={train.trainNumber}
            />
          ))
        ) : (
          <p style={{ textAlign: "center", color: "var(--color-placeholder)" }}>
            No saved trains.
          </p>
        )}
      </div>
    </div>
  );
}
