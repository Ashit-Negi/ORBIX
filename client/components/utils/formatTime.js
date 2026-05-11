// FORMAT TIME
const formatTime = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);

  const intervals = {
    y: 31536000,
    mo: 2592000,
    d: 86400,
    h: 3600,
    m: 60,
  };

  for (let key in intervals) {
    const value = Math.floor(seconds / intervals[key]);

    if (value > 0) {
      return `${value}${key} ago`;
    }
  }

  return "Just now";
};

export default formatTime;
