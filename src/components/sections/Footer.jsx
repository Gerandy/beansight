function Footer() {
  return (
    <footer className="bg-gradient-to-r from-coffee-700 to-coffee-600  py-8">
      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center md:items-start gap-6">

        
        <div className="flex-shrink-0">
          <img src="src/assets/ahjinlogo.png" alt="logo" className="h-25" />
        </div>

        
        <div className="flex gap-12 text-sm">
          <div className="flex flex-col gap-2">
            <a href="#" className="hover:underline">About</a>
            <a href="#" className="hover:underline">Terms & Conditions</a>
          </div>
          <div className="flex flex-col gap-2">
            <a href="#" className="hover:underline">Contact Us</a>
            <a href="#" className="hover:underline">Privacy Policy</a>
          </div>
        </div>

        
        <div className="text-center md:text-left flex items-center gap-4">
          <p className="text-white font-bold">For news and updates, follow us</p>
          <div className="flex items-center">
            <image src="src/assets/1.png" alt="Social Media Icons" className="h-8 mt-2 mx-auto md:mx-0" />
            <image src="src/assets/2.png" alt="Social Media Icons" className="h-8 mt-2 mx-auto md:mx-0" />
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

