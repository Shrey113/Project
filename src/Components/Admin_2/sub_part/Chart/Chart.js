import React, { useEffect } from 'react'
import './Charts.css'

// import ChartWithData from './sub_part/ChartWithData'
import ProfitExpensesChart from './sub_part/ProfitExpensesChart'
// import UserGrowthChart from './sub_part/UserGrowthChart'
import ActiveUsersChart from './sub_part/ActiveUsersChart'
import PackageUsageCharts from './sub_part/PackageUsageCharts'

function Charts() {
  // Add viewport meta tag for proper responsive behavior
  useEffect(() => {
    // Check if viewport meta tag exists
    let viewportMeta = document.querySelector('meta[name="viewport"]');
    
    // If it doesn't exist, create it
    if (!viewportMeta) {
      viewportMeta = document.createElement('meta');
      viewportMeta.name = 'viewport';
      viewportMeta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
      document.getElementsByTagName('head')[0].appendChild(viewportMeta);
    } else {
      // If it exists, ensure it has the correct content
      viewportMeta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
    }
  }, []);

  return (
    <div className='Chart_id'>
      <div className='section_2'>
      {/* <ChartWithData/> */}
      <ActiveUsersChart/>
      <ProfitExpensesChart/>
      </div>

      <PackageUsageCharts/>
      <div className='section_1'>
        <br />
      
      {/* <UserGrowthChart/>  */}
      </div>


      

    </div>
  )
}

export default Charts
