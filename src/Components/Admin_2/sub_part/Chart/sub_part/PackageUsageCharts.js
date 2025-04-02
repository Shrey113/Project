import React, { useState, useEffect } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import './PackageUsageCharts.css'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';


ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const PackageUsageCharts = () => {
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
  
  const lineData = {
    labels: ['January', 'February', 'March', 'April', 'May', 'June'],
    datasets: [
      {
        label: 'Monthly User Growth',
        data: [65, 59, 80, 81, 56, 55],
        borderColor: 'rgba(75,192,192,1)',
        backgroundColor: 'rgba(75,192,192,0.2)',
        fill: true,
        borderWidth: chartWidth <= 480 ? 1 : 2,
      },
    ],
  };

  // import pi
  // const pieData = {
  //   labels: ['Package A', 'Package B', 'Package C', 'Package D'],
  //   datasets: [
  //     {
  //       data: [300, 50, 100, 75],
  //       backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
  //       hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
  //     },
  //   ],
  // };

  
  const barData = {
    labels: ['Package A', 'Package B', 'Package C', 'Package D'],
    datasets: [
      {
        label: 'Number of Users',
        data: [150, 200, 120, 250],
        backgroundColor: '#FF6384',
        borderRadius: chartWidth <= 480 ? 3 : 5,
        barThickness: chartWidth <= 480 ? 40 : chartWidth <= 576 ? 50 : chartWidth <= 768 ? 60 : 80,
      },
      {
        label: 'Free Trial Users',
        data: [50, 40, 60, 30],
        backgroundColor: '#36A2EB',
        borderRadius: chartWidth <= 480 ? 3 : 5,
        barThickness: chartWidth <= 480 ? 40 : chartWidth <= 576 ? 50 : chartWidth <= 768 ? 60 : 80,
      },
    ],
  };

  // Get font size based on screen width
  const getFontSize = () => {
    if (chartWidth <= 480) return 8;
    if (chartWidth <= 576) return 10;
    if (chartWidth <= 768) return 11;
    return 12;
  };
  
  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        stacked: true,
        ticks: {
          font: {
            size: getFontSize()
          }
        }
      },
      y: {
        stacked: true,
        ticks: {
          font: {
            size: getFontSize()
          }
        }
      },
    },
    plugins: {
      legend: {
        labels: {
          font: {
            size: getFontSize()
          },
          boxWidth: chartWidth <= 480 ? 10 : chartWidth <= 576 ? 12 : 15
        },
        display: chartWidth > 480
      },
      tooltip: {
        bodyFont: {
          size: getFontSize()
        },
        titleFont: {
          size: getFontSize()
        }
      }
    }
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        ticks: {
          font: {
            size: getFontSize()
          }
        }
      },
      y: {
        ticks: {
          font: {
            size: getFontSize()
          }
        }
      }
    },
    plugins: {
      legend: {
        labels: {
          font: {
            size: getFontSize()
          },
          boxWidth: chartWidth <= 480 ? 10 : chartWidth <= 576 ? 12 : 15
        },
        display: chartWidth > 480
      },
      tooltip: {
        bodyFont: {
          size: getFontSize()
        },
        titleFont: {
          size: getFontSize()
        }
      }
    }
  };

  // Determine chart height based on screen size
  const getChartHeight = () => {
    if (chartWidth <= 480) return '160px';
    if (chartWidth <= 576) return '200px';
    if (chartWidth <= 768) return '250px';
    return '300px';
  };

  return (
    <div className="charts-container_PackageUsage">
  <h2 className="charts-title">Package Usage Overview</h2>

  <div className="chart-section_1">
      <div className="chart">
        <h3>Number of Users Subscribed to Each Package (Stacked Bar Chart)</h3>
        <br />
        <div style={{ height: getChartHeight() }}>
          <Bar data={barData} options={barOptions} />
        </div>
      </div>
  </div>

  <div className="hr_line"></div>

  <div className="chart-section_1">
    <div className="chart">
    <h3>Monthly User Growth (Line Chart)</h3>
    <br /> 
    <div style={{ height: getChartHeight() }}>
      <Line data={lineData} options={lineOptions} />
    </div>
    </div>
  </div>
</div>

  );
};

export default PackageUsageCharts;


