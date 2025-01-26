import requests
import time
from datetime import date, timedelta
from typing import List, Tuple, Optional


class NBPCurrencyClient:
    def __init__(self):
        self.base_url = "http://api.nbp.pl/api/exchangerates/rates/A"
        self.requests_per_second = 2
        self.last_request_time = 0

    def _rate_limit(self):
        current_time = time.time()
        time_since_last = current_time - self.last_request_time
        if time_since_last < (1 / self.requests_per_second):
            time.sleep((1 / self.requests_per_second) - time_since_last)
        self.last_request_time = time.time()

    def get_current_rate(self, currency: str) -> Optional[float]:
        self._rate_limit()
        url = f"{self.base_url}/{currency}/"
        response = requests.get(url)
        if response.status_code == 200:
            return response.json()['rates'][0]['mid']
        return None

    def get_historical_rates(self, currency: str, days: int) -> List[Tuple[str, float]]:
        self._rate_limit()
        end_date = date.today()
        start_date = end_date - timedelta(days=days)
        url = f"{self.base_url}/{currency}/{start_date}/{end_date}/"

        response = requests.get(url)
        if response.status_code == 200:
            data = response.json()
            return [(rate['effectiveDate'], rate['mid']) for rate in data['rates']]
        return []


# # Usage example
# client = NBPCurrencyClient()
# current_rate = client.get_current_rate('EUR')
# last_year_rates = client.get_historical_rates('EUR', 365)
#
#
# print(last_year_rates)