function Footer() {
  return (
    <footer className="bg-yellow-950 py-8">
      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center md:items-start gap-6">

        
        <div className="flex-shrink-0">
          <img src="src/assets/ahjinlogo.png" alt="logo" className="h-25" />
        </div>

        
        <div className="flex gap-12 text-sm">
          <div className="flex flex-col gap-2">
            <a href="#" className="hover:underline">About</a>
            <a href="#" className="hover:underline"></a>
            <a href="#" className="hover:underline"></a>
            <a href="#" className="hover:underline"></a>
          </div>
          <div className="flex flex-col gap-2">
            <a href="#" className="hover:underline">Contact Us</a>
            <a href="#" className="hover:underline">Terms & Conditions</a>
            <a href="#" className="hover:underline">Privacy Policy</a>
          </div>
        </div>

        
        <div className="text-center md:text-left">
          <p className="text-red-600 font-bold">For news and updates, follow us</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

