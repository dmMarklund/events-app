import React from "react";

const formatDescription = (description: string): JSX.Element => {
  const dateRegex = /(\w+ \d{1,2} \d{4})/;
  const match = description.match(dateRegex);
  if (match) {
    const dateStr = match[0];
    const parts = description.split(dateStr);
    return (
      <>
        {parts[0]}
        <strong>{dateStr}</strong>
      </>
    );
  }
  return <>{description}</>;
};

export default formatDescription;
