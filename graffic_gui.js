import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';

const CurrencyDashboard = () => {
  const [data, setData] = useState([]);
  const [currentRate, setCurrentRate] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://api.nbp.pl/api/exchangerates/rates/A/EUR/last/365/');
        const result = await response.json();
        const formattedData = result.rates.map(rate => ({
          date: new Date(rate.effectiveDate).toLocaleDateString(),
          rate: rate.mid
        }));
        setData(formattedData);
        setCurrentRate(formattedData[formattedData.length - 1].rate);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getPercentageChange = () => {
    if (data.length < 2) return 0;
    const oldRate = data[0].rate;
    const newRate = data[data.length - 1].rate;
    return ((newRate - oldRate) / oldRate * 100).toFixed(2);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg">Loading data...</div>
      </div>
    );
  }

  const percentageChange = getPercentageChange();
  const isPositive = percentageChange > 0;

  return (
    <div className="p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>EUR/PLN Exchange Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-4 bg-gray-100 rounded-lg">
              <div className="text-sm text-gray-600">Current Rate</div>
              <div className="text-2xl font-bold">{currentRate?.toFixed(4)} PLN</div>
            </div>
            <div className="p-4 bg-gray-100 rounded-lg">
              <div className="text-sm text-gray-600">Year Change</div>
              <div className={`text-2xl font-bold flex items-center ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {isPositive ? <TrendingUp className="mr-2" /> : <TrendingDown className="mr-2" />}
                {percentageChange}%
              </div>
            </div>
          </div>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  interval={30}
                />
                <YAxis
                  domain={['auto', 'auto']}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="rate"
                  stroke="#2563eb"
                  dot={false}
                  name="EUR/PLN"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CurrencyDashboard;