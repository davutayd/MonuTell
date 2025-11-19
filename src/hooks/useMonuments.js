import { useState, useEffect } from "react";

export const useMonuments = () => {
  const [monuments, setMonuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMonuments = async () => {
      try {
        const response = await fetch("/api/monuments");

        if (!response.ok) {
          throw new Error("Veri alınamadı");
        }

        const data = await response.json();
        setMonuments(data.monuments);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMonuments();
  }, []);

  return { monuments, loading, error };
};
