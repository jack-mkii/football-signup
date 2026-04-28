import { useEffect, useState } from 'react';
import { getDay, getHours, nextDay, set } from 'date-fns';
import { formatInTimeZone, toZonedTime } from 'date-fns-tz';

export default function NextGameweek() {
  const [nextTuesdayDate, setNextTuesdayDate] = useState('');

  const TUESDAY = 2;
  const TIMEZONE = 'Europe/London';
  const CUTOFF_HOUR = 21;
  const TARGET_HOUR = 20;

  useEffect(() => {
    const nowInLondon = toZonedTime(new Date(), TIMEZONE);
    let nextTuesday = nextDay(nowInLondon, TUESDAY);

    const isTuesday = getDay(nowInLondon) === TUESDAY;
    const isBeforeCutoff = getHours(nowInLondon) < CUTOFF_HOUR;

    if (isTuesday && isBeforeCutoff) {
      // If it's Tuesday before 9pm, stay on today
      nextTuesday = nowInLondon;
    }

    nextTuesday = set(nextTuesday, { 
      hours: TARGET_HOUR, 
      minutes: 0, 
      seconds: 0, 
      milliseconds: 0 
    });

    const humanReadable = formatInTimeZone(
      nextTuesday,
      TIMEZONE,
      "EEEE, MMMM do, yyyy '@' ha"
    );

    setNextTuesdayDate(humanReadable);
  }, []);

  return (
    <div>
      <p className="text-xs">
        Sign up for: <span className="italic">{nextTuesdayDate || 'Calculating...'}</span>
      </p>
    </div>
  );
}
