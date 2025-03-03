import React, { memo } from "react";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

const MenuItem = memo(({ 
  item, 
  index, 
  activeIndex, 
  handleItemClick,
  isMobile,
  set_is_sidebar_open,
  setActiveIndex,
  navigate
}) => {
  const isActive = index === Math.floor(activeIndex);
  const hasSubmenu = !!item.subMenu;
  const isSubmenuOpen = hasSubmenu && isActive;

  return (
    <React.Fragment>
      <div
        className={`item ${isActive ? "active" : ""}`}
        onClick={() => handleItemClick(index)}
      >
        <div className="icon">{item.icon}</div>
        <div className="text">{item.name}</div>
        {hasSubmenu && (
          <div className={`submenu-arrow ${isActive ? "open" : ""}`}>
            {isActive ? 
              <KeyboardArrowDownIcon className="arrow-icon" /> : 
              <KeyboardArrowRightIcon className="arrow-icon" />
            }
          </div>
        )}
      </div>
      
      {isSubmenuOpen && (
        <div className="sub-menu">
          {item.subMenu.map((subItem, subIndex) => (
            <div
              key={`${index}-${subIndex}`}
              className={`sub-item ${activeIndex === index + (subIndex + 1) / 10 ? "active" : ""}`}
              onClick={() => {
                setActiveIndex(index + (subIndex + 1) / 10);
                navigate(subItem.path);
                if (isMobile) {
                  set_is_sidebar_open(false);
                }
              }}
            >
              <div className="icon">{subItem.icon}</div>
              <div className="text">{subItem.name}</div>
            </div>
          ))}
        </div>
      )}
    </React.Fragment>
  );
});

export default MenuItem; 