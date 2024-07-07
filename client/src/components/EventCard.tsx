import React from "react";
import { Event } from "../types/types";
import formatDescription from "../utils/formatDescription";
import { v4 as uuidv4 } from "uuid";

interface EventCardProps {
  event: Event;
  searchTerm?: string;
}

const highlightSearchTerm = (
  text: string | unknown, // unknown is a type that can be any value
  searchTerm?: string
): JSX.Element[] => {
  if (!searchTerm) return [<>{text}</>];
  let textString: string;
  if (typeof text === "string") {
    textString = text;
  } else if (text !== null && text !== undefined) {
    textString = text.toString();
  } else {
    textString = "";
  }
  const parts = textString.split(new RegExp(`(${searchTerm})`, "gi"));
  return parts.map((part: string) =>
    part.toLowerCase() === (searchTerm || "").toLowerCase() ? (
      <mark key={uuidv4()}>{part}</mark>
    ) : (
      <span key={uuidv4()}>{part}</span>
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
        <h2>
          {searchTerm
            ? highlightSearchTerm(event.eventName, searchTerm)
            : event.eventName}
        </h2>
        <p>
          {typeof formattedDescription === "string"
            ? formattedDescription
            : React.Children.map(
                formattedDescription.props.children,
                (child) => {
                  if (typeof child === "string") {
                    return highlightSearchTerm(child, searchTerm);
                  } else {
                    return child;
                  }
                }
              )}
        </p>
        <a
          href={event.eventLink}
          className="event-link"
          target="_blank"
          rel="noopener noreferrer"
        >
          Event Link
        </a>
      </div>
    </div>
  );
};

export default EventCard;
