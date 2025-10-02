import MenuCategories from "../MenuCategories";
import MenuGrid from "../MenuGrid";

function Menu({ cartOpen }) {
  return (
    <div
      className="flex flex-col min-h-screen transition-all duration-300"
      style={{
        marginRight: cartOpen ? "380px" : "0", // Adjust width to match sidebar
      }}
    >
      <MenuCategories />
      <MenuGrid />
    </div>
  );
}

export default Menu;