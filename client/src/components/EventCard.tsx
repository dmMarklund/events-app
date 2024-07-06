import React from "react";
import { Event } from "../types/types";
import formatDescription from "../utils/formatDescription";

interface EventCardProps {
  event: Event;
  searchTerm?: string;
}

const highlightSearchTerm = (
  text: string,
  searchTerm: string
): JSX.Element[] => {
  if (!searchTerm) return [<>{text}</>];
  const parts = text.split(new RegExp(`(${searchTerm})`, "gi"));
  return parts.map((part, index) =>
    part.toLowerCase() === searchTerm.toLowerCase() ? (
      <mark key={index}>{part}</mark>
    ) : (
      <span key={index}>{part}</span>
    )
  );
};

const EventCard: React.FC<EventCardProps> = ({ event, searchTerm }) => {
  const formattedDescription = formatDescription(event.eventDescription);

  return (
    <div className="event-card">
      <img
        src={`data:image/jpeg;base64,${event.eventImage}`}
        alt={event.eventName}
        className="event-image"
      />
      <div className="event-details">
        <h2>{highlightSearchTerm(event.eventName, searchTerm || "")}</h2>
        <p>
          {formattedDescription.props.children.map(
            (
              part:
                | string
                | number
                | boolean
                | React.ReactElement<
                    any,
                    string | React.JSXElementConstructor<any>
                  >
                | Iterable<React.ReactNode>
                | null
                | undefined,
              index: React.Key | null | undefined
            ) => (
              <React.Fragment key={index}>
                {typeof part === "string"
                  ? highlightSearchTerm(part, searchTerm || "")
                  : part}
              </React.Fragment>
            )
          )}
        </p>
        <a href={event.eventLink} target="_blank" rel="noopener noreferrer">
          Event Link
        </a>
      </div>
    </div>
  );
};

export default EventCard;
