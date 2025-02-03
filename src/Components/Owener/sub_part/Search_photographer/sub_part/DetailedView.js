import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";

function DetailedView() {
  const location = useLocation();

  useEffect(() => {
    const allData = location.state?.data;
    const type = location.state?.dataType;

    console.log("ssssssssssddddddddddddddddddd", allData);
    console.log("ytttttttttttttttttttttttt", type);
  });
  return <h1>Detailed view</h1>;
}

export default DetailedView;
