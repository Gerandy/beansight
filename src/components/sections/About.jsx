import { Coffee, Heart, Users, Award } from "lucide-react";

function About() {
  return (
    <div className="min-h-screen mt-15">
      <div className="max-w-6xl mx-auto px-4 py-16">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-coffee-800 mb-4">About Solace Coffee</h1>
          <p className="text-xl text-coffee-600 max-w-3xl mx-auto">
            Brewing excellence since day one, delivering premium coffee experiences to our community
          </p>
        </div>

        {/* Story Section */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-12">
          <h2 className="text-3xl font-bold text-coffee-800 mb-6">Our Story</h2>
          <div className="space-y-4 text-gray-700 leading-relaxed">
            <p>
              Welcome to Solace Coffee, where every cup tells a story of passion, quality, and community. 
              What started as a dream to create the perfect coffee experience has evolved into a beloved 
              gathering place for coffee enthusiasts and casual visitors alike.
            </p>
            <p>
              We believe that great coffee is more than just a beverage – it's an experience that brings 
              people together, sparks conversations, and creates moments of joy in everyday life. Our 
              commitment to sourcing the finest beans and perfecting our craft ensures that every visit 
              to Solace is a memorable one.
            </p>
            <p>
              From our carefully curated menu to our warm and welcoming atmosphere, everything we do is 
              designed to provide you with a moment of solace in your busy day. Whether you're catching 
              up with friends, working on your next big project, or simply enjoying a quiet moment alone, 
              we're here to make your experience exceptional.
            </p>
          </div>
        </div>

        {/* Values Section */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="flex justify-center mb-4">
              <Coffee className="h-12 w-12 text-coffee-600" />
            </div>
            <h3 className="text-xl font-bold text-coffee-800 mb-3">Quality First</h3>
            <p className="text-gray-600">
              We source only the finest beans from sustainable farms around the world
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="flex justify-center mb-4">
              <Heart className="h-12 w-12 text-coffee-600" />
            </div>
            <h3 className="text-xl font-bold text-coffee-800 mb-3">Made with Love</h3>
            <p className="text-gray-600">
              Every drink is crafted with care and attention to detail by our skilled baristas
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="flex justify-center mb-4">
              <Users className="h-12 w-12 text-coffee-600" />
            </div>
            <h3 className="text-xl font-bold text-coffee-800 mb-3">Community Focused</h3>
            <p className="text-gray-600">
              We're proud to be a gathering place where neighbors become friends
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="flex justify-center mb-4">
              <Award className="h-12 w-12 text-coffee-600" />
            </div>
            <h3 className="text-xl font-bold text-coffee-800 mb-3">Award Winning</h3>
            <p className="text-gray-600">
              Recognized for excellence in coffee preparation and customer service
            </p>
          </div>
        </div>

        {/* Mission Section */}
        <div className="bg-gradient-to-r from-coffee-700 to-coffee-600 rounded-lg shadow-lg p-8 text-white">
          <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
          <p className="text-lg leading-relaxed">
            To provide an exceptional coffee experience that enriches the daily lives of our customers 
            while fostering a sense of community and connection. We are committed to sustainability, 
            quality, and creating a welcoming space where everyone feels at home.
          </p>
        </div>

        {/* Contact Section */}
        <div className="mt-12 text-center">
          <h2 className="text-3xl font-bold text-coffee-800 mb-6">Get in Touch</h2>
          <p className="text-gray-700 mb-4">
            Have questions or feedback? We'd love to hear from you!
          </p>
          <p className="text-coffee-600 font-semibold">
            Visit us in-store or reach out through our social media channels
          </p>
        </div>
      </div>
    </div>
  );
}

export default About;
