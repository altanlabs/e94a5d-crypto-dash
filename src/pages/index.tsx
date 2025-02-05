import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import axios from "axios";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ArrowUpIcon, ArrowDownIcon } from "@radix-ui/react-icons";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface CryptoData {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number;
  sparkline_in_7d: {
    price: number[];
  };
  total_volume: number;
  market_cap: number;
  market_cap_rank: number;
}

export default function IndexPage() {
  const [cryptoData, setCryptoData] = useState<CryptoData[]>([]);
  const [topCryptos, setTopCryptos] = useState<CryptoData[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState("24H");

  useEffect(() => {
    const fetchCryptoData = async () => {
      try {
        const [topSixResponse, top25Response] = await Promise.all([
          axios.get(
            "https://api.coingecko.com/api/v3/coins/markets",
            {
              params: {
                vs_currency: "usd",
                order: "market_cap_desc",
                per_page: 6,
                sparkline: true,
                price_change_percentage: "24h",
              },
            }
          ),
          axios.get(
            "https://api.coingecko.com/api/v3/coins/markets",
            {
              params: {
                vs_currency: "usd",
                order: "market_cap_desc",
                per_page: 25,
                sparkline: false,
                price_change_percentage: "24h",
              },
            }
          )
        ]);
        
        setCryptoData(topSixResponse.data);
        setTopCryptos(top25Response.data);
      } catch (error) {
        console.error("Error fetching crypto data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCryptoData();
    const interval = setInterval(fetchCryptoData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const formatVolume = (volume: number) => {
    if (volume >= 1000000000) {
      return (volume / 1000000000).toFixed(1) + ' B';
    }
    if (volume >= 1000000) {
      return (volume / 1000000).toFixed(1) + ' M';
    }
    return volume.toFixed(1);
  };

  const formatPrice = (price: number) => {
    if (price < 1) {
      return price.toFixed(6);
    }
    return price.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: false,
      },
    },
    scales: {
      x: {
        display: false,
      },
      y: {
        display: false,
      },
    },
    elements: {
      point: {
        radius: 0,
      },
      line: {
        tension: 0.4,
      },
    },
  };

  const getChartData = (sparklineData: number[], isPositive: boolean) => ({
    labels: [...Array(sparklineData.length).keys()],
    datasets: [
      {
        data: sparklineData,
        borderColor: isPositive ? '#22c55e' : '#ef4444',
        borderWidth: 2,
        fill: true,
        backgroundColor: (context: any) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 100);
          if (isPositive) {
            gradient.addColorStop(0, 'rgba(34, 197, 94, 0.2)');
            gradient.addColorStop(1, 'rgba(34, 197, 94, 0)');
          } else {
            gradient.addColorStop(0, 'rgba(239, 68, 68, 0.2)');
            gradient.addColorStop(1, 'rgba(239, 68, 68, 0)');
          }
          return gradient;
        },
      },
    ],
  });

  return (
    <div className="min-h-screen bg-black text-white p-6">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold">Top Gainers & Losers</h1>
          <div className="flex gap-2">
            <Badge
              variant={timeframe === "24H" ? "secondary" : "outline"}
              className="cursor-pointer"
              onClick={() => setTimeframe("24H")}
            >
              24H
            </Badge>
            <Badge
              variant={timeframe === "Gainers" ? "secondary" : "outline"}
              className="cursor-pointer"
              onClick={() => setTimeframe("Gainers")}
            >
              Gainers
            </Badge>
            <Badge
              variant={timeframe === "Losers" ? "secondary" : "outline"}
              className="cursor-pointer"
              onClick={() => setTimeframe("Losers")}
            >
              Losers
            </Badge>
          </div>
        </div>
        <p className="text-gray-400">Track, manage and forecast your assets</p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
      ) : (
        <>
          {/* Charts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {cryptoData.map((crypto) => {
              const isPositive = crypto.price_change_percentage_24h > 0;
              return (
                <Card key={crypto.id} className="bg-[#1a1a1a] border-gray-800 p-4 hover:bg-[#242424] transition-colors">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2">
                      <img src={crypto.image} alt={crypto.name} className="w-6 h-6" />
                      <div>
                        <h3 className="font-medium">{crypto.name}</h3>
                        <p className="text-sm text-gray-400">True Chart</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${formatPrice(crypto.current_price)}</p>
                      <div className={`flex items-center gap-1 text-sm ${
                        isPositive ? "text-green-500" : "text-red-500"
                      }`}>
                        {isPositive ? (
                          <ArrowUpIcon className="h-4 w-4" />
                        ) : (
                          <ArrowDownIcon className="h-4 w-4" />
                        )}
                        {Math.abs(crypto.price_change_percentage_24h).toFixed(2)}%
                      </div>
                    </div>
                  </div>
                  <div className="h-24">
                    {crypto.sparkline_in_7d.price && (
                      <Line
                        data={getChartData(
                          crypto.sparkline_in_7d.price,
                          isPositive
                        )}
                        options={chartOptions}
                      />
                    )}
                  </div>
                  <div className="mt-4 text-sm text-gray-400">
                    Volume: {formatVolume(crypto.total_volume)}
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Table Section */}
          <div className="rounded-lg border border-gray-800 bg-[#1a1a1a]">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-[#242424] border-gray-800">
                  <TableHead className="text-gray-400">Rank</TableHead>
                  <TableHead className="text-gray-400">Name</TableHead>
                  <TableHead className="text-gray-400">Price</TableHead>
                  <TableHead className="text-gray-400">24h %</TableHead>
                  <TableHead className="text-gray-400 text-right">Volume (24h)</TableHead>
                  <TableHead className="text-gray-400 text-right">Market Cap</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topCryptos.map((crypto) => (
                  <TableRow key={crypto.id} className="hover:bg-[#242424] border-gray-800">
                    <TableCell className="font-medium">{crypto.market_cap_rank}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <img src={crypto.image} alt={crypto.name} className="w-5 h-5" />
                        <span>{crypto.name}</span>
                        <span className="text-gray-400 uppercase">{crypto.symbol}</span>
                      </div>
                    </TableCell>
                    <TableCell>${formatPrice(crypto.current_price)}</TableCell>
                    <TableCell className={crypto.price_change_percentage_24h >= 0 ? "text-green-500" : "text-red-500"}>
                      {crypto.price_change_percentage_24h >= 0 ? "+" : ""}
                      {crypto.price_change_percentage_24h.toFixed(2)}%
                    </TableCell>
                    <TableCell className="text-right">${formatVolume(crypto.total_volume)}</TableCell>
                    <TableCell className="text-right">${formatVolume(crypto.market_cap)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </div>
  );
}