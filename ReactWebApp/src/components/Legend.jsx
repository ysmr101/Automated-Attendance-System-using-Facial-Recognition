export default function Legend({ absentPercentage, latePercentage, presentPercentage }) {

  let roundedAbsent = Math.round(absentPercentage);
  let roundedLate = Math.round(latePercentage);
  let roundedPresent = Math.round(presentPercentage);


  let total = roundedAbsent + roundedLate + roundedPresent;

  if (total === 99) {

    if (roundedPresent > 1) {
      roundedPresent += 1;
    }
    else if (roundedAbsent > 1) {
      roundedAbsent += 1
    } else {
      roundedLate += 1
    }

  } else if (total === 101) {

    if (roundedAbsent > 1) {
      roundedAbsent -= 1;
    }
    else if (roundedPresent > 1) {
      roundedPresent -= 1
    } else {
      roundedLate -= 1
    }
  }

  return (
    <div className="legend">
      <span style={{ color: 'red', fontWeight: 'bold' }}>Absent: {roundedAbsent}%</span>
      <span style={{ color: 'orange', fontWeight: 'bold' }}>Late: {roundedLate}%</span>
      <span style={{ color: 'green', fontWeight: 'bold' }}>Present: {roundedPresent}%</span>
    </div>
  );
}
