import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import axios from "axios";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

export default function IndexPage() {
  const [cryptoData, setCryptoData] = useState({ labels: [], datasets: [] });

  useEffect(() => {
    const fetchCryptoData = async () => {
      try {
        const response = await axios.get("https://api.coingecko.com/api/v3/coins/markets", {
          params: {
            vs_currency: "usd",
            order: "market_cap_desc",
            per_page: 10,
            page: 1,
            sparkline: false,
          },
        });

        const labels = response.data.map((coin) => coin.name);
        const data = response.data.map((coin) => coin.current_price);

        setCryptoData({
          labels,
          datasets: [
            {
              label: "Current Price (USD)",
              data,
              backgroundColor: "rgba(75, 192, 192, 0.2)",
              borderColor: "rgba(75, 192, 192, 1)",
              borderWidth: 1,
            },
          ],
        });
      } catch (error) {
        console.error("Error fetching crypto data", error);
      }
    };

    fetchCryptoData();
  }, []);

  return (
    <div className="container mx-auto px-4 py-16 space-y-32">
      {/* Hero Section */}
      <motion.section 
        className="text-center space-y-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <Badge variant="secondary" className="mb-4">
          Retro Crypto Dashboard
        </Badge>
        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
          Track Your Favorite Cryptocurrencies
        </h1>
        <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
          Stay updated with the latest prices.
        </p>
      </motion.section>

      {/* Crypto Chart Section */}
      <section className="mt-8">
        <h2 className="text-2xl font-semibold text-center mb-4">Current Prices</h2>
        <div className="max-w-4xl mx-auto">
          <Line data={cryptoData} />
        </div>
      </section>
    </div>
  );
}
