import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';

const CURRENCIES = [
  { value: 'USD', label: 'US Dollar' },
  { value: 'EUR', label: 'Euro' },
  { value: 'UAH', label: 'Ukrainian Hryvnia' }
];

class NBPCurrencyClient {
  constructor() {
    this.base_url = "http://api.nbp.pl/api/exchangerates/rates/A";
  }

  async getHistoricalRates(currency, days) {
    const end_date = new Date();
    const start_date = new Date();
    start_date.setDate(start_date.getDate() - days);

    const url = `${this.base_url}/${currency}/${start_date.toISOString().split('T')[0]}/${end_date.toISOString().split('T')[0]}/`;
    const response = await fetch(url);
    if (response.status === 200) {
      const data = await response.json();
      return data.rates;
    }
    return [];
  }
}

const CurrencyDashboard = () => {
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [data, setData] = useState([]);
  const [currentRate, setCurrentRate] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const client = new NBPCurrencyClient();
        const rates = await client.getHistoricalRates(selectedCurrency, 365);
        const formattedData = rates.map(rate => ({
          date: rate.effectiveDate,
          rate: rate.mid
        }));
        setData(formattedData);
        setCurrentRate(formattedData[formattedData.length - 1].rate);
      } catch (error) {
        console.error('Error:', error);
      }
      setLoading(false);
    };

    fetchData();
  }, [selectedCurrency]);

  const getPercentageChange = () => {
    if (data.length < 2) return 0;
    const oldRate = data[0].rate;
    const newRate = data[data.length - 1].rate;
    return ((newRate - oldRate) / oldRate * 100).toFixed(2);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 text-purple-100">
        <div className="text-lg">Loading data...</div>
      </div>
    );
  }

  const percentageChange = getPercentageChange();
  const isPositive = percentageChange > 0;

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-end mb-4 gap-4">
        <span className="text-purple-300 text-lg">Choose currency:</span>
        <select
            value={selectedCurrency}
            onChange={(e) => setSelectedCurrency(e.target.value)}
            className="p-2 border rounded-sm bg-purple-800 text-purple-100 border-amber-600"
        >
          {CURRENCIES.map(currency => (
              <option key={currency.value} value={currency.value}>
                {currency.label}
              </option>
          ))}
        </select>
      </div>
      <Card className="bg-gray-900 border-yellow-500">
      <CardHeader>
           <CardTitle className="text-purple-600">{selectedCurrency}/PLN Exchange Rate</CardTitle>
         </CardHeader>
         <CardContent className="bg-gray-900">
           <div className="grid grid-cols-2 gap-4 mb-6">
             <div className="p-4 bg-gray-900 rounded-lg border border-purple-500">
               <div className="text-lg text-purple-300">Current Rate</div>
               <div className="text-2xl font-bold text-purple-100">{currentRate?.toFixed(4)} PLN</div>
               <div className="text-lg text-purple-300 mt-2">
                 {new Date().toLocaleDateString('en-GB')}
               </div>
             </div>
             <div className="p-4 bg-gray-900 rounded-sm border border-purple-500">
               <div className="text-lg text-purple-300">Year Change</div>
               <div
                   className={`text-2xl font-bold flex items-center ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                 {isPositive ? <TrendingUp className="mr-2" /> : <TrendingDown className="mr-2" />}
                 {percentageChange}%
               </div>
             </div>
           </div>
           <div className="h-[600px] w-full bg-gray-900 p-4 rounded-sm border border-purple-500 overflow-hidden">
             <ResponsiveContainer width="100%" height="100%">
               <LineChart
                 data={data}
                 margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                 style={{ backgroundColor: '#0f172a' }}
               >
                 <CartesianGrid strokeDasharray="3 3" stroke="#312e81" />
                 <XAxis
                   dataKey="date"
                   tick={{ fontSize: 12, fill: "#c4b5fd" }}
                   interval="preserveStartEnd"
                   tickFormatter={(date) => {
                     const d = new Date(date);
                     return `${d.getMonth() + 1}/${d.getFullYear()}`;
                   }}
                 />
                 <YAxis
                   domain={['auto', 'auto']}
                   tick={{ fontSize: 12, fill: "#c4b5fd" }}
                 />
                 <Tooltip
                   contentStyle={{ backgroundColor: '#1e1b4b', borderColor: '#4c1d95' }}
                   labelStyle={{ color: '#c4b5fd' }}
                 />
                 <Legend wrapperStyle={{ color: '#c4b5fd' }} />
                 <Line
                   type="monotone"
                   dataKey="rate"
                   stroke="#02f580"
                   dot={false}
                   name={`${selectedCurrency}/PLN`}
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