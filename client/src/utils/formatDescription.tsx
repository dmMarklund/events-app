const formatDescription = (description: string): JSX.Element => {
  const dateRegex =
    /\b(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)\b, \b(?:January|February|March|April|May|June|July|August|September|October|November|December)\b \d{1,2} \d{4}/;
  const locationRegex = /^(.*?) by/;
  const byRegex = /by (.*?) (?:and|on)/;

  // Extract date
  const dateMatch = description.match(dateRegex);
  const dateStr = dateMatch ? dateMatch[0] : "";

  // Extract location
  const locationMatch = description.match(locationRegex);
  const locationStr = locationMatch ? locationMatch[1].trim() : "";

  // Extract by
  const byMatch = description.match(byRegex);
  const byStr = byMatch ? byMatch[1].trim() : "";

  return (
    <>
      <div className="event-description-location">{locationStr}</div>
      <div className="event-description-by">by {byStr}</div>
      <div className="event-description-date">{dateStr}</div>
    </>
  );
};

export default formatDescription;
