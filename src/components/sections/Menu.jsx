import { useState } from "react";
import MenuCategories from "../menu/MenuCategories";
import MenuGrid from "../menu/MenuGrid";

function Menu({ cartOpen }) {
  const [selectedCategory, setSelectedCategory] = useState("All");

  return (
    <div
      className="flex flex-col min-h-screen transition-all duration-300"
      style={{
        marginRight: cartOpen ? "380px" : "0", 
      }}
    >
      <MenuCategories 
        selected={selectedCategory} 
        onSelect={setSelectedCategory} 
      />
      <MenuGrid selectedCategory={selectedCategory} />
    </div>
  );
}

export default Menu;