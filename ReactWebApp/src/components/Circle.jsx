export default function Circle({ absentPercentage, latePercentage, presentPercentage }) {
    const radius = 50;
    const circumference = 2 * Math.PI * radius;
  
    const absentLength = (absentPercentage / 100) * circumference;
    const lateLength = (latePercentage / 100) * circumference;
    const presentLength = (presentPercentage / 100) * circumference;
  
    return (
      <div className="circle-container">
        <svg width="150" height="150" viewBox="0 0 120 120">
          {/* Absent segment */}
          <circle
            r={radius}
            cx="60"
            cy="60"
            fill="transparent"
            stroke="red"
            strokeWidth="20"
            strokeDasharray={`${absentLength} ${circumference}`}
          />
          {/* Late segment */}
          <circle
            r={radius}
            cx="60"
            cy="60"
            fill="transparent"
            stroke="orange"
            strokeWidth="20"
            strokeDasharray={`${lateLength} ${circumference}`}
            strokeDashoffset={-absentLength}
          />
          {/* Present segment */}
          <circle
            r={radius}
            cx="60"
            cy="60"
            fill="transparent"
            stroke="green"
            strokeWidth="20"
            strokeDasharray={`${presentLength} ${circumference}`}
            strokeDashoffset={-(absentLength + lateLength)}
          />
        </svg>
      </div>
    );
  }