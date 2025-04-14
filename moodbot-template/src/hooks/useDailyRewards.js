import { useState, useEffect } from "react";

const useDailyReward = () => {
  const [dailyRewardCollected, setDailyRewardCollected] = useState(false);

  useEffect(() => {
    const lastCollection = localStorage.getItem("lastDailyReward");
    if (lastCollection) {
      const lastDate = new Date(lastCollection);
      const today = new Date();
      if (
        lastDate.getDate() === today.getDate() &&
        lastDate.getMonth() === today.getMonth() &&
        lastDate.getFullYear() === today.getFullYear()
      ) {
        setDailyRewardCollected(true);
      }
    }
  }, []);

  const checkAndSetDailyReward = () => {
    if (dailyRewardCollected) {
      return "🎁 You've already collected your daily Meme Currency today.";
    } else {
      localStorage.setItem("lastDailyReward", new Date().toISOString());
      setDailyRewardCollected(true);
      return "🎁 Daily Meme Currency collected!";
    }
  };

  return { dailyRewardCollected, checkAndSetDailyReward };
};

export default useDailyReward;
