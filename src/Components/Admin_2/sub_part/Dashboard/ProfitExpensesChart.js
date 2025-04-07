import React, { useState, useEffect } from "react";
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

import icon_1 from './sub_img/icon-biology.png'
import icon_2 from './sub_img/icon-erase.png'
import icon_3 from './sub_img/icon-globe.png'

const data = [
  { month: "Aug", profit: 60, expense: 70 },
  { month: "Sep", profit: 40, expense: 70 },
  { month: "Oct", profit: 30, expense: 50 },
  { month: "Nov", profit: 35, expense: 70 },
  { month: "Dec", profit: 35, expense: 60 },
  { month: "Jan", profit: 20, expense: 45 },
];

const ProfitExpensesChart = () => {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Adjust chart height based on screen size
  const getChartHeight = () => {
    if (windowWidth <= 480) {
      return 200;
    }
    return 300;
  };

  return (
    <div className="chart_container_Dashboard">
      <div className="chart-title">
        User Growth Chart
      </div>
      
      <div className="chart_con">
        <div className="chart">
          <ResponsiveContainer width="100%" height={getChartHeight()}>
            <BarChart data={data} barCategoryGap={windowWidth <= 480 ? 8 : 12}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" fontSize={windowWidth <= 480 ? 10 : 12} />
              <YAxis fontSize={windowWidth <= 480 ? 10 : 12} />
              <Tooltip cursor={{ fill: "rgba(200, 200, 200, 0.2)" }} />
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
              <div className="amount">Rs. 63,489.50</div>
              <div className="info">Earning this year</div>
            </div>
          </div>

          <div className="chart_info">
            <div className="icon" style={{background:"#e6edf0"}} >
              <img src={icon_2} alt="" />
            </div>
            <div className="data">
              <div className="amount">Rs. 63,489.50</div>
              <div className="info">Earning this year</div>
            </div>
          </div>

          <div className="chart_info">
            <div className="icon" style={{background:"#e6edf0"}}>
              <img src={icon_3} alt="" />
            </div>
            <div className="data">
              <div className="amount">Rs. 63,489.50</div>
              <div className="info">Earning this year</div>
            </div>
          </div>

          <div className="chart-button-container">
            <button>View Full Report</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfitExpensesChart;
