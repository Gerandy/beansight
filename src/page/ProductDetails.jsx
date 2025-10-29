import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { db } from "../../firebase"; 
import { doc, getDoc } from "firebase/firestore";



function ProductDetails() {
  const { id } = useParams(); // ✅ Get Firestore doc ID from URL
  const [product, setProduct] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const docRef = doc(db, "inventory", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setProduct({ id: docSnap.id, ...docSnap.data() });
        } else {
          console.error("Product not found");
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      }
    };

    fetchProduct();
  }, [id]);

  if (!product) {
    return <p className="text-center mt-10">Loading...</p>;
  }

  return (
    <div className="max-w-4xl mx-auto mt-12 p-6 bg-white shadow-md rounded-2xl">
      <img
        src={product.img}
        alt={product.name}
        className="h-52 mx-auto object-contain"
      />
      <h1 className="mt-5 text-2xl font-bold">{product.name}</h1>
      <p className="text-lg font-semibold text-green-600">
        ₱ {product.price}.00
      </p>

      <button className="mt-6 bg-yellow-900 text-white py-3 px-6 rounded-xl w-full font-semibold hover:bg-yellow-800">
        Add to Cart
      </button>
    </div>
  );
}

export default ProductDetails;
