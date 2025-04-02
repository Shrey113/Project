import React, { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import './ActiveUsersChart.css'; 


const dailyActiveUsers = [
  { name: "Mon", activeUsers: 120, totalUsers: 500 },
  { name: "Wed", activeUsers: 170, totalUsers: 540 },
  { name: "Fri", activeUsers: 180, totalUsers: 560 },
  { name: "Sun", activeUsers: 200, totalUsers: 580 },
];


const monthlyActiveUsers = [
  { month: "Jan", activeUsers: 2000, totalUsers: 10000 },
  { month: "Mar", activeUsers: 2300, totalUsers: 10500 },
  { month: "May", activeUsers: 2700, totalUsers: 11000 },
  { month: "Jul", activeUsers: 3100, totalUsers: 12000 },
];

const ActiveUsersChart = () => {
  
  const [showDailyData, setShowDailyData] = useState(true);
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
  
  // Adjust bar gap and category gap based on screen size
  const getBarCategoryGap = () => {
    if (chartWidth <= 480) return "8%";
    if (chartWidth <= 576) return "10%";
    if (chartWidth <= 768) return "15%";
    return "20%";
  };
  
  const getBarGap = () => {
    if (chartWidth <= 480) return 1;
    if (chartWidth <= 576) return 2;
    if (chartWidth <= 768) return 3;
    return 5;
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
    <div className="active-users-chart">
      <h2 className="chart-title">{showDailyData ? "Active Users per Day" : "Active Users vs Total Users Over Time"}</h2>

      
    <div className="slider_con">
    <button className={`${showDailyData   && 'active'}`} onClick={() => setShowDailyData(true)}>
    Daily
            </button>
            <button className={`${showDailyData === false   && 'active'}`} onClick={() => setShowDailyData(false)}>
            Monthly
            </button> 

    </div>


      <div className="chart-container_ActiveUsersChart" style={{ boxShadow: 'none' }}>
        <ResponsiveContainer width="100%" height={getChartHeight()} style={{ boxShadow: 'none' }}>
          <BarChart data={showDailyData ? dailyActiveUsers : monthlyActiveUsers} 
              barCategoryGap={getBarCategoryGap()} 
              barGap={getBarGap()}  
              margin={getChartMargin()}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={showDailyData ? "name" : "month"} tick={{ fontSize: getFontSize() }} />
            <YAxis tick={{ fontSize: getFontSize() }} width={getYAxisWidth()} />
            <Tooltip contentStyle={{ fontSize: getFontSize() }} />
            <Legend wrapperStyle={{ fontSize: getFontSize() }} />
            <Bar dataKey="activeUsers" fill="#fa977c"  radius={[10, 10, 0, 0]} />
            <Bar dataKey="totalUsers" fill="#0085db"   radius={[10, 10, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ActiveUsersChart;
