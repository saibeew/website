export type IndicatorCategory = 
  | "overview" | "gdp" | "labour" | "prices" | "money" 
  | "trade" | "government" | "business" | "consumer" | "health" | "taxes";

export interface EconomicIndicator {
  name: string;
  last: string;
  previous: string;
  highest: string;
  lowest: string;
  unit: string;
  frequency: string;
  category: IndicatorCategory;
}

export const CATEGORIES: { id: IndicatorCategory; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "gdp", label: "GDP" },
  { id: "labour", label: "Labour" },
  { id: "prices", label: "Prices" },
  { id: "money", label: "Money" },
  { id: "trade", label: "Trade" },
  { id: "government", label: "Government" },
  { id: "business", label: "Business" },
  { id: "consumer", label: "Consumer" },
  { id: "health", label: "Health" },
  { id: "taxes", label: "Taxes" },
];

export const US_INDICATORS: EconomicIndicator[] = [
  // --- GDP ---
  { name: "GDP Growth Rate", last: "-0.3", previous: "2.4", highest: "33.8", lowest: "-28.1", unit: "%", frequency: "Quarterly", category: "gdp" },
  { name: "GDP Annual Growth Rate", last: "2.4", previous: "2.5", highest: "13.4", lowest: "-7.4", unit: "%", frequency: "Quarterly", category: "gdp" },
  { name: "GDP", last: "29168.00", previous: "27719.00", highest: "29168.00", lowest: "543.30", unit: "USD Billion", frequency: "Yearly", category: "gdp" },
  { name: "GDP Per Capita", last: "85369.55", previous: "82230.70", highest: "85369.55", lowest: "2857.92", unit: "USD", frequency: "Yearly", category: "gdp" },
  { name: "GDP Per Capita PPP", last: "85369.55", previous: "82230.70", highest: "85369.55", lowest: "17878.95", unit: "USD", frequency: "Yearly", category: "gdp" },
  { name: "GDP From Agriculture", last: "197.50", previous: "202.30", highest: "223.10", lowest: "90.00", unit: "USD Billion", frequency: "Quarterly", category: "gdp" },
  { name: "GDP From Manufacturing", last: "2896.70", previous: "2891.60", highest: "2896.70", lowest: "750.70", unit: "USD Billion", frequency: "Quarterly", category: "gdp" },
  { name: "GDP From Services", last: "17455.00", previous: "17282.00", highest: "17455.00", lowest: "4533.80", unit: "USD Billion", frequency: "Quarterly", category: "gdp" },

  // --- Labour ---
  { name: "Unemployment Rate", last: "4.2", previous: "4.2", highest: "14.9", lowest: "2.5", unit: "%", frequency: "Monthly", category: "labour" },
  { name: "Non Farm Payrolls", last: "177", previous: "185", highest: "4840", lowest: "-20477", unit: "Thousand", frequency: "Monthly", category: "labour" },
  { name: "Employed Persons", last: "163862", previous: "163545", highest: "163862", lowest: "56630", unit: "Thousand", frequency: "Monthly", category: "labour" },
  { name: "Initial Jobless Claims", last: "219", previous: "202", highest: "6137", lowest: "162", unit: "Thousand", frequency: "Weekly", category: "labour" },
  { name: "Job Openings", last: "7192", previous: "7480", highest: "12182", lowest: "2149", unit: "Thousand", frequency: "Monthly", category: "labour" },
  { name: "Average Hourly Earnings YoY", last: "3.8", previous: "3.6", highest: "8.0", lowest: "1.2", unit: "%", frequency: "Monthly", category: "labour" },
  { name: "Labor Force Participation Rate", last: "62.6", previous: "62.6", highest: "67.3", lowest: "58.1", unit: "%", frequency: "Monthly", category: "labour" },
  { name: "Wages", last: "30.36", previous: "30.31", highest: "30.36", lowest: "2.50", unit: "USD/Hour", frequency: "Monthly", category: "labour" },

  // --- Prices ---
  { name: "Inflation Rate", last: "2.3", previous: "2.4", highest: "23.70", lowest: "-15.80", unit: "%", frequency: "Monthly", category: "prices" },
  { name: "Inflation Rate MoM", last: "0.2", previous: "-0.1", highest: "5.93", lowest: "-2.08", unit: "%", frequency: "Monthly", category: "prices" },
  { name: "Core Inflation Rate", last: "2.8", previous: "2.8", highest: "13.60", lowest: "0.00", unit: "%", frequency: "Monthly", category: "prices" },
  { name: "CPI", last: "321.91", previous: "320.98", highest: "321.91", lowest: "23.51", unit: "points", frequency: "Monthly", category: "prices" },
  { name: "Core PCE Price Index YoY", last: "2.6", previous: "2.8", highest: "10.2", lowest: "0.9", unit: "%", frequency: "Monthly", category: "prices" },
  { name: "Producer Prices Change", last: "2.4", previous: "2.7", highest: "22.0", lowest: "-6.8", unit: "%", frequency: "Monthly", category: "prices" },
  { name: "Food Inflation", last: "2.8", previous: "2.4", highest: "11.40", lowest: "-4.60", unit: "%", frequency: "Monthly", category: "prices" },
  { name: "Gasoline Prices", last: "3.18", previous: "3.32", highest: "5.05", lowest: "0.68", unit: "USD/Liter", frequency: "Monthly", category: "prices" },

  // --- Money ---
  { name: "Interest Rate", last: "4.50", previous: "4.50", highest: "20.00", lowest: "0.25", unit: "%", frequency: "Daily", category: "money" },
  { name: "Fed Funds Rate", last: "4.33", previous: "4.33", highest: "22.36", lowest: "0.07", unit: "%", frequency: "Daily", category: "money" },
  { name: "10-Year Treasury Yield", last: "4.52", previous: "4.25", highest: "15.82", lowest: "0.52", unit: "%", frequency: "Daily", category: "money" },
  { name: "2-Year Treasury Yield", last: "3.98", previous: "3.99", highest: "16.46", lowest: "0.11", unit: "%", frequency: "Daily", category: "money" },
  { name: "Money Supply M1", last: "18619.30", previous: "18434.00", highest: "20747.70", lowest: "138.90", unit: "USD Billion", frequency: "Monthly", category: "money" },
  { name: "Money Supply M2", last: "21763.50", previous: "21671.10", highest: "21859.50", lowest: "286.60", unit: "USD Billion", frequency: "Monthly", category: "money" },
  { name: "Central Bank Balance Sheet", last: "6717.20", previous: "6716.90", highest: "8965.50", lowest: "672.90", unit: "USD Billion", frequency: "Weekly", category: "money" },

  // --- Trade ---
  { name: "Balance of Trade", last: "-140.50", previous: "-123.20", highest: "1.95", lowest: "-140.50", unit: "USD Billion", frequency: "Monthly", category: "trade" },
  { name: "Exports", last: "278.50", previous: "278.50", highest: "278.50", lowest: "1.93", unit: "USD Billion", frequency: "Monthly", category: "trade" },
  { name: "Imports", last: "419.00", previous: "401.00", highest: "419.00", lowest: "1.83", unit: "USD Billion", frequency: "Monthly", category: "trade" },
  { name: "Current Account", last: "-303.90", previous: "-310.90", highest: "9.93", lowest: "-310.90", unit: "USD Billion", frequency: "Quarterly", category: "trade" },
  { name: "Current Account to GDP", last: "-3.90", previous: "-3.70", highest: "0.20", lowest: "-5.93", unit: "%", frequency: "Yearly", category: "trade" },

  // --- Government ---
  { name: "Government Debt to GDP", last: "121.40", previous: "120.40", highest: "126.21", lowest: "31.80", unit: "%", frequency: "Yearly", category: "government" },
  { name: "Government Budget", last: "-6.20", previous: "-5.82", highest: "2.40", lowest: "-14.70", unit: "% of GDP", frequency: "Yearly", category: "government" },
  { name: "Government Spending", last: "3928.00", previous: "3912.50", highest: "3928.00", lowest: "544.40", unit: "USD Billion", frequency: "Quarterly", category: "government" },
  { name: "Government Revenues", last: "4919.00", previous: "4437.00", highest: "4919.00", lowest: "204.60", unit: "USD Billion", frequency: "Yearly", category: "government" },
  { name: "Credit Rating", last: "98", previous: "98", highest: "100", lowest: "98", unit: "points", frequency: "Yearly", category: "government" },
  { name: "Military Expenditure", last: "916.00", previous: "876.94", highest: "916.00", lowest: "0.00", unit: "USD Billion", frequency: "Yearly", category: "government" },

  // --- Business ---
  { name: "Manufacturing PMI", last: "48.7", previous: "50.2", highest: "63.4", lowest: "36.3", unit: "points", frequency: "Monthly", category: "business" },
  { name: "Services PMI", last: "50.8", previous: "50.8", highest: "70.4", lowest: "26.7", unit: "points", frequency: "Monthly", category: "business" },
  { name: "ISM Manufacturing PMI", last: "48.7", previous: "49.0", highest: "63.70", lowest: "29.40", unit: "points", frequency: "Monthly", category: "business" },
  { name: "Industrial Production", last: "0.0", previous: "0.3", highest: "61.2", lowest: "-42.6", unit: "%", frequency: "Monthly", category: "business" },
  { name: "Capacity Utilization", last: "77.7", previous: "77.5", highest: "89.4", lowest: "64.1", unit: "%", frequency: "Monthly", category: "business" },
  { name: "Bankruptcies", last: "49119", previous: "44898", highest: "62854", lowest: "19695", unit: "", frequency: "Yearly", category: "business" },

  // --- Consumer ---
  { name: "Consumer Confidence", last: "52.2", previous: "65.2", highest: "144.7", lowest: "25.3", unit: "points", frequency: "Monthly", category: "consumer" },
  { name: "Michigan Consumer Sentiment", last: "50.8", previous: "57.0", highest: "112.0", lowest: "50.0", unit: "points", frequency: "Monthly", category: "consumer" },
  { name: "Retail Sales MoM", last: "0.1", previous: "1.7", highest: "18.3", lowest: "-14.7", unit: "%", frequency: "Monthly", category: "consumer" },
  { name: "Retail Sales YoY", last: "4.5", previous: "4.1", highest: "51.21", lowest: "-19.90", unit: "%", frequency: "Monthly", category: "consumer" },
  { name: "Consumer Spending", last: "15792.00", previous: "15650.00", highest: "15792.00", lowest: "1467.40", unit: "USD Billion", frequency: "Quarterly", category: "consumer" },
  { name: "Personal Income", last: "0.5", previous: "0.3", highest: "22.2", lowest: "-13.1", unit: "%", frequency: "Monthly", category: "consumer" },
  { name: "Personal Savings Rate", last: "3.4", previous: "3.5", highest: "33.8", lowest: "1.4", unit: "%", frequency: "Monthly", category: "consumer" },

  // --- Health ---
  { name: "Hospitals", last: "6093", previous: "6120", highest: "7156", lowest: "5564", unit: "", frequency: "Yearly", category: "health" },
  { name: "Hospital Beds", last: "2.77", previous: "2.79", highest: "9.18", lowest: "2.77", unit: "per 1000", frequency: "Yearly", category: "health" },
  { name: "Medical Doctors", last: "2.60", previous: "2.60", highest: "2.63", lowest: "1.21", unit: "per 1000", frequency: "Yearly", category: "health" },

  // --- Taxes ---
  { name: "Corporate Tax Rate", last: "21.00", previous: "21.00", highest: "52.80", lowest: "1.00", unit: "%", frequency: "Yearly", category: "taxes" },
  { name: "Personal Income Tax Rate", last: "37.00", previous: "37.00", highest: "94.00", lowest: "7.00", unit: "%", frequency: "Yearly", category: "taxes" },
  { name: "Sales Tax Rate", last: "0.00", previous: "0.00", highest: "0.00", lowest: "0.00", unit: "%", frequency: "Yearly", category: "taxes" },
  { name: "Social Security Rate", last: "15.30", previous: "15.30", highest: "15.30", lowest: "2.00", unit: "%", frequency: "Yearly", category: "taxes" },
];
