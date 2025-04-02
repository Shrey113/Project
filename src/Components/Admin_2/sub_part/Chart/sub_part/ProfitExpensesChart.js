import React, { useEffect, useState } from "react";
import "./ProfitExpensesChart.css";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";


import icon_1 from './../sub_img/icon-biology.png'
import icon_2 from './../sub_img/icon-erase.png'
import icon_3 from './../sub_img/icon-globe.png'
 
import { Server_url } from "../../../../../redux/AllData";
const data = [
  { month: "Aug", profit: 60, expense: 70 },
  { month: "Sep", profit: 40, expense: 70 },
  { month: "Oct", profit: 30, expense: 50 },
  { month: "Nov", profit: 35, expense: 70 },
  { month: "Dec", profit: 35, expense: 60 },
  { month: "Jan", profit: 20, expense: 45 },
];

const ProfitExpensesChart = () => {
  // const [status_counts, set_status_counts] = useState({});
  const [chartWidth, setChartWidth] = useState(window.innerWidth);
  
  useEffect(() => {
    const handleResize = () => {
      setChartWidth(window.innerWidth);
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    const fetchStatusCounts = async () => {
        try {

            const response = await fetch(`${Server_url}/chart/status-count`); // Replace with your endpoint URL

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();

            // Transform the data to match the desired structure
            const transformedData = {
                status_pending_request: data.Pending || 0,
                status_reject_request: data.Reject || 0,
                status_accept_request: data.Accept || 0,
            };

            // set_status_counts(transformedData);
            console.log(transformedData);
            
        } catch (err) {
            console.error('Error fetching status counts:', err);
          
        } 
    };

    fetchStatusCounts();
}, []);

  // Function to determine if we should switch to column layout based on viewport width
  const isColumnLayout = () => {
    return chartWidth <= 992;
  };
  
  // Get bar category gap based on screen width
  const getBarCategoryGap = () => {
    if (chartWidth <= 480) return "8%";
    if (chartWidth <= 576) return "10%";
    if (chartWidth <= 768) return "15%";
    return "12%";
  };
  
  // Get chart height based on screen width
  const getChartHeight = () => {
    if (chartWidth <= 480) return 180;
    if (chartWidth <= 576) return 200;
    if (chartWidth <= 768) return 250;
    return 300;
  };
  
  // Get font size based on screen width
  const getFontSize = () => {
    if (chartWidth <= 480) return 9;
    if (chartWidth <= 576) return 10;
    if (chartWidth <= 768) return 11;
    return 12;
  };
  
  // Get Y-axis width based on screen size
  const getYAxisWidth = () => {
    if (chartWidth <= 480) return 25;
    if (chartWidth <= 576) return 30;
    if (chartWidth <= 768) return 35;
    return 40;
  };
  
  // Get chart margins based on screen size
  const getChartMargin = () => {
    if (chartWidth <= 480) {
      return { top: 5, right: 0, left: 0, bottom: 5 };
    }
    if (chartWidth <= 576) {
      return { top: 5, right: 5, left: 0, bottom: 5 };
    }
    return { top: 5, right: 5, left: 10, bottom: 5 };
  };

  return (
    <div className="chart-container">
        <div className="chart-title">
        User Growth Chart
        </div>
      

      <div className="chart_con" style={{ flexDirection: isColumnLayout() ? 'column' : 'row' }}>
        <div className="chart">
          <ResponsiveContainer width="100%" height={getChartHeight()}>
            <BarChart 
              data={data} 
              barCategoryGap={getBarCategoryGap()}
              margin={getChartMargin()}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" tick={{ fontSize: getFontSize() }} />
              <YAxis tick={{ fontSize: getFontSize() }} width={getYAxisWidth()} />
              <Tooltip 
                cursor={{ fill: "rgba(200, 200, 200, 0.2)" }} 
                contentStyle={{ fontSize: getFontSize() }}
              />
              <Bar dataKey="profit" fill="#2f80ed" radius={[10, 10, 0, 0]} />
              <Bar dataKey="expense" fill="#ff7e67" radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart_data">

          <div className="chart_info">
            <div className="icon" style={{background:"#feece9"}}>
            <img src={icon_1} alt="Biology Icon" />
            </div>
            <div className="data">
              <div className="amount">$63,489.50</div>
              <div className="info">Earning this year</div>
            </div>
          </div>

          <div className="chart_info">
            <div className="icon" style={{background:"#e6edf0"}} >
              <img src={icon_2} alt="" />
            </div>
            <div className="data">
              <div className="amount">$63,489.50</div>
              <div className="info">Earning this year</div>
            </div>
          </div>

          <div className="chart_info">
            <div className="icon" style={{background:"#e6edf0"}}>
              <img src={icon_3} alt="" />
            </div>
            <div className="data">
              <div className="amount">$63,489.50</div>
              <div className="info">Earning this year</div>
            </div>
          </div>

          <div className="chart-button-container">
        <button >View Full Report</button>
      </div>

        </div>
      </div>


    </div>
  );
};

export default ProfitExpensesChart;
